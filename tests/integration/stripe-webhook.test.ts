import { randomUUID } from "crypto";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import Stripe from "stripe";
import { prisma } from "@/lib/db/prisma";
import {
  createTestPractitionerWithService,
  createTestClient,
  createPendingAppointment,
  cleanupPractitionerFixture,
  cleanupClient,
  cleanupAppointment,
  cleanupWebhookEventsByIds,
  type TestPractitionerFixture,
} from "./helpers";

const ensureZoomMeetingForAppointment = vi.fn().mockResolvedValue(undefined);
const sendBookingConfirmationEmails = vi.fn().mockResolvedValue(undefined);

// The webhook route dynamically `import()`s these two modules from inside
// its fire-and-forget post-confirmation step. Mocking them keeps this test
// fast/offline and lets us assert they're triggered exactly once per real
// confirmation (never on a duplicate or out-of-order delivery).
vi.mock("@/lib/video/zoom", () => ({ ensureZoomMeetingForAppointment }));
vi.mock("@/lib/email/send", () => ({ sendBookingConfirmationEmails }));

const { POST: webhook } = await import("@/app/api/webhooks/stripe/route");

function buildStripeEvent(type: string, dataObject: object) {
  return {
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
}

function buildSignedWebhookRequest(event: object): Request {
  const rawBody = JSON.stringify(event);
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const signatureHeader = stripe.webhooks.generateTestHeaderString({
    payload: rawBody,
    secret: process.env.STRIPE_WEBHOOK_SECRET!,
  });
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers: { "content-type": "application/json", "stripe-signature": signatureHeader },
    body: rawBody,
  });
}

describe("Stripe webhook — idempotency and out-of-order delivery", () => {
  let fixture: TestPractitionerFixture;
  let clientId: string;
  const createdEventIds: string[] = [];
  const createdAppointmentIds: string[] = [];

  beforeAll(async () => {
    fixture = await createTestPractitionerWithService({ withAvailability: false });
    clientId = await createTestClient();
  });

  afterEach(() => {
    ensureZoomMeetingForAppointment.mockClear();
    sendBookingConfirmationEmails.mockClear();
  });

  afterAll(async () => {
    await cleanupWebhookEventsByIds(createdEventIds);
    for (const appointmentId of createdAppointmentIds) {
      await cleanupAppointment(appointmentId);
    }
    await cleanupClient(clientId);
    await cleanupPractitionerFixture(fixture);
  });

  it("confirms the appointment on first delivery, then no-ops on a duplicate redelivery", async () => {
    const { appointment } = await createPendingAppointment({
      practitionerId: fixture.practitionerId,
      serviceId: fixture.serviceId,
      clientId,
    });
    createdAppointmentIds.push(appointment.id);

    const event = buildStripeEvent("checkout.session.completed", {
      id: `cs_test_${randomUUID()}`,
      object: "checkout.session",
      payment_intent: `pi_test_${randomUUID()}`,
      metadata: { appointmentId: appointment.id },
    });
    createdEventIds.push(event.id);

    const firstResponse = await webhook(buildSignedWebhookRequest(event));
    expect(firstResponse.status).toBe(200);
    const firstBody = await firstResponse.json();
    expect(firstBody).toEqual({ received: true });

    const confirmed = await prisma.appointment.findUniqueOrThrow({ where: { id: appointment.id } });
    expect(confirmed.status).toBe("CONFIRMED");
    expect(confirmed.paymentStatus).toBe("SUCCEEDED");
    expect(ensureZoomMeetingForAppointment).toHaveBeenCalledTimes(1);
    expect(ensureZoomMeetingForAppointment).toHaveBeenCalledWith(appointment.id);
    expect(sendBookingConfirmationEmails).toHaveBeenCalledTimes(1);

    const webhookEvent = await prisma.stripeWebhookEvent.findUniqueOrThrow({ where: { stripeEventId: event.id } });
    expect(webhookEvent.status).toBe("PROCESSED");

    // Stripe redelivers on retries/at-least-once semantics — the exact same
    // event id arrives a second time.
    const secondResponse = await webhook(buildSignedWebhookRequest(event));
    expect(secondResponse.status).toBe(200);
    const secondBody = await secondResponse.json();
    expect(secondBody).toEqual({ received: true, duplicate: true });

    // No reprocessing occurred: side effects fired only once (from the first
    // delivery) and the appointment wasn't touched again.
    expect(ensureZoomMeetingForAppointment).toHaveBeenCalledTimes(1);
    expect(sendBookingConfirmationEmails).toHaveBeenCalledTimes(1);
    const historyCount = await prisma.appointmentStatusHistory.count({ where: { appointmentId: appointment.id } });
    expect(historyCount).toBe(1);

    const stillOnlyOneWebhookRow = await prisma.stripeWebhookEvent.count({ where: { stripeEventId: event.id } });
    expect(stillOnlyOneWebhookRow).toBe(1);
  });

  it("ignores a payment_intent.payment_failed event that arrives after the appointment was already confirmed", async () => {
    // A distinct start time is required: the practitioner has a DB-level
    // exclusion constraint preventing two overlapping "active" appointments.
    const { appointment, payment } = await createPendingAppointment({
      practitionerId: fixture.practitionerId,
      serviceId: fixture.serviceId,
      clientId,
      startAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    });
    createdAppointmentIds.push(appointment.id);

    // Confirm it directly (simulating an earlier, already-processed
    // checkout.session.completed) so this test only exercises the
    // out-of-order-delivery branch, not the confirmation path itself.
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "CONFIRMED", paymentStatus: "SUCCEEDED" },
    });
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "SUCCEEDED" } });

    const paymentIntentId = `pi_test_${randomUUID()}`;
    const event = buildStripeEvent("payment_intent.payment_failed", {
      id: paymentIntentId,
      object: "payment_intent",
      metadata: { appointmentId: appointment.id },
      last_payment_error: { message: "Your card was declined." },
    });
    createdEventIds.push(event.id);

    const response = await webhook(buildSignedWebhookRequest(event));
    expect(response.status).toBe(200);

    const afterDelayedFailure = await prisma.appointment.findUniqueOrThrow({ where: { id: appointment.id } });
    // Still confirmed — the delayed failure event must not undo a
    // confirmation that already happened.
    expect(afterDelayedFailure.status).toBe("CONFIRMED");
    expect(afterDelayedFailure.paymentStatus).toBe("SUCCEEDED");

    const historyCount = await prisma.appointmentStatusHistory.count({ where: { appointmentId: appointment.id } });
    expect(historyCount).toBe(0);
  });

  it("rejects a delivery with an invalid signature", async () => {
    const event = buildStripeEvent("checkout.session.completed", {
      id: `cs_test_${randomUUID()}`,
      object: "checkout.session",
      metadata: {},
    });
    const rawBody = JSON.stringify(event);
    const response = await webhook(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: { "content-type": "application/json", "stripe-signature": "t=1,v1=deadbeef" },
        body: rawBody,
      }),
    );
    expect(response.status).toBe(400);

    const stored = await prisma.stripeWebhookEvent.findUnique({ where: { stripeEventId: event.id } });
    expect(stored).toBeNull();
  });
});
