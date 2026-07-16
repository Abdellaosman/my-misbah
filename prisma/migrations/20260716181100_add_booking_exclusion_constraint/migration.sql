-- Database-level double-booking prevention.
--
-- This is the ultimate safety net for slot exclusivity: even if application
-- code has a bug, a race condition, or two requests land on different
-- serverless instances at the same instant, Postgres itself will refuse to
-- persist two overlapping "blocking" rows for the same practitioner.
--
-- btree_gist is required so we can mix a scalar equality column
-- ("practitionerId") with a range-overlap column (tstzrange) in one
-- EXCLUDE USING gist constraint.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- A HOLDING reservation temporarily occupies a slot while the client pays.
-- Two HOLDING reservations for the same practitioner may not overlap.
ALTER TABLE "BookingReservation"
  ADD CONSTRAINT "BookingReservation_no_overlap_while_holding"
  EXCLUDE USING gist (
    "practitionerId" WITH =,
    tstzrange("startAt", "endAt", '[)') WITH &&
  )
  WHERE ("status" = 'HOLDING');

-- A confirmed (or otherwise "active") appointment occupies a slot. Cancelled,
-- expired, payment-failed, and fully-refunded appointments do not block the
-- slot for future bookings.
ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_no_overlap_while_active"
  EXCLUDE USING gist (
    "practitionerId" WITH =,
    tstzrange("startAt", "endAt", '[)') WITH &&
  )
  WHERE (
    "status" IN (
      'PENDING_PAYMENT',
      'CONFIRMED',
      'COMPLETED',
      'NO_SHOW',
      'PARTIALLY_REFUNDED'
    )
  );
