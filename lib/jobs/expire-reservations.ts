import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { PENDING_PAYMENT_TIMEOUT_MINUTES } from "@/lib/booking/constants";

export interface ExpireReservationsResult {
  expiredReservations: number;
  expiredPendingPayments: number;
}

/**
 * Releases slots that were never actually booked:
 *
 * 1. `BookingReservation` rows past `expiresAt` still in `HOLDING` (the
 *    availability engine already treats these as inert once expired — see
 *    lib/availability/service.ts — so this is "lazy expiry made durable",
 *    not the only thing standing between an expired hold and a double
 *    booking).
 * 2. `Appointment` rows stuck in `PENDING_PAYMENT` because the client
 *    abandoned Stripe Checkout (never paid, never got redirected back, or
 *    the webhook never fired) — these hold the Postgres exclusion
 *    constraint's "active" slot indefinitely otherwise.
 */
export async function expireStaleReservationsAndPayments(): Promise<ExpireReservationsResult> {
  const now = new Date();

  const expiredReservations = await prisma.bookingReservation.updateMany({
    where: { status: "HOLDING", expiresAt: { lte: now } },
    data: { status: "EXPIRED" },
  });

  const staleThreshold = new Date(now.getTime() - PENDING_PAYMENT_TIMEOUT_MINUTES * 60_000);
  const stalePending = await prisma.appointment.findMany({
    where: { status: "PENDING_PAYMENT", createdAt: { lte: staleThreshold } },
    select: { id: true },
  });

  let expiredPendingPayments = 0;
  for (const stale of stalePending) {
    try {
      await prisma.$transaction(async (tx) => {
        // Guarded update: only transitions if still PENDING_PAYMENT, so a
        // webhook that confirms payment in the same instant this sweep runs
        // can never be clobbered by a stale-timeout expiry.
        const updated = await tx.appointment.updateMany({
          where: { id: stale.id, status: "PENDING_PAYMENT" },
          data: { status: "EXPIRED", paymentStatus: "CANCELED" },
        });
        if (updated.count === 0) return;

        await tx.appointmentStatusHistory.create({
          data: {
            appointmentId: stale.id,
            fromStatus: "PENDING_PAYMENT",
            toStatus: "EXPIRED",
            reason: "Payment was not completed within the reservation timeout window",
          },
        });
        await tx.payment.updateMany({
          where: { appointmentId: stale.id, status: "REQUIRES_PAYMENT" },
          data: { status: "CANCELED" },
        });
        expiredPendingPayments += 1;
      });
    } catch (err) {
      logger.error("Failed to expire stale PENDING_PAYMENT appointment", { err, appointmentId: stale.id });
    }
  }

  return { expiredReservations: expiredReservations.count, expiredPendingPayments };
}
