/**
 * Minimal, privacy-aware logging wrapper.
 *
 * Every call site in this codebase should log through here (not
 * `console.log` directly) so that:
 *  - we have exactly one place to wire in Sentry (or swap providers later),
 *  - we have a `redact` helper that call sites must use for anything that
 *    could contain intake answers, booking reasons, or other sensitive
 *    consultation content — that content must NEVER reach logs, error
 *    monitoring, or analytics (see AGENTS / plan "Security and privacy
 *    requirements").
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogFields {
  [key: string]: unknown;
}

const SENSITIVE_KEYS = new Set([
  "reasonForBooking",
  "situationDescription",
  "backgroundInfo",
  "desiredOutcome",
  "answerText",
  "answerOptions",
  "intakeSubmission",
  "intakeAnswers",
  "passwordHash",
  "password",
  "accessTokenEncrypted",
  "refreshTokenEncrypted",
  "startUrl",
]);

/** Deep-ish redaction for known-sensitive field names before logging. */
export function redact<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => redact(v)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: LogFields = {};
    for (const [key, val] of Object.entries(value as LogFields)) {
      out[key] = SENSITIVE_KEYS.has(key) ? "[redacted]" : redact(val);
    }
    return out as unknown as T;
  }
  return value;
}

function write(level: LogLevel, message: string, fields?: LogFields) {
  const entry = {
    level,
    message,
    time: new Date().toISOString(),
    ...(fields ? redact(fields) : {}),
  };
  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  debug: (message: string, fields?: LogFields) => write("debug", message, fields),
  info: (message: string, fields?: LogFields) => write("info", message, fields),
  warn: (message: string, fields?: LogFields) => write("warn", message, fields),
  /**
   * Logs an error. Pass the caught error under `fields.err` — its message
   * (never intake content) is included; stack traces are never sent to the
   * client (see lib/http/errors.ts).
   */
  error: (message: string, fields?: LogFields & { err?: unknown }) => {
    const { err, ...rest } = fields ?? {};
    const errInfo =
      err instanceof Error
        ? { errMessage: err.message, errName: err.name }
        : err
          ? { errMessage: String(err) }
          : {};
    write("error", message, { ...rest, ...errInfo });
  },
};
