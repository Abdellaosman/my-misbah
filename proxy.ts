import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

/**
 * Optimistic, cookie-presence-only redirect for the practitioner/admin
 * portals. This is deliberately NOT full authentication or authorization —
 * per Next.js's own guidance, Proxy should only do cheap checks against the
 * cookie, never hit the database. Every protected Server Component, Server
 * Action, and Route Handler still calls `requireUser()` (lib/auth/guards.ts)
 * for the real, server-side, database-backed check. Treat this file purely
 * as a UX nicety (bounce obviously-logged-out visitors before a render
 * round-trip), never as a security boundary.
 */
const PROTECTED_PREFIXES = ["/practitioner", "/admin"];
const PUBLIC_PORTAL_ROUTES = new Set(["/practitioner/login", "/admin/login"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected || PUBLIC_PORTAL_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);
  if (!hasSessionCookie) {
    const loginPath = pathname.startsWith("/admin") ? "/admin/login" : "/practitioner/login";
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/practitioner/:path*", "/admin/:path*"],
};
