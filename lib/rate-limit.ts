import { prisma } from "@/lib/db/prisma";

/**
 * Postgres-backed fixed-window rate limiter.
 *
 * An in-memory counter would not work correctly on serverless (Vercel):
 * concurrent invocations of the same route can land on different lambda
 * instances, each with its own memory, so limits would silently not apply.
 * A DB-backed counter is slower but correct. If this ever becomes a
 * bottleneck at scale, swap this module for Upstash Redis — call sites
 * (`checkRateLimit`) don't need to change.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export interface RateLimitOptions {
  /** Logical bucket name, e.g. "login", "booking-reserve". */
  action: string;
  /** Caller-supplied identity for the bucket, e.g. IP address or email. */
  identifier: string;
  /** Max allowed hits within the window. */
  limit: number;
  /** Window size in seconds. */
  windowSeconds: number;
}

export async function checkRateLimit(opts: RateLimitOptions): Promise<RateLimitResult> {
  const { action, identifier, limit, windowSeconds } = opts;
  const key = `${action}:${identifier}`;
  const now = new Date();
  const windowMs = windowSeconds * 1000;

  return prisma.$transaction(async (tx) => {
    const existing = await tx.rateLimitBucket.findUnique({ where: { key } });

    if (!existing || now.getTime() - existing.windowStart.getTime() >= windowMs) {
      await tx.rateLimitBucket.upsert({
        where: { key },
        create: { key, windowStart: now, count: 1 },
        update: { windowStart: now, count: 1 },
      });
      return {
        allowed: true,
        remaining: limit - 1,
        resetAt: new Date(now.getTime() + windowMs),
      };
    }

    const resetAt = new Date(existing.windowStart.getTime() + windowMs);
    if (existing.count >= limit) {
      return { allowed: false, remaining: 0, resetAt };
    }

    await tx.rateLimitBucket.update({
      where: { key },
      data: { count: { increment: 1 } },
    });

    return {
      allowed: true,
      remaining: Math.max(0, limit - existing.count - 1),
      resetAt,
    };
  });
}

/** Best-effort client IP extraction from standard proxy headers. */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
