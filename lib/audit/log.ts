import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";

export interface AuditLogInput {
  actorUserId?: string | null;
  actorRole?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  /** Must never contain intake answers, booking reasons, or other free text from clients. */
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Records an administrative/practitioner action for the audit-log interface
 * (admin > audit log). Deliberately fire-and-forget-safe: a logging failure
 * must never block the underlying business action, but we do log the
 * failure itself so it isn't silently lost.
 */
export async function recordAuditLog(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: input.actorUserId ?? null,
        actorRole: input.actorRole ?? null,
        action: input.action,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        // Prisma's generated Json input type doesn't structurally match a
        // plain `Record<string, unknown>`; this is a plain JSON-serializable
        // object at the call site, so the cast is safe.
        metadata: (input.metadata ?? undefined) as never,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  } catch (err) {
    logger.error("Failed to write audit log entry", { err, action: input.action });
  }
}
