import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withErrorHandling, ConflictError, NotFoundError, AppError, RateLimitedError } from "@/lib/http/errors";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { generatePublicReference } from "@/lib/crypto/tokens";
import { paymentProvider, toMinorUnits } from "@/lib/payments/stripe";
import { isExclusionViolation } from "@/lib/db/errors";
import { logger } from "@/lib/logger";
import type { Appointment, Client, PractitionerProfile, Service } from "@/generated/prisma/client";

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Creates (or re-creates, if a prior attempt never got far enough to store a
 * session id) the Stripe Checkout Session for an already-created
 * PENDING_PAYMENT appointment, and persists the session id on its Payment
 * row. Reuses the same deterministic idempotency key every time so retries
 * can never double-charge, even across separate appointment rows created by
 * a prior failed attempt at a different reservation (not expected, but the
 * key is scoped to the appointment id to stay safe either way).
 */
async function startCheckoutForAppointment(
  appointment: Appointment,
  service: Service,
  practitioner: PractitionerProfile,
  client: Client,
): Promise<{ checkoutUrl: string; appointmentPublicId: string }> {
  const idempotencyKey = `appointment-checkout:${appointment.id}`;
  try {
    const checkoutSession = await paymentProvider.createCheckoutSession({
      idempotencyKey,
      appointmentPublicId: appointment.publicId,
      practitionerName: practitioner.displayName,
      serviceName: service.name,
      amountMinorUnits: toMinorUnits(appointment.priceAmount.toString()),
      currency: appointment.currency,
      customerEmail: client.email,
      successUrl: `${appUrl()}/book/confirmation?appointment=${appointment.publicId}`,
      cancelUrl: `${appUrl()}/book/${practitioner.slug}?service=${service.id}&cancelled=1`,
      metadata: { appointmentId: appointment.id, reservationId: appointment.reservationId ?? "", publicId: appointment.publicId },
    });

    await prisma.payment.update({
      where: { appointmentId: appointment.id },
      data: { stripeCheckoutSessionId: checkoutSession.providerSessionId },
    });

    return { checkoutUrl: checkoutSession.url, appointmentPublicId: appointment.publicId };
  } catch (err) {
    // The appointment/payment rows stay in PENDING_PAYMENT/REQUIRES_PAYMENT;
    // the cron sweep (lib/jobs/expire-pending-payments) will eventually
    // release the slot if the client never returns to retry.
    logger.error("Failed to create Stripe Checkout Session", { err, appointmentId: appointment.id });
    throw new AppError("Could not start checkout. Please try again.", 502, "checkout_failed");
  }
}

export const POST = withErrorHandling(async (
  request: Request,
  { params }: { params: Promise<{ reservationId: string }> },
) => {
  const { reservationId } = await params;
  const ip = getClientIp(request.headers);

  const rateLimit = await checkRateLimit({
    action: "booking-checkout",
    identifier: ip,
    limit: 15,
    windowSeconds: 10 * 60,
  });
  if (!rateLimit.allowed) {
    throw new RateLimitedError();
  }

  const reservation = await prisma.bookingReservation.findUnique({
    where: { id: reservationId },
    include: {
      service: { include: { practitioner: true } },
      intakeSubmission: true,
      consentRecords: true,
      appointment: { include: { payment: true } },
    },
  });
  if (!reservation) {
    throw new NotFoundError("Reservation not found");
  }

  // Idempotent retry path: this reservation was already converted to a
  // PENDING_PAYMENT appointment by an earlier request (which may have
  // failed before or after actually creating the Stripe session).
  if (reservation.status === "CONVERTED" && reservation.appointment) {
    const appointment = reservation.appointment;
    const payment = appointment.payment;

    if (appointment.status !== "PENDING_PAYMENT" || !payment || payment.status !== "REQUIRES_PAYMENT") {
      throw new ConflictError("This booking has already been processed.");
    }

    if (payment.stripeCheckoutSessionId) {
      const existingSession = await paymentProvider.retrieveCheckoutSession(payment.stripeCheckoutSessionId);
      if (existingSession.status === "open" && existingSession.url) {
        return NextResponse.json({ checkoutUrl: existingSession.url, appointmentPublicId: appointment.publicId });
      }
      // Session expired/expired without payment — fall through and start a fresh one.
    }

    const client = await prisma.client.findUniqueOrThrow({ where: { id: appointment.clientId } });
    const result = await startCheckoutForAppointment(
      appointment,
      reservation.service,
      reservation.service.practitioner,
      client,
    );
    return NextResponse.json(result);
  }

  if (reservation.status !== "HOLDING") {
    throw new ConflictError("This reservation is no longer active.");
  }
  if (reservation.expiresAt.getTime() <= Date.now()) {
    throw new ConflictError("Your reservation has expired. Please choose a new time.");
  }
  if (!reservation.intakeSubmission || reservation.consentRecords.length === 0) {
    throw new AppError("Please complete the intake form and accept the consent terms first.", 400, "intake_required");
  }
  if (!reservation.clientEmail) {
    throw new AppError("Missing client contact information.", 400, "missing_contact");
  }

  const client = await prisma.client.findUnique({ where: { email: reservation.clientEmail } });
  if (!client) {
    throw new AppError("Missing client contact information.", 400, "missing_contact");
  }

  const service = reservation.service;
  const practitioner = service.practitioner;
  const publicId = generatePublicReference();

  let appointment: Appointment;
  try {
    appointment = await prisma.$transaction(async (tx) => {
      await tx.bookingReservation.update({
        where: { id: reservationId },
        data: { status: "CONVERTED" },
      });

      const created = await tx.appointment.create({
        data: {
          publicId,
          practitionerId: practitioner.id,
          serviceId: service.id,
          clientId: client.id,
          reservationId,
          startAt: reservation.startAt,
          endAt: reservation.endAt,
          clientTimezone: client.timezone,
          practitionerTimezone: practitioner.timezone,
          priceAmount: service.price,
          currency: service.currency,
          status: "PENDING_PAYMENT",
          paymentStatus: "REQUIRES_PAYMENT",
          intakeSubmissionId: reservation.intakeSubmission!.id,
        },
      });

      await tx.appointmentStatusHistory.create({
        data: {
          appointmentId: created.id,
          fromStatus: null,
          toStatus: "PENDING_PAYMENT",
          changedByClient: true,
        },
      });

      await tx.payment.create({
        data: {
          appointmentId: created.id,
          amount: service.price,
          currency: service.currency,
          status: "REQUIRES_PAYMENT",
          idempotencyKey: `appointment-checkout:${created.id}`,
        },
      });

      return created;
    });
  } catch (err) {
    if (isExclusionViolation(err)) {
      throw new ConflictError("This time slot is no longer available. Please choose another time.");
    }
    throw err;
  }

  const result = await startCheckoutForAppointment(appointment, service, practitioner, client);
  return NextResponse.json(result);
});
