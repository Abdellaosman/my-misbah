/** Best-effort browser timezone detection with a safe fallback for SSR/old browsers. */
export function detectBrowserTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) return tz;
  } catch {
    // ignore
  }
  return "UTC";
}

/** Full IANA timezone list where supported, otherwise a sensible curated fallback. */
export function listTimezones(): string[] {
  const intlWithSupportedValuesOf = Intl as typeof Intl & {
    supportedValuesOf?: (key: string) => string[];
  };
  if (typeof intlWithSupportedValuesOf.supportedValuesOf === "function") {
    try {
      return intlWithSupportedValuesOf.supportedValuesOf("timeZone");
    } catch {
      // fall through to curated list
    }
  }
  return [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Edmonton",
    "America/Vancouver",
    "America/Los_Angeles",
    "America/Toronto",
    "Europe/London",
    "Europe/Paris",
    "Africa/Cairo",
    "Asia/Riyadh",
    "Asia/Dubai",
    "Asia/Karachi",
    "Asia/Kolkata",
    "Asia/Dhaka",
    "Asia/Jakarta",
    "Asia/Kuala_Lumpur",
    "Australia/Sydney",
  ];
}
