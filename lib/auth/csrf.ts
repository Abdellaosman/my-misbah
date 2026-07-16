import { ForbiddenError } from "@/lib/http/errors";

/**
 * Same-origin check for cookie-authenticated, state-changing Route Handlers
 * (Server Actions get this from Next.js automatically; hand-written
 * mutating API routes under /api/practitioner and /api/admin do not, so
 * they call this explicitly).
 */
export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  // Same-origin requests from fetch()/XHR always send an Origin header for
  // state-changing methods; a missing header on a mutating request is
  // treated as suspicious rather than assumed benign.
  if (!origin) {
    throw new ForbiddenError("Missing origin header");
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const allowedOrigins = [appUrl].filter(Boolean) as string[];
  if (!allowedOrigins.includes(origin)) {
    throw new ForbiddenError("Cross-origin request rejected");
  }
}
