import { Section, Text } from "@react-email/components";
import EmailLayout, { emailStyles } from "@/lib/email/templates/EmailLayout";

export interface NewAppointmentEmailProps {
  practitionerFirstName: string;
  clientName: string;
  serviceName: string;
  dateLabel: string;
  timeLabel: string;
  timezoneLabel: string;
  publicId: string;
}

/**
 * Sent to the practitioner when a new booking is confirmed. Deliberately
 * contains only the client's name and appointment metadata — never the
 * intake answers or booking reason, which the practitioner reviews inside
 * the secure practitioner portal instead.
 */
export default function NewAppointmentEmail({
  practitionerFirstName,
  clientName,
  serviceName,
  dateLabel,
  timeLabel,
  timezoneLabel,
  publicId,
}: NewAppointmentEmailProps) {
  return (
    <EmailLayout previewText={`New booking: ${clientName} — ${serviceName}`} heading="You have a new booking">
      <Text style={emailStyles.text}>
        Assalamu alaikum {practitionerFirstName}, a new session has been booked and confirmed on your calendar.
      </Text>

      <Section style={{ margin: "16px 0" }}>
        <Text style={{ ...emailStyles.row, ...emailStyles.label }}>
          Client: <span style={emailStyles.value}>{clientName}</span>
        </Text>
        <Text style={{ ...emailStyles.row, ...emailStyles.label }}>
          Session: <span style={emailStyles.value}>{serviceName}</span>
        </Text>
        <Text style={{ ...emailStyles.row, ...emailStyles.label }}>
          Date: <span style={emailStyles.value}>{dateLabel}</span>
        </Text>
        <Text style={{ ...emailStyles.row, ...emailStyles.label }}>
          Time: <span style={emailStyles.value}>{timeLabel} ({timezoneLabel})</span>
        </Text>
        <Text style={{ ...emailStyles.row, ...emailStyles.label }}>
          Reference: <span style={emailStyles.value}>{publicId}</span>
        </Text>
      </Section>

      <Text style={emailStyles.text}>
        Sign in to your practitioner portal to view the client&apos;s intake responses and the Zoom meeting details.
      </Text>
    </EmailLayout>
  );
}
