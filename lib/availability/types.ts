export interface AvailabilityRuleInput {
  weekday: number; // 0 = Sunday ... 6 = Saturday
  startMinute: number; // minutes since local midnight
  endMinute: number;
  serviceId?: string | null; // null = applies to all services
}

export interface AvailabilityOverrideInput {
  /** Calendar date in the practitioner's timezone, "YYYY-MM-DD". */
  date: string;
  startMinute: number;
  endMinute: number;
  /** true = extra opening, false = block this window. */
  isAvailable: boolean;
}

export interface TimeOffInput {
  startAt: Date;
  endAt: Date;
}

/** An existing appointment or active reservation that occupies the calendar. */
export interface BusyIntervalInput {
  startAt: Date;
  endAt: Date;
}

export interface ComputeAvailableSlotsParams {
  /** IANA timezone the practitioner's availability rules are defined in. */
  practitionerTimezone: string;
  /** Inclusive UTC range to search for slots within. */
  rangeStartUtc: Date;
  rangeEndUtc: Date;
  rules: AvailabilityRuleInput[];
  overrides: AvailabilityOverrideInput[];
  timeOff: TimeOffInput[];
  busyIntervals: BusyIntervalInput[];
  /** The service being booked, used to size candidate slots and buffers. */
  serviceId: string;
  serviceDurationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  minNoticeMinutes: number;
  maxAdvanceDays: number;
  /** Step between candidate start times, in minutes. Defaults to 15. */
  slotGranularityMinutes?: number;
  /** Injectable "now" for deterministic tests; defaults to `new Date()`. */
  now?: Date;
  /** Optional cap on appointments per practitioner-local calendar day. */
  maxAppointmentsPerDay?: number;
  /** Existing appointment counts per practitioner-local date ("YYYY-MM-DD"), for the per-day cap. */
  appointmentCountsByDate?: Record<string, number>;
}

export interface AvailableSlot {
  startAtUtc: Date;
  endAtUtc: Date;
}
