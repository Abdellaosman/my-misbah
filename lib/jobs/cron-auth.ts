import { UnauthorizedError } from "@/lib/http/errors";

/**
 * Vercel Cron requests (and our own manual triggers) authenticate with a
 * static bearer secret rather than a user session — there is no browser
 * involved. Throws `UnauthorizedError` (mapped to 401 by `withErrorHandling`)
 * if the secret is missing or doesn't match.
 */
export function assertCronRequest(request: Request): void {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    throw new Error("CRON_SECRET is not set");
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    throw new UnauthorizedError("Invalid or missing cron secret");
  }
}
