import "server-only";
import { DateTime } from "luxon";
import { prisma } from "@/lib/db/prisma";
import { computeAvailableSlots } from "@/lib/availability/engine";
import { AppError, NotFoundError } from "@/lib/http/errors";
import { formatMoney } from "@/lib/money";
import type { AvailableSlot } from "@/lib/availability/types";

const MAX_QUERY_RANGE_DAYS = 62;

export interface ServiceWithPractitioner {
  id: string;
  practitionerId: string;
  durationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  minNoticeMinutes: number;
  maxAdvanceDays: number;
  price: string;
  currency: string;
  practitioner: {
    id: string;
    slug: string;
    displayName: string;
    timezone: string;
    approvalStatus: string;
  };
}

/** Loads a bookable service (active, approved, practitioner approved) or throws 404. */
export async function loadBookableService(serviceId: string): Promise<ServiceWithPractitioner> {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { practitioner: true },
  });

  if (
    !service ||
    service.deletedAt ||
    !service.isActive ||
    service.approvalStatus !== "APPROVED" ||
    service.practitioner.deletedAt ||
    service.practitioner.approvalStatus !== "APPROVED"
  ) {
    throw new NotFoundError("This service is not available for booking.");
  }

  return {
    id: service.id,
    practitionerId: service.practitionerId,
    durationMinutes: service.durationMinutes,
    bufferBeforeMinutes: service.bufferBeforeMinutes,
    bufferAfterMinutes: service.bufferAfterMinutes,
    minNoticeMinutes: service.minNoticeMinutes,
    maxAdvanceDays: service.maxAdvanceDays,
    price: formatMoney(service.price),
    currency: service.currency,
    practitioner: {
      id: service.practitioner.id,
      slug: service.practitioner.slug,
      displayName: service.practitioner.displayName,
      timezone: service.practitioner.timezone,
      approvalStatus: service.practitioner.approvalStatus,
    },
  };
}

export interface GetAvailableSlotsOptions {
  service: ServiceWithPractitioner;
  fromUtc: Date;
  toUtc: Date;
}

/**
 * DB-backed wrapper around the pure `computeAvailableSlots` engine: fetches
 * this practitioner's rules/overrides/time-off plus everything currently
 * occupying their calendar (active reservations + non-cancelled
 * appointments), then delegates to the engine for the actual math.
 */
export async function getAvailableSlots(opts: GetAvailableSlotsOptions): Promise<AvailableSlot[]> {
  const { service, fromUtc, toUtc } = opts;

  const rangeDays = (toUtc.getTime() - fromUtc.getTime()) / (1000 * 60 * 60 * 24);
  if (!(rangeDays > 0) || rangeDays > MAX_QUERY_RANGE_DAYS) {
    throw new AppError(`Availability range must be between 0 and ${MAX_QUERY_RANGE_DAYS} days`, 400, "invalid_range");
  }

  const practitionerId = service.practitionerId;
  const now = new Date();

  const [rules, overrides, timeOff, activeReservations, activeAppointments] = await Promise.all([
    prisma.availabilityRule.findMany({
      where: { practitionerId, isActive: true },
      select: { weekday: true, startMinute: true, endMinute: true, serviceId: true },
    }),
    prisma.availabilityOverride.findMany({
      where: { practitionerId },
      select: { date: true, startMinute: true, endMinute: true, isAvailable: true },
    }),
    prisma.timeOff.findMany({
      where: { practitionerId, endAt: { gte: fromUtc }, startAt: { lte: toUtc } },
      select: { startAt: true, endAt: true },
    }),
    prisma.bookingReservation.findMany({
      where: {
        practitionerId,
        status: "HOLDING",
        expiresAt: { gt: now },
        endAt: { gte: fromUtc },
        startAt: { lte: toUtc },
      },
      select: { startAt: true, endAt: true },
    }),
    prisma.appointment.findMany({
      where: {
        practitionerId,
        status: { in: ["PENDING_PAYMENT", "CONFIRMED", "COMPLETED", "NO_SHOW", "PARTIALLY_REFUNDED"] },
        endAt: { gte: fromUtc },
        startAt: { lte: toUtc },
      },
      select: { startAt: true, endAt: true },
    }),
  ]);

  return computeAvailableSlots({
    practitionerTimezone: service.practitioner.timezone,
    rangeStartUtc: fromUtc,
    rangeEndUtc: toUtc,
    rules: rules.map((r) => ({ ...r })),
    overrides: overrides.map((o) => ({ ...o, date: DateTime.fromJSDate(o.date, { zone: "utc" }).toISODate()! })),
    timeOff,
    busyIntervals: [...activeReservations, ...activeAppointments],
    serviceId: service.id,
    serviceDurationMinutes: service.durationMinutes,
    bufferBeforeMinutes: service.bufferBeforeMinutes,
    bufferAfterMinutes: service.bufferAfterMinutes,
    minNoticeMinutes: service.minNoticeMinutes,
    maxAdvanceDays: service.maxAdvanceDays,
    now,
  });
}
