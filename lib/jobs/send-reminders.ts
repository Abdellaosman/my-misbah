import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { sendReminderEmail } from "@/lib/email/send";
import { REMINDER_HOURS_BEFORE_APPOINTMENT } from "@/lib/booking/constants";

// Descending so index 0 is the earliest reminder (e.g. 24h before), and the
// Nth already-sent reminder notification for an appointment corresponds to
// thresholds[N - 1] — this lets us track "which reminders were sent" without
// a schema change, since reminders are always crossed in this fixed order.
const THRESHOLDS_DESC = [...REMINDER_HOURS_BEFORE_APPOINTMENT].sort((a, b) => b - a);

export interface SendRemindersResult {
  checked: number;
  sent: number;
  failed: number;
}

/**
 * Sends the next-due reminder email for every CONFIRMED, upcoming
 * appointment that has crossed a reminder threshold (e.g. 24h or 1h before
 * start) but not yet received that many reminders. Safe to run frequently
 * (e.g. every 15 minutes) — an appointment that already has N reminder
 * Notifications never receives an (N+1)th until the next threshold is
 * actually crossed.
 */
export async function sendDueAppointmentReminders(): Promise<SendRemindersResult> {
  const now = new Date();
  const maxHours = Math.max(...THRESHOLDS_DESC);
  const horizon = new Date(now.getTime() + maxHours * 60 * 60_000);

  const candidates = await prisma.appointment.findMany({
    where: { status: "CONFIRMED", startAt: { gt: now, lte: horizon } },
    select: {
      id: true,
      startAt: true,
      notifications: {
        where: { type: "APPOINTMENT_REMINDER" },
        select: { id: true },
      },
    },
  });

  let sent = 0;
  let failed = 0;

  for (const appointment of candidates) {
    const hoursUntilStart = (appointment.startAt.getTime() - now.getTime()) / (60 * 60_000);
    const thresholdsCrossed = THRESHOLDS_DESC.filter((t) => hoursUntilStart <= t).length;
    const alreadySent = appointment.notifications.length;

    if (alreadySent >= thresholdsCrossed) continue;

    const nextThreshold = THRESHOLDS_DESC[alreadySent];
    try {
      await sendReminderEmail(appointment.id, nextThreshold);
      sent += 1;
    } catch (err) {
      failed += 1;
      logger.error("Failed to send appointment reminder", { err, appointmentId: appointment.id });
    }
  }

  return { checked: candidates.length, sent, failed };
}
