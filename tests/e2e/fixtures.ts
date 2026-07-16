import "./load-env";

import { randomUUID } from "crypto";
import { getDbClient } from "./db";

export interface E2EFixture {
  userId: string;
  practitionerId: string;
  practitionerSlug: string;
  serviceId: string;
}

const CLIENT_EMAIL_PREFIX = "e2e-client-";

export function generateE2EClientEmail(): string {
  return `${CLIENT_EMAIL_PREFIX}${randomUUID()}@test.local`;
}

/**
 * Seeds a single fully-open (24/7, UTC) practitioner + service so the E2E
 * spec never has to fight real-world availability windows or timezones —
 * every slot the app can generate is bookable.
 */
export async function seedE2EFixture(): Promise<E2EFixture> {
  const db = await getDbClient();
  const now = new Date();
  const suffix = randomUUID();

  const userId = randomUUID();
  await db.query(
    `INSERT INTO "User" (id, email, "passwordHash", role, status, "createdAt", "updatedAt")
     VALUES ($1, $2, 'not-a-real-hash', 'PRACTITIONER', 'ACTIVE', $3, $3)`,
    [userId, `e2e-practitioner-${suffix}@test.local`, now],
  );

  const practitionerId = randomUUID();
  const practitionerSlug = `e2e-practitioner-${suffix}`;
  await db.query(
    `INSERT INTO "PractitionerProfile" (id, "userId", slug, "displayName", timezone, "approvalStatus", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, 'E2E Test Guide', 'UTC', 'APPROVED', $4, $4)`,
    [practitionerId, userId, practitionerSlug, now],
  );

  const serviceId = randomUUID();
  await db.query(
    `INSERT INTO "Service"
       (id, "practitionerId", name, slug, description, "durationMinutes", price, currency,
        "isVirtual", "isActive", "approvalStatus", "minNoticeMinutes", "maxAdvanceDays",
        "bufferBeforeMinutes", "bufferAfterMinutes", "cancellationWindowHours", "createdAt", "updatedAt")
     VALUES
       ($1, $2, 'E2E Test Consultation', 'e2e-test-consultation',
        'A test consultation used only by the Playwright E2E suite.', 30, 40.00, 'usd',
        true, true, 'APPROVED', 0, 3650, 0, 0, 48, $3, $3)`,
    [serviceId, practitionerId, now],
  );

  for (let weekday = 0; weekday <= 6; weekday++) {
    await db.query(
      `INSERT INTO "AvailabilityRule" (id, "practitionerId", weekday, "startMinute", "endMinute", "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, 0, 1440, true, $4, $4)`,
      [randomUUID(), practitionerId, weekday, now],
    );
  }

  await db.query(
    `INSERT INTO "SystemSetting" (key, value, "updatedAt")
     VALUES ('consent_docs', $1::jsonb, $2)
     ON CONFLICT (key) DO NOTHING`,
    [
      JSON.stringify({
        version: "e2e-v1",
        disclaimer: "E2E test disclaimer text.",
        privacySummary: "E2E test privacy summary.",
        cancellationSummary: "E2E test cancellation summary.",
        consentToConsult: "I consent to this E2E test booking.",
      }),
      now,
    ],
  );

  return { userId, practitionerId, practitionerSlug, serviceId };
}

/** Deletion order matters: it mirrors the schema's FK referential actions
 * (RESTRICT/CASCADE) — see prisma/migrations/*_init/migration.sql. */
export async function cleanupE2EFixture(fixture: E2EFixture): Promise<void> {
  const db = await getDbClient();
  await db.query(
    `DELETE FROM "ZoomMeeting" WHERE "appointmentId" IN (SELECT id FROM "Appointment" WHERE "practitionerId" = $1)`,
    [fixture.practitionerId],
  );
  await db.query(
    `DELETE FROM "Payment" WHERE "appointmentId" IN (SELECT id FROM "Appointment" WHERE "practitionerId" = $1)`,
    [fixture.practitionerId],
  );
  await db.query(`DELETE FROM "Appointment" WHERE "practitionerId" = $1`, [fixture.practitionerId]);
  await db.query(`DELETE FROM "BookingReservation" WHERE "practitionerId" = $1`, [fixture.practitionerId]);
  await db.query(`DELETE FROM "PractitionerProfile" WHERE id = $1`, [fixture.practitionerId]);
  await db.query(`DELETE FROM "User" WHERE id = $1`, [fixture.userId]);
  await db.query(`DELETE FROM "Client" WHERE email LIKE $1`, [`${CLIENT_EMAIL_PREFIX}%`]);
}
