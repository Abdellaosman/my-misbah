import { Section, Text } from "@react-email/components";
import EmailLayout, { emailStyles } from "@/lib/email/templates/EmailLayout";

export interface PaymentReceiptEmailProps {
  clientFirstName: string;
  serviceName: string;
  practitionerName: string;
  amount: string;
  currency: string;
  publicId: string;
  paidOnLabel: string;
}

export default function PaymentReceiptEmail({
  clientFirstName,
  serviceName,
  practitionerName,
  amount,
  currency,
  publicId,
  paidOnLabel,
}: PaymentReceiptEmailProps) {
  return (
    <EmailLayout previewText={`Receipt for your My Misbah booking ${publicId}`} heading="Payment receipt">
      <Text style={emailStyles.text}>Thank you {clientFirstName}, this confirms your payment was received.</Text>

      <Section style={{ margin: "16px 0" }}>
        <Text style={{ ...emailStyles.row, ...emailStyles.label }}>
          Reference: <span style={emailStyles.value}>{publicId}</span>
        </Text>
        <Text style={{ ...emailStyles.row, ...emailStyles.label }}>
          Session: <span style={emailStyles.value}>{serviceName}</span>
        </Text>
        <Text style={{ ...emailStyles.row, ...emailStyles.label }}>
          Guide: <span style={emailStyles.value}>{practitionerName}</span>
        </Text>
        <Text style={{ ...emailStyles.row, ...emailStyles.label }}>
          Paid on: <span style={emailStyles.value}>{paidOnLabel}</span>
        </Text>
        <Text style={{ ...emailStyles.row, ...emailStyles.label }}>
          Amount: <span style={emailStyles.value}>${amount} {currency.toUpperCase()}</span>
        </Text>
      </Section>

      <Text style={emailStyles.text}>
        Please keep this email for your records. If you believe this charge is incorrect, contact us right away.
      </Text>
    </EmailLayout>
  );
}
