/**
 * Shared booking constants. These mirror the defaults seeded into
 * `SystemSetting("booking_rules")` (prisma/seed.ts) — kept here as plain
 * constants (rather than an async settings lookup) since the public
 * booking API is on the hot path and this rarely changes; an admin-editable
 * settings UI can read/write the same `SystemSetting` row without this
 * constant needing to move.
 */
export const RESERVATION_HOLD_MINUTES = 12;
export const PENDING_PAYMENT_TIMEOUT_MINUTES = 30;
export const REMINDER_HOURS_BEFORE_APPOINTMENT = [24, 1] as const;
