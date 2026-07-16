import { describe, expect, it } from "vitest";
import { computeAvailableSlots, isSlotAvailable } from "@/lib/availability/engine";
import type { ComputeAvailableSlotsParams } from "@/lib/availability/types";

const TZ = "America/Edmonton";
const SERVICE_ID = "svc-1";

function baseParams(overrides: Partial<ComputeAvailableSlotsParams> = {}): ComputeAvailableSlotsParams {
  return {
    practitionerTimezone: TZ,
    rangeStartUtc: new Date("2026-01-01T00:00:00.000Z"),
    rangeEndUtc: new Date("2026-01-10T00:00:00.000Z"),
    rules: [{ weekday: 0, startMinute: 9 * 60, endMinute: 17 * 60 }], // Sundays 9am-5pm
    overrides: [],
    timeOff: [],
    busyIntervals: [],
    serviceId: SERVICE_ID,
    serviceDurationMinutes: 60,
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 0,
    minNoticeMinutes: 0,
    maxAdvanceDays: 3650,
    now: new Date("2025-12-01T00:00:00.000Z"),
    ...overrides,
  };
}

describe("computeAvailableSlots — basics", () => {
  it("only generates slots within the recurring weekly window", () => {
    const slots = computeAvailableSlots(baseParams());
    expect(slots.length).toBeGreaterThan(0);
    for (const slot of slots) {
      const localHour = Number(
        new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: TZ }).format(
          slot.startAtUtc,
        ),
      );
      expect(localHour).toBeGreaterThanOrEqual(9);
      expect(localHour).toBeLessThan(17);
    }
  });

  it("produces no slots when there are no matching rules", () => {
    const slots = computeAvailableSlots(baseParams({ rules: [] }));
    expect(slots).toHaveLength(0);
  });

  it("respects a custom slot granularity", () => {
    const slots = computeAvailableSlots(
      baseParams({
        rangeStartUtc: new Date("2026-01-04T00:00:00.000Z"),
        rangeEndUtc: new Date("2026-01-05T00:00:00.000Z"),
        slotGranularityMinutes: 30,
        serviceDurationMinutes: 30,
      }),
    );
    // 9am-5pm = 8 hours = 16 slots of 30 minutes back-to-back on the one Sunday in range.
    expect(slots).toHaveLength(16);
  });
});

describe("computeAvailableSlots — buffers and existing bookings", () => {
  it("excludes a slot that overlaps an existing appointment", () => {
    const slots = computeAvailableSlots(
      baseParams({
        rangeStartUtc: new Date("2026-01-04T00:00:00.000Z"),
        rangeEndUtc: new Date("2026-01-05T00:00:00.000Z"),
        busyIntervals: [
          {
            // 10:00-11:00 local on Sunday Jan 4, 2026 (MST, UTC-7)
            startAt: new Date("2026-01-04T17:00:00.000Z"),
            endAt: new Date("2026-01-04T18:00:00.000Z"),
          },
        ],
      }),
    );
    const overlapping = slots.find(
      (s) => s.startAtUtc.getTime() === new Date("2026-01-04T17:00:00.000Z").getTime(),
    );
    expect(overlapping).toBeUndefined();
  });

  it("enforces buffer before/after around existing appointments", () => {
    const slots = computeAvailableSlots(
      baseParams({
        rangeStartUtc: new Date("2026-01-04T00:00:00.000Z"),
        rangeEndUtc: new Date("2026-01-05T00:00:00.000Z"),
        bufferBeforeMinutes: 15,
        bufferAfterMinutes: 15,
        busyIntervals: [
          {
            startAt: new Date("2026-01-04T17:00:00.000Z"), // 10:00 local
            endAt: new Date("2026-01-04T18:00:00.000Z"), // 11:00 local
          },
        ],
      }),
    );
    // A slot starting exactly at 11:00 local (right at the busy end) should
    // be excluded because it violates the 15-minute buffer-before.
    const at11 = slots.find(
      (s) => s.startAtUtc.getTime() === new Date("2026-01-04T18:00:00.000Z").getTime(),
    );
    expect(at11).toBeUndefined();
    // 11:15 local leaves exactly the required buffer and should be free.
    const at1115 = slots.find(
      (s) => s.startAtUtc.getTime() === new Date("2026-01-04T18:15:00.000Z").getTime(),
    );
    expect(at1115).toBeDefined();
  });
});

describe("computeAvailableSlots — overrides and time off", () => {
  it("a false override removes part of a normal working window", () => {
    const slots = computeAvailableSlots(
      baseParams({
        rangeStartUtc: new Date("2026-01-04T00:00:00.000Z"),
        rangeEndUtc: new Date("2026-01-05T00:00:00.000Z"),
        overrides: [{ date: "2026-01-04", startMinute: 12 * 60, endMinute: 13 * 60, isAvailable: false }],
      }),
    );
    const noonSlot = slots.find(
      (s) => s.startAtUtc.getTime() === new Date("2026-01-04T19:00:00.000Z").getTime(), // 12:00 local
    );
    expect(noonSlot).toBeUndefined();
  });

  it("a true override opens up an extra day/window with no recurring rule", () => {
    const slots = computeAvailableSlots(
      baseParams({
        rules: [],
        rangeStartUtc: new Date("2026-01-05T00:00:00.000Z"),
        rangeEndUtc: new Date("2026-01-06T00:00:00.000Z"),
        overrides: [{ date: "2026-01-05", startMinute: 10 * 60, endMinute: 11 * 60, isAvailable: true }],
      }),
    );
    expect(slots).toHaveLength(1);
  });

  it("time off blocks an entire day even if the recurring rule allows it", () => {
    const slots = computeAvailableSlots(
      baseParams({
        rangeStartUtc: new Date("2026-01-04T00:00:00.000Z"),
        rangeEndUtc: new Date("2026-01-05T00:00:00.000Z"),
        timeOff: [
          { startAt: new Date("2026-01-04T00:00:00.000Z"), endAt: new Date("2026-01-05T00:00:00.000Z") },
        ],
      }),
    );
    expect(slots).toHaveLength(0);
  });
});

describe("computeAvailableSlots — notice window and advance booking limit", () => {
  it("excludes slots before the minimum notice cutoff", () => {
    const slots = computeAvailableSlots(
      baseParams({
        now: new Date("2026-01-04T16:30:00.000Z"), // 9:30am local on the Sunday
        minNoticeMinutes: 120,
        rangeStartUtc: new Date("2026-01-04T00:00:00.000Z"),
        rangeEndUtc: new Date("2026-01-05T00:00:00.000Z"),
      }),
    );
    // 9am and 10am local slots start before now+2h (11:30am local) and must be excluded.
    expect(slots.some((s) => s.startAtUtc.getTime() === new Date("2026-01-04T17:00:00.000Z").getTime())).toBe(
      false,
    );
    expect(slots.every((s) => s.startAtUtc.getTime() >= new Date("2026-01-04T18:30:00.000Z").getTime())).toBe(
      true,
    );
  });

  it("excludes slots beyond the maximum advance booking window", () => {
    const slots = computeAvailableSlots(
      baseParams({
        now: new Date("2026-01-01T00:00:00.000Z"),
        maxAdvanceDays: 7,
        rangeStartUtc: new Date("2026-01-01T00:00:00.000Z"),
        rangeEndUtc: new Date("2026-02-01T00:00:00.000Z"),
      }),
    );
    const cutoff = new Date("2026-01-08T00:00:00.000Z").getTime();
    expect(slots.every((s) => s.startAtUtc.getTime() <= cutoff)).toBe(true);
    expect(slots.length).toBeGreaterThan(0);
  });
});

describe("computeAvailableSlots — per-day appointment cap", () => {
  it("excludes an entire day once its cap is reached", () => {
    const slots = computeAvailableSlots(
      baseParams({
        rangeStartUtc: new Date("2026-01-04T00:00:00.000Z"),
        rangeEndUtc: new Date("2026-01-05T00:00:00.000Z"),
        maxAppointmentsPerDay: 3,
        appointmentCountsByDate: { "2026-01-04": 3 },
      }),
    );
    expect(slots).toHaveLength(0);
  });
});

describe("computeAvailableSlots — DST transitions (America/Edmonton)", () => {
  it("keeps the wall-clock start time correct on the spring-forward day (MST -> MDT)", () => {
    // Sunday March 8, 2026 is the US/Canada spring-forward transition day.
    const slots = computeAvailableSlots(
      baseParams({
        rangeStartUtc: new Date("2026-03-08T00:00:00.000Z"),
        rangeEndUtc: new Date("2026-03-09T00:00:00.000Z"),
      }),
    );
    expect(slots[0].startAtUtc.toISOString()).toBe("2026-03-08T15:00:00.000Z"); // 9:00am MDT (UTC-6)
  });

  it("keeps the wall-clock start time correct on the fall-back day (MDT -> MST)", () => {
    // Sunday November 1, 2026 is the US/Canada fall-back transition day.
    const slots = computeAvailableSlots(
      baseParams({
        rangeStartUtc: new Date("2026-11-01T00:00:00.000Z"),
        rangeEndUtc: new Date("2026-11-02T00:00:00.000Z"),
      }),
    );
    expect(slots[0].startAtUtc.toISOString()).toBe("2026-11-01T16:00:00.000Z"); // 9:00am MST (UTC-7)
  });

  it("produces the same local 9am wall-clock start on either side of a transition", () => {
    const before = computeAvailableSlots(
      baseParams({
        rangeStartUtc: new Date("2026-03-01T00:00:00.000Z"),
        rangeEndUtc: new Date("2026-03-02T00:00:00.000Z"),
      }),
    )[0];
    const after = computeAvailableSlots(
      baseParams({
        rangeStartUtc: new Date("2026-03-15T00:00:00.000Z"),
        rangeEndUtc: new Date("2026-03-16T00:00:00.000Z"),
      }),
    )[0];
    expect(before.startAtUtc.toISOString()).toBe("2026-03-01T16:00:00.000Z"); // MST
    expect(after.startAtUtc.toISOString()).toBe("2026-03-15T15:00:00.000Z"); // MDT
  });
});

describe("isSlotAvailable", () => {
  it("matches a slot that computeAvailableSlots also returns", () => {
    const params = baseParams({
      rangeStartUtc: new Date("2026-01-04T00:00:00.000Z"),
      rangeEndUtc: new Date("2026-01-05T00:00:00.000Z"),
    });
    const [first] = computeAvailableSlots(params);
    expect(isSlotAvailable(params, first.startAtUtc)).toBe(true);
  });

  it("rejects a slot that is already booked", () => {
    const params = baseParams({
      rangeStartUtc: new Date("2026-01-04T00:00:00.000Z"),
      rangeEndUtc: new Date("2026-01-05T00:00:00.000Z"),
      busyIntervals: [
        { startAt: new Date("2026-01-04T17:00:00.000Z"), endAt: new Date("2026-01-04T18:00:00.000Z") },
      ],
    });
    expect(isSlotAvailable(params, new Date("2026-01-04T17:00:00.000Z"))).toBe(false);
  });
});
