import { DateTime } from "luxon";
import {
  unionIntervals,
  subtractIntervals,
  overlapsAny,
  isFullyWithinAny,
  type Interval,
} from "@/lib/availability/interval-utils";
import type {
  ComputeAvailableSlotsParams,
  AvailableSlot,
} from "@/lib/availability/types";

const DEFAULT_SLOT_GRANULARITY_MINUTES = 15;
const MINUTES_PER_DAY = 24 * 60;

/**
 * Converts a practitioner-local wall-clock time (calendar date + minute
 * offset within that date) to a UTC instant, correctly handling DST.
 *
 * Deliberately uses `DateTime#set({ hour, minute })` (a calendar/wall-clock
 * operation) rather than "midnight + N minutes of elapsed duration" — the
 * latter is wrong across a DST transition, since a 24-hour calendar day can
 * have 23 or 25 real hours in it.
 */
function localMinuteToUtc(dateISO: string, minuteOfDay: number, timezone: string): DateTime {
  const dayOffset = Math.floor(minuteOfDay / MINUTES_PER_DAY);
  const minuteWithinDay = ((minuteOfDay % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hour = Math.floor(minuteWithinDay / 60);
  const minute = minuteWithinDay % 60;

  const base = DateTime.fromISO(dateISO, { zone: timezone }).plus({ days: dayOffset });
  return base.set({ hour, minute, second: 0, millisecond: 0 });
}

/** 0 = Sunday ... 6 = Saturday, converted from Luxon's 1 = Monday ... 7 = Sunday. */
function jsWeekday(dt: DateTime): number {
  return dt.weekday % 7;
}

function toIsoDate(dt: DateTime): string {
  return dt.toISODate() as string;
}

export function computeAvailableSlots(params: ComputeAvailableSlotsParams): AvailableSlot[] {
  const {
    practitionerTimezone,
    rangeStartUtc,
    rangeEndUtc,
    rules,
    overrides,
    timeOff,
    busyIntervals,
    serviceId,
    serviceDurationMinutes,
    bufferBeforeMinutes,
    bufferAfterMinutes,
    minNoticeMinutes,
    maxAdvanceDays,
    slotGranularityMinutes = DEFAULT_SLOT_GRANULARITY_MINUTES,
    now = new Date(),
    maxAppointmentsPerDay,
    appointmentCountsByDate = {},
  } = params;

  if (rangeEndUtc <= rangeStartUtc) return [];

  const minNoticeCutoffMs = now.getTime() + minNoticeMinutes * 60_000;
  const maxAdvanceCutoffMs = DateTime.fromJSDate(now).plus({ days: maxAdvanceDays }).toMillis();

  // Widen each busy interval by the *candidate service's* buffers so that a
  // slot chosen from the resulting free space automatically has the right
  // clearance on both sides — see interval-utils tests for the reasoning.
  const blockedMs: Interval[] = unionIntervals([
    ...timeOff.map((t): Interval => [t.startAt.getTime(), t.endAt.getTime()]),
    ...busyIntervals.map((b): Interval => [
      b.startAt.getTime() - bufferAfterMinutes * 60_000,
      b.endAt.getTime() + bufferBeforeMinutes * 60_000,
    ]),
  ]);

  const overridesByDate = new Map<string, typeof overrides>();
  for (const o of overrides) {
    const list = overridesByDate.get(o.date) ?? [];
    list.push(o);
    overridesByDate.set(o.date, list);
  }

  const results: AvailableSlot[] = [];

  // Pad by one day on each side so windows near the range boundary (in a
  // timezone offset from UTC) aren't missed, then filter precisely below.
  const iterStart = DateTime.fromJSDate(rangeStartUtc, { zone: practitionerTimezone }).minus({ days: 1 });
  const iterEnd = DateTime.fromJSDate(rangeEndUtc, { zone: practitionerTimezone }).plus({ days: 1 });

  for (let cursor = iterStart; cursor <= iterEnd; cursor = cursor.plus({ days: 1 })) {
    const dateISO = toIsoDate(cursor);
    const weekday = jsWeekday(cursor);

    const ruleWindows: Interval[] = rules
      .filter((r) => r.weekday === weekday && (r.serviceId == null || r.serviceId === serviceId))
      .map((r): Interval => [r.startMinute, r.endMinute]);

    const overridesForDate = overridesByDate.get(dateISO) ?? [];
    const addWindows: Interval[] = overridesForDate
      .filter((o) => o.isAvailable)
      .map((o): Interval => [o.startMinute, o.endMinute]);
    const removeWindows: Interval[] = overridesForDate
      .filter((o) => !o.isAvailable)
      .map((o): Interval => [o.startMinute, o.endMinute]);

    const dayWindows = subtractIntervals(unionIntervals([...ruleWindows, ...addWindows]), removeWindows);
    if (dayWindows.length === 0) continue;

    if (
      typeof maxAppointmentsPerDay === "number" &&
      (appointmentCountsByDate[dateISO] ?? 0) >= maxAppointmentsPerDay
    ) {
      continue;
    }

    for (const [windowStart, windowEnd] of dayWindows) {
      for (
        let candidateStart = windowStart;
        candidateStart + serviceDurationMinutes <= windowEnd;
        candidateStart += slotGranularityMinutes
      ) {
        const startUtc = localMinuteToUtc(dateISO, candidateStart, practitionerTimezone);
        const endUtc = startUtc.plus({ minutes: serviceDurationMinutes });
        const startMs = startUtc.toMillis();
        const endMs = endUtc.toMillis();

        if (startMs < rangeStartUtc.getTime() || startMs > rangeEndUtc.getTime()) continue;
        if (startMs < minNoticeCutoffMs) continue;
        if (startMs > maxAdvanceCutoffMs) continue;
        if (overlapsAny([startMs, endMs], blockedMs)) continue;

        results.push({ startAtUtc: startUtc.toJSDate(), endAtUtc: endUtc.toJSDate() });
      }
    }
  }

  results.sort((a, b) => a.startAtUtc.getTime() - b.startAtUtc.getTime());
  return dedupeSlots(results);
}

function dedupeSlots(slots: AvailableSlot[]): AvailableSlot[] {
  const seen = new Set<number>();
  return slots.filter((slot) => {
    const key = slot.startAtUtc.getTime();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Convenience check used by the transactional booking endpoint to verify a
 * specific requested slot is still legitimately available before it takes a
 * DB-level lock — re-uses the exact same rules as slot generation so the UI
 * and the enforcement path can never disagree.
 */
export function isSlotAvailable(
  params: ComputeAvailableSlotsParams,
  requestedStartUtc: Date,
): boolean {
  return computeAvailableSlots(params).some(
    (slot) => slot.startAtUtc.getTime() === requestedStartUtc.getTime(),
  );
}

export { isFullyWithinAny };
