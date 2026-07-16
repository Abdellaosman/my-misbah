import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withErrorHandling, ConflictError, RateLimitedError } from "@/lib/http/errors";
import { reserveSlotSchema } from "@/lib/validation/booking";
import { loadBookableService, getAvailableSlots } from "@/lib/availability/service";
import { isExclusionViolation } from "@/lib/db/errors";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { RESERVATION_HOLD_MINUTES } from "@/lib/booking/constants";

export const POST = withErrorHandling(async (request: Request) => {
  const ip = getClientIp(request.headers);
  const rateLimit = await checkRateLimit({
    action: "booking-reserve",
    identifier: ip,
    limit: 20,
    windowSeconds: 10 * 60,
  });
  if (!rateLimit.allowed) {
    throw new RateLimitedError();
  }

  const body = await request.json();
  const { serviceId, startAt } = reserveSlotSchema.parse(body);

  // Price, duration, and the practitioner are always re-derived server-side
  // from the service record — never trusted from the request body.
  const service = await loadBookableService(serviceId);

  const requestedStart = new Date(startAt);
  const requestedEnd = new Date(requestedStart.getTime() + service.durationMinutes * 60_000);

  // Re-validate against the exact same engine that generated the slot list
  // the client picked from, using a tight window around the requested time.
  const slots = await getAvailableSlots({
    service,
    fromUtc: new Date(requestedStart.getTime() - 24 * 60 * 60_000),
    toUtc: new Date(requestedEnd.getTime() + 24 * 60 * 60_000),
  });
  const stillAvailable = slots.some((s) => s.startAtUtc.getTime() === requestedStart.getTime());
  if (!stillAvailable) {
    throw new ConflictError("This time slot is no longer available. Please choose another time.");
  }

  const expiresAt = new Date(Date.now() + RESERVATION_HOLD_MINUTES * 60_000);

  let reservation;
  try {
    reservation = await prisma.bookingReservation.create({
      data: {
        practitionerId: service.practitionerId,
        serviceId: service.id,
        startAt: requestedStart,
        endAt: requestedEnd,
        expiresAt,
      },
    });
  } catch (err) {
    // Final safety net: even if two requests race past the check above, the
    // database-level exclusion constraint guarantees only one wins.
    if (isExclusionViolation(err)) {
      throw new ConflictError("This time slot is no longer available. Please choose another time.");
    }
    throw err;
  }

  return NextResponse.json(
    {
      reservationId: reservation.id,
      expiresAt: reservation.expiresAt.toISOString(),
      startAt: reservation.startAt.toISOString(),
      endAt: reservation.endAt.toISOString(),
      service: {
        id: service.id,
        practitionerSlug: service.practitioner.slug,
        practitionerName: service.practitioner.displayName,
        durationMinutes: service.durationMinutes,
        price: service.price,
        currency: service.currency,
      },
    },
    { status: 201 },
  );
});
