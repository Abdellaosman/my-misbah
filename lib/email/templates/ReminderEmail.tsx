import { Link, Section, Text } from "@react-email/components";
import EmailLayout, { emailStyles } from "@/lib/email/templates/EmailLayout";

export interface ReminderEmailProps {
  clientFirstName: string;
  practitionerName: string;
  serviceName: string;
  dateLabel: string;
  timeLabel: string;
  timezoneLabel: string;
  hoursUntil: number;
  zoomJoinUrl: string | null;
}

export default function ReminderEmail({
  clientFirstName,
  practitionerName,
  serviceName,
  dateLabel,
  timeLabel,
  timezoneLabel,
  hoursUntil,
  zoomJoinUrl,
}: ReminderEmailProps) {
  const whenLabel = hoursUntil <= 1 ? "starting soon" : `in about ${hoursUntil} hours`;

  return (
    <EmailLayout
      previewText={`Reminder: your session with ${practitionerName} is ${whenLabel}`}
      heading={`Your session is ${whenLabel}`}
    >
      <Text style={emailStyles.text}>Assalamu alaikum {clientFirstName}, this is a reminder about your upcoming session:</Text>

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
      </Section>

      {zoomJoinUrl && (
        <Section style={{ textAlign: "center", margin: "24px 0" }}>
          <Link href={zoomJoinUrl} style={emailStyles.button}>
            Join Zoom Meeting
          </Link>
        </Section>
      )}
    </EmailLayout>
  );
}
