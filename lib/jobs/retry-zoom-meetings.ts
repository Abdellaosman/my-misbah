import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { ensureZoomMeetingForAppointment } from "@/lib/video/zoom";

export interface RetryZoomMeetingsResult {
  attempted: number;
  succeeded: number;
  failed: number;
}

/**
 * Durability net for Zoom meeting creation: the webhook handler tries to
 * create the meeting immediately after payment confirmation, but that call
 * can fail (Zoom outage, transient network error, token issue). Any
 * `CONFIRMED` appointment that still doesn't have a `ZoomMeeting` row —
 * and hasn't already ended — gets retried here on a short cron interval
 * until it succeeds or the appointment passes.
 */
export async function retryMissingZoomMeetings(limit = 25): Promise<RetryZoomMeetingsResult> {
  const now = new Date();
  const candidates = await prisma.appointment.findMany({
    where: {
      status: "CONFIRMED",
      zoomMeeting: null,
      endAt: { gt: now },
    },
    orderBy: { startAt: "asc" },
    take: limit,
    select: { id: true },
  });

  let succeeded = 0;
  let failed = 0;
  for (const appointment of candidates) {
    try {
      await ensureZoomMeetingForAppointment(appointment.id);
      succeeded += 1;
    } catch (err) {
      failed += 1;
      logger.error("Zoom retry sweep: failed to create meeting", { err, appointmentId: appointment.id });
    }
  }

  return { attempted: candidates.length, succeeded, failed };
}
