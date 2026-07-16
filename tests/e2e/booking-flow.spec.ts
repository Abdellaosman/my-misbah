import "./load-env";

import { randomUUID } from "crypto";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { expect, test } from "@playwright/test";
import Stripe from "stripe";
import { getDbClient } from "./db";
import { generateE2EClientEmail, type E2EFixture } from "./fixtures";

const FIXTURE_PATH = path.join(__dirname, ".fixture.json");

function loadFixture(): E2EFixture {
  if (!existsSync(FIXTURE_PATH)) {
    throw new Error("E2E fixture not found — did global setup run?");
  }
  return JSON.parse(readFileSync(FIXTURE_PATH, "utf-8")) as E2EFixture;
}

/** Builds a real, HMAC-signed Stripe event body + header, exactly like the
 * webhook route's own integration tests (tests/integration/stripe-webhook.test.ts). */
function signStripeEvent(dataObject: object, type: string) {
  const event = {
    id: `evt_test_${randomUUID()}`,
    object: "event",
    type,
    api_version: "2024-06-20",
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 0,
    request: { id: null, idempotency_key: null },
    data: { object: dataObject },
  };
  const rawBody = JSON.stringify(event);
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const signature = stripe.webhooks.generateTestHeaderString({
    payload: rawBody,
    secret: process.env.STRIPE_WEBHOOK_SECRET!,
  });
  return { rawBody, signature };
}

test.describe("Full booking flow", () => {
  test("visitor books, pays, and sees a confirmed appointment after Stripe confirms payment", async ({
    page,
    request,
    baseURL,
  }) => {
    const fixture = loadFixture();
    const clientEmail = generateE2EClientEmail();

    // Any day works (the fixture is a fully-open 24/7 UTC schedule) — pick
    // tomorrow so there's no risk of the current UTC day already being past
    // its last slot by the time this runs.
    const tomorrowIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    await page.goto(`/book/${fixture.practitionerSlug}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Book with E2E Test Guide");

    // Step 1 — choose the seeded service.
    await page.getByTestId(`service-option-${fixture.serviceId}`).click();

    // Step 2 — pick tomorrow, then the first available time slot.
    await expect(page.getByRole("heading", { name: "Pick a date & time" })).toBeVisible();
    await page.getByTestId(`day-option-${tomorrowIso}`).click();
    const firstSlot = page.locator('[data-testid^="slot-option-"]').first();
    await expect(firstSlot).toBeVisible({ timeout: 15_000 });
    await firstSlot.click();

    // Step 3 — intake details + consent (the reservation call above already
    // succeeded by the time this step renders).
    await expect(page.getByRole("heading", { name: "Your details" })).toBeVisible();
    await page.getByLabel("First name").fill("Playwright");
    await page.getByLabel("Last name").fill("Tester");
    await page.getByLabel("Email").fill(clientEmail);
    await page.getByLabel("What would you like guidance on?").fill("A test topic for the E2E suite.");
    await page.getByLabel("Please describe your situation").fill("This is an automated end-to-end test booking.");
    await page.locator('input[type="checkbox"]').check();
    await page.getByTestId("intake-submit-button").click();

    // Step 4 — review & pay. The checkout API call uses the fake payment
    // provider (PAYMENTS_PROVIDER=fake), so clicking "pay" sends the browser
    // straight to the confirmation page without ever leaving our own origin.
    await expect(page.getByRole("heading", { name: "Review & pay" })).toBeVisible();
    await page.getByTestId("pay-button").click();
    await page.waitForURL(/\/book\/confirmation\?appointment=/, { timeout: 15_000 });

    const publicId = new URL(page.url()).searchParams.get("appointment");
    expect(publicId).toBeTruthy();

    const db = await getDbClient();
    const pendingRows = await db.query<{ id: string; status: string; practitionerId: string }>(
      `SELECT id, status, "practitionerId" FROM "Appointment" WHERE "publicId" = $1`,
      [publicId],
    );
    const pendingAppointment = pendingRows.rows[0];
    expect(pendingAppointment).toBeDefined();
    expect(pendingAppointment.status).toBe("PENDING_PAYMENT");
    expect(pendingAppointment.practitionerId).toBe(fixture.practitionerId);

    // The browser is now polling /api/public/appointments/[publicId] every
    // few seconds waiting for a status change (see ConfirmationStatus.tsx).
    // Nothing will ever confirm it without a real Stripe webhook delivery —
    // so this test sends one itself, signed with the same secret the app
    // verifies against, exactly as Stripe would.
    const { rawBody, signature } = signStripeEvent(
      {
        id: `cs_test_${randomUUID()}`,
        object: "checkout.session",
        payment_intent: `pi_test_${randomUUID()}`,
        metadata: { appointmentId: pendingAppointment.id },
      },
      "checkout.session.completed",
    );

    const webhookResponse = await request.post(`${baseURL}/api/webhooks/stripe`, {
      headers: { "content-type": "application/json", "stripe-signature": signature },
      data: rawBody,
    });
    expect(webhookResponse.ok()).toBe(true);

    // The confirmation page's client-side poll should now pick up the
    // change and render the confirmed state.
    await expect(page.getByRole("heading", { name: "Booking Confirmed" })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("E2E Test Guide")).toBeVisible();
    await expect(page.getByText("E2E Test Consultation")).toBeVisible();

    const confirmedRows = await db.query<{ status: string; paymentStatus: string }>(
      `SELECT status, "paymentStatus" FROM "Appointment" WHERE id = $1`,
      [pendingAppointment.id],
    );
    expect(confirmedRows.rows[0]?.status).toBe("CONFIRMED");
    expect(confirmedRows.rows[0]?.paymentStatus).toBe("SUCCEEDED");

    const paymentRows = await db.query<{ status: string }>(
      `SELECT status FROM "Payment" WHERE "appointmentId" = $1`,
      [pendingAppointment.id],
    );
    expect(paymentRows.rows[0]?.status).toBe("SUCCEEDED");

    const clientRows = await db.query<{ id: string }>(`SELECT id FROM "Client" WHERE email = $1`, [clientEmail]);
    expect(clientRows.rows).toHaveLength(1);
  });
});
