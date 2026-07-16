import { randomUUID } from "crypto";
import { prisma } from "@/lib/db/prisma";

/**
 * Shared fixture builders for integration tests that hit the real (test)
 * Postgres database. Every fixture uses a random suffix so parallel test
 * files never collide, and each builder pairs with a `cleanup*` helper that
 * deletes rows in an order that respects the schema's foreign-key
 * referential actions (see prisma/schema.prisma).
 */

export interface TestPractitionerFixture {
  userId: string;
  practitionerId: string;
  serviceId: string;
}

export interface CreateTestPractitionerOptions {
  minNoticeMinutes?: number;
  maxAdvanceDays?: number;
  durationMinutes?: number;
  price?: string;
  /** Defaults to a fully-open Sun-Sat, 00:00-24:00 UTC schedule. */
  withAvailability?: boolean;
}

export async function createTestPractitionerWithService(
  options: CreateTestPractitionerOptions = {},
): Promise<TestPractitionerFixture> {
  const suffix = randomUUID();
  const user = await prisma.user.create({
    data: {
      email: `practitioner-${suffix}@test.local`,
      passwordHash: "not-a-real-hash",
      role: "PRACTITIONER",
      status: "ACTIVE",
    },
  });

  const profile = await prisma.practitionerProfile.create({
    data: {
      userId: user.id,
      slug: `test-practitioner-${suffix}`,
      displayName: "Test Practitioner",
      timezone: "UTC",
      approvalStatus: "APPROVED",
    },
  });

  const service = await prisma.service.create({
    data: {
      practitionerId: profile.id,
      name: "Test Service",
      slug: "test-service",
      description: "A test service used for integration tests.",
      durationMinutes: options.durationMinutes ?? 60,
      price: options.price ?? "50.00",
      currency: "usd",
      isActive: true,
      approvalStatus: "APPROVED",
      minNoticeMinutes: options.minNoticeMinutes ?? 0,
      maxAdvanceDays: options.maxAdvanceDays ?? 3650,
    },
  });

  if (options.withAvailability !== false) {
    await prisma.availabilityRule.createMany({
      data: [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
        practitionerId: profile.id,
        weekday,
        startMinute: 0,
        endMinute: 24 * 60,
      })),
    });
  }

  return { userId: user.id, practitionerId: profile.id, serviceId: service.id };
}

export async function cleanupPractitionerFixture(fixture: TestPractitionerFixture): Promise<void> {
  await prisma.appointment.deleteMany({ where: { practitionerId: fixture.practitionerId } });
  await prisma.bookingReservation.deleteMany({ where: { practitionerId: fixture.practitionerId } });
  await prisma.availabilityRule.deleteMany({ where: { practitionerId: fixture.practitionerId } });
  await prisma.service.deleteMany({ where: { practitionerId: fixture.practitionerId } });
  await prisma.practitionerProfile.delete({ where: { id: fixture.practitionerId } });
  await prisma.user.delete({ where: { id: fixture.userId } });
}

export async function createTestClient(): Promise<string> {
  const suffix = randomUUID();
  const client = await prisma.client.create({
    data: {
      firstName: "Test",
      lastName: "Client",
      email: `client-${suffix}@test.local`,
      timezone: "UTC",
    },
  });
  return client.id;
}

export async function cleanupClient(clientId: string): Promise<void> {
  await prisma.client.deleteMany({ where: { id: clientId } });
}

export interface CreatePendingAppointmentOptions {
  practitionerId: string;
  serviceId: string;
  clientId: string;
  startAt?: Date;
  priceAmount?: string;
  currency?: string;
}

/**
 * Creates an appointment in the same shape the checkout flow produces right
 * before Stripe confirms payment: `PENDING_PAYMENT` + a `REQUIRES_PAYMENT`
 * Payment row, no reservation needed since webhook tests don't exercise the
 * availability engine.
 */
export async function createPendingAppointment(options: CreatePendingAppointmentOptions) {
  const startAt = options.startAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000);
  const endAt = new Date(startAt.getTime() + 60 * 60 * 1000);

  const appointment = await prisma.appointment.create({
    data: {
      publicId: randomUUID(),
      practitionerId: options.practitionerId,
      serviceId: options.serviceId,
      clientId: options.clientId,
      startAt,
      endAt,
      clientTimezone: "UTC",
      practitionerTimezone: "UTC",
      priceAmount: options.priceAmount ?? "50.00",
      currency: options.currency ?? "usd",
      status: "PENDING_PAYMENT",
      paymentStatus: "REQUIRES_PAYMENT",
    },
  });

  const payment = await prisma.payment.create({
    data: {
      appointmentId: appointment.id,
      amount: options.priceAmount ?? "50.00",
      currency: options.currency ?? "usd",
      status: "REQUIRES_PAYMENT",
      idempotencyKey: `test-${randomUUID()}`,
    },
  });

  return { appointment, payment };
}

export async function cleanupAppointment(appointmentId: string): Promise<void> {
  await prisma.refund.deleteMany({ where: { payment: { appointmentId } } });
  await prisma.payment.deleteMany({ where: { appointmentId } });
  await prisma.zoomMeeting.deleteMany({ where: { appointmentId } });
  await prisma.internalNote.deleteMany({ where: { appointmentId } });
  await prisma.appointment.deleteMany({ where: { id: appointmentId } });
}

export async function cleanupWebhookEventsByIds(eventIds: string[]): Promise<void> {
  if (eventIds.length === 0) return;
  await prisma.stripeWebhookEvent.deleteMany({ where: { stripeEventId: { in: eventIds } } });
}
