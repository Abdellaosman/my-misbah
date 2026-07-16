import { Link, Section, Text } from "@react-email/components";
import EmailLayout, { emailStyles } from "@/lib/email/templates/EmailLayout";

export interface BookingConfirmedEmailProps {
  clientFirstName: string;
  practitionerName: string;
  serviceName: string;
  dateLabel: string;
  timeLabel: string;
  timezoneLabel: string;
  zoomJoinUrl: string | null;
  publicId: string;
}

export default function BookingConfirmedEmail({
  clientFirstName,
  practitionerName,
  serviceName,
  dateLabel,
  timeLabel,
  timezoneLabel,
  zoomJoinUrl,
  publicId,
}: BookingConfirmedEmailProps) {
  return (
    <EmailLayout
      previewText={`Your session with ${practitionerName} is confirmed`}
      heading="Your booking is confirmed"
    >
      <Text style={emailStyles.text}>
        Assalamu alaikum {clientFirstName}, your session has been confirmed. Here are the details:
      </Text>

      <Section style={{ margin: "16px 0" }}>
        <Text style={{ ...emailStyles.row, ...emailStyles.label }}>
          Guide: <span style={emailStyles.value}>{practitionerName}</span>
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

      {zoomJoinUrl ? (
        <Section style={{ textAlign: "center", margin: "24px 0" }}>
          <Link href={zoomJoinUrl} style={emailStyles.button}>
            Join Zoom Meeting
          </Link>
        </Section>
      ) : (
        <Text style={emailStyles.text}>
          Your secure video link will follow in a separate email shortly before your session.
        </Text>
      )}

      <Text style={emailStyles.text}>
        All sessions are private and confidential. If you need to reschedule or cancel, please contact us as soon
        as possible.
      </Text>
    </EmailLayout>
  );
}
