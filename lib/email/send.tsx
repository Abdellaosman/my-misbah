import "server-only";
import { DateTime } from "luxon";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { formatMoney } from "@/lib/money";
import { emailProvider } from "@/lib/email/resend";
import BookingConfirmedEmail from "@/lib/email/templates/BookingConfirmedEmail";
import PaymentReceiptEmail from "@/lib/email/templates/PaymentReceiptEmail";
import NewAppointmentEmail from "@/lib/email/templates/NewAppointmentEmail";
import ReminderEmail from "@/lib/email/templates/ReminderEmail";
import type { NotificationType } from "@/generated/prisma/enums";

/**
 * Sends one email through the configured provider, recording a
 * `Notification` row (metadata only — type/recipient/status, never the
 * template body) both before and after so delivery can be audited/retried
 * without ever storing consultation content in the notifications table.
 */
async function sendTrackedEmail(input: {
  type: NotificationType;
  appointmentId: string;
  to: string;
  subject: string;
  react: React.ReactNode;
}): Promise<void> {
  const notification = await prisma.notification.create({
    data: {
      type: input.type,
      appointmentId: input.appointmentId,
      recipientEmail: input.to,
      status: "QUEUED",
    },
  });

  try {
    await emailProvider.send({ to: input.to, subject: input.subject, react: input.react });
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: "SENT", sentAt: new Date() },
    });
  } catch (err) {
    logger.error("Failed to send email", { err, type: input.type, appointmentId: input.appointmentId });
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: "FAILED", error: err instanceof Error ? err.message : "Unknown error" },
    });
    throw err;
  }
}

async function loadAppointmentForEmail(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      client: true,
      practitioner: { include: { user: true } },
      service: true,
      payment: true,
      zoomMeeting: true,
    },
  });
  if (!appointment) {
    throw new Error(`Cannot send email: appointment ${appointmentId} not found`);
  }
  return appointment;
}

export async function sendBookingConfirmedEmail(appointmentId: string): Promise<void> {
  const appointment = await loadAppointmentForEmail(appointmentId);
  const start = DateTime.fromJSDate(appointment.startAt, { zone: "utc" }).setZone(appointment.clientTimezone);

  await sendTrackedEmail({
    type: "APPOINTMENT_CONFIRMED",
    appointmentId,
    to: appointment.client.email,
    subject: `Confirmed: your session with ${appointment.practitioner.displayName}`,
    react: (
      <BookingConfirmedEmail
        clientFirstName={appointment.client.firstName}
        practitionerName={appointment.practitioner.displayName}
        serviceName={appointment.service.name}
        dateLabel={start.toFormat("cccc, LLLL d, yyyy")}
        timeLabel={start.toFormat("h:mm a")}
        timezoneLabel={appointment.clientTimezone}
        zoomJoinUrl={appointment.zoomMeeting?.joinUrl ?? null}
        publicId={appointment.publicId}
      />
    ),
  });
}

export async function sendPaymentReceiptEmail(appointmentId: string): Promise<void> {
  const appointment = await loadAppointmentForEmail(appointmentId);

  await sendTrackedEmail({
    type: "PAYMENT_RECEIPT",
    appointmentId,
    to: appointment.client.email,
    subject: `Receipt for your My Misbah booking ${appointment.publicId}`,
    react: (
      <PaymentReceiptEmail
        clientFirstName={appointment.client.firstName}
        serviceName={appointment.service.name}
        practitionerName={appointment.practitioner.displayName}
        amount={formatMoney(appointment.priceAmount)}
        currency={appointment.currency}
        publicId={appointment.publicId}
        paidOnLabel={DateTime.now().toFormat("cccc, LLLL d, yyyy")}
      />
    ),
  });
}

export async function sendNewAppointmentEmail(appointmentId: string): Promise<void> {
  const appointment = await loadAppointmentForEmail(appointmentId);
  const start = DateTime.fromJSDate(appointment.startAt, { zone: "utc" }).setZone(appointment.practitionerTimezone);

  await sendTrackedEmail({
    type: "NEW_APPOINTMENT_PRACTITIONER",
    appointmentId,
    to: appointment.practitioner.user.email,
    subject: `New booking: ${appointment.client.firstName} ${appointment.client.lastName} — ${appointment.service.name}`,
    react: (
      <NewAppointmentEmail
        practitionerFirstName={appointment.practitioner.displayName.split(" ")[0]}
        clientName={`${appointment.client.firstName} ${appointment.client.lastName}`}
        serviceName={appointment.service.name}
        dateLabel={start.toFormat("cccc, LLLL d, yyyy")}
        timeLabel={start.toFormat("h:mm a")}
        timezoneLabel={appointment.practitionerTimezone}
        publicId={appointment.publicId}
      />
    ),
  });
}

export async function sendReminderEmail(appointmentId: string, hoursUntil: number): Promise<void> {
  const appointment = await loadAppointmentForEmail(appointmentId);
  const start = DateTime.fromJSDate(appointment.startAt, { zone: "utc" }).setZone(appointment.clientTimezone);

  await sendTrackedEmail({
    type: "APPOINTMENT_REMINDER",
    appointmentId,
    to: appointment.client.email,
    subject: `Reminder: your session with ${appointment.practitioner.displayName}`,
    react: (
      <ReminderEmail
        clientFirstName={appointment.client.firstName}
        practitionerName={appointment.practitioner.displayName}
        serviceName={appointment.service.name}
        dateLabel={start.toFormat("cccc, LLLL d, yyyy")}
        timeLabel={start.toFormat("h:mm a")}
        timezoneLabel={appointment.clientTimezone}
        hoursUntil={hoursUntil}
        zoomJoinUrl={appointment.zoomMeeting?.joinUrl ?? null}
      />
    ),
  });
}

/** Sends the client confirmation, payment receipt, and practitioner notification together; each is tracked/retried independently. */
export async function sendBookingConfirmationEmails(appointmentId: string): Promise<void> {
  const results = await Promise.allSettled([
    sendBookingConfirmedEmail(appointmentId),
    sendPaymentReceiptEmail(appointmentId),
    sendNewAppointmentEmail(appointmentId),
  ]);
  for (const result of results) {
    if (result.status === "rejected") {
      logger.error("One or more booking confirmation emails failed to send", { err: result.reason, appointmentId });
    }
  }
}
