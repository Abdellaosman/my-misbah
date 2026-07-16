import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logger } from "@/lib/logger";

/**
 * A deliberate, user-safe error with a stable `code` and HTTP `status`.
 * Route handlers should throw this for expected business-rule failures
 * (e.g. "slot no longer available") so the message shown to the client is
 * intentional rather than an accidental internal error leaking outward.
 */
export class AppError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status = 400, code = "bad_request") {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404, "not_found");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "unauthorized");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have access to this resource") {
    super(message, 403, "forbidden");
  }
}

export class ConflictError extends AppError {
  constructor(message = "This action conflicts with the current state") {
    super(message, 409, "conflict");
  }
}

export class RateLimitedError extends AppError {
  constructor(message = "Too many requests, please try again shortly") {
    super(message, 429, "rate_limited");
  }
}

/**
 * Wraps a Route Handler body so that:
 *  - Zod validation errors become clean 400s with field-level detail,
 *  - AppError subclasses become their declared status/code,
 *  - anything else becomes a generic 500 with NO internal detail leaked to
 *    the client (message, stack, SQL, etc. never reach the response body —
 *    they are only logged server-side).
 */
export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>,
) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: { code: "validation_error", message: "Invalid input", issues: err.issues } },
          { status: 400 },
        );
      }
      if (err instanceof AppError) {
        if (err.status >= 500) {
          logger.error("Handled AppError (5xx)", { err, code: err.code });
        }
        return NextResponse.json(
          { error: { code: err.code, message: err.message } },
          { status: err.status },
        );
      }
      logger.error("Unhandled error in route handler", { err });
      return NextResponse.json(
        { error: { code: "internal_error", message: "Something went wrong. Please try again." } },
        { status: 500 },
      );
    }
  };
}
