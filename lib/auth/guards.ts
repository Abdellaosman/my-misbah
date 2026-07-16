import "server-only";
import { getCurrentSession } from "@/lib/auth/session";
import { UnauthorizedError, ForbiddenError } from "@/lib/http/errors";
import type { User, UserRole } from "@/generated/prisma/client";

/**
 * Real, server-side authorization. `proxy.ts` only does a cheap
 * cookie-presence redirect for UX; every protected Server Component, Server
 * Action, and Route Handler must call one of these to actually authorize the
 * request. Never trust the proxy alone (defense in depth).
 */
export async function requireUser(...allowedRoles: UserRole[]): Promise<User> {
  const session = await getCurrentSession();
  if (!session) {
    throw new UnauthorizedError();
  }
  if (session.user.status !== "ACTIVE") {
    throw new ForbiddenError("Your account is not active. Contact support for help.");
  }
  if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
    throw new ForbiddenError();
  }
  return session.user;
}

export async function requireAdmin(): Promise<User> {
  return requireUser("ADMIN");
}

export async function requirePractitioner(): Promise<User> {
  return requireUser("PRACTITIONER");
}

/** Non-throwing variant for optional/"is logged in" UI decisions. */
export async function getOptionalUser(): Promise<User | null> {
  const session = await getCurrentSession();
  if (!session || session.user.status !== "ACTIVE") return null;
  return session.user;
}
