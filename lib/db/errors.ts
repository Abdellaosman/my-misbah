/**
 * Detects a Postgres `exclusion_violation` (SQLSTATE 23P01) surfaced through
 * Prisma's `@prisma/adapter-pg` driver adapter. This is how the double-
 * booking exclusion constraints (see prisma/migrations/*_add_booking_
 * exclusion_constraint) show up in application code — Prisma doesn't have
 * first-class knowledge of EXCLUDE constraints (unlike UNIQUE, which maps to
 * its own `P2002` code), so we check the underlying driver error directly.
 *
 * Verified empirically against the installed `@prisma/adapter-pg` version:
 * the thrown error is a `DriverAdapterError` whose `.cause.code` is the raw
 * Postgres SQLSTATE. We also fall back to a message match in case that
 * shape changes across versions, so a caller never has to guess.
 */
export function isExclusionViolation(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const cause = (err as { cause?: unknown }).cause;
  if (cause && typeof cause === "object" && (cause as { code?: unknown }).code === "23P01") {
    return true;
  }
  const message = (err as { message?: unknown }).message;
  return typeof message === "string" && message.includes("exclusion constraint");
}
