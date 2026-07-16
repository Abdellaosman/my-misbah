import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { generateToken, hashToken } from "@/lib/crypto/tokens";
import type { User } from "@/generated/prisma/client";

export const SESSION_COOKIE_NAME = "mm_session";
const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days, sliding

export interface CreateSessionInput {
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Creates a DB-backed session and sets the session cookie on the current
 * response. Only the SHA-256 hash of the token is persisted — the raw token
 * lives solely in the httpOnly cookie, so a database read can never be used
 * to forge a session.
 */
export async function createSession(input: CreateSessionInput): Promise<void> {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: {
      userId: input.userId,
      tokenHash,
      ipAddress: input.ipAddress ?? undefined,
      userAgent: input.userAgent ?? undefined,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export interface AuthenticatedSession {
  user: User;
  sessionId: string;
}

/**
 * Resolves the current request's session cookie to a live user record.
 * Returns null for: no cookie, unknown/expired/revoked session, or a
 * deleted/suspended user account — callers should treat all of these
 * identically (i.e. "not logged in"), never distinguish in a way that could
 * leak account existence.
 */
export async function getCurrentSession(): Promise<AuthenticatedSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session) return null;
  if (session.revokedAt) return null;
  if (session.expiresAt.getTime() < Date.now()) return null;
  if (session.user.deletedAt) return null;

  // Sliding expiry + lastSeenAt heartbeat, but only write at most once every
  // few minutes to avoid a DB write on every single request.
  const staleForMs = Date.now() - session.lastSeenAt.getTime();
  if (staleForMs > 5 * 60 * 1000) {
    await prisma.session.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date(), expiresAt: new Date(Date.now() + SESSION_TTL_MS) },
    });
  }

  return { user: session.user, sessionId: session.id };
}

export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    const tokenHash = hashToken(token);
    await prisma.session.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/** Revokes every active session for a user — used on suspend/password change/impersonation-stop. */
export async function revokeAllSessionsForUser(userId: string): Promise<void> {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
