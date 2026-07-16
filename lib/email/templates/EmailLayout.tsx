import { Body, Container, Head, Hr, Html, Preview, Section, Text } from "@react-email/components";
import type { ReactNode } from "react";

const BRAND_NAVY = "#1A2B50";
const BRAND_GOLD = "#F0A500";
const BRAND_MUTED = "#6b6878";
const BRAND_BORDER = "#EAE3D4";
const BRAND_CREAM = "#FAF8F3";

interface EmailLayoutProps {
  previewText: string;
  heading: string;
  children: ReactNode;
}

/** Shared wrapper for all transactional emails — kept intentionally plain (table-safe styles, no external fonts/images) for maximum inbox compatibility. */
export default function EmailLayout({ previewText, heading, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: BRAND_CREAM, fontFamily: "Helvetica, Arial, sans-serif", margin: 0, padding: "24px 0" }}>
        <Container style={{ backgroundColor: "#ffffff", borderRadius: 16, border: `1px solid ${BRAND_BORDER}`, maxWidth: 480, margin: "0 auto", overflow: "hidden" }}>
          <Section style={{ backgroundColor: BRAND_NAVY, padding: "24px 32px" }}>
            <Text style={{ color: "#ffffff", fontSize: 20, fontWeight: 700, margin: 0 }}>My Misbah</Text>
            <Text style={{ color: BRAND_GOLD, fontSize: 12, margin: "4px 0 0" }}>Your Light in Times of Uncertainty</Text>
          </Section>
          <Section style={{ padding: "28px 32px" }}>
            <Text style={{ color: BRAND_NAVY, fontSize: 18, fontWeight: 700, margin: "0 0 16px" }}>{heading}</Text>
            {children}
          </Section>
          <Hr style={{ borderColor: BRAND_BORDER, margin: 0 }} />
          <Section style={{ padding: "16px 32px" }}>
            <Text style={{ color: BRAND_MUTED, fontSize: 11, margin: 0 }}>
              This is an automated message from My Misbah. If you have questions, contact{" "}
              {process.env.SUPPORT_EMAIL ?? "support@mymisbah.example"}.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const emailStyles = {
  text: { color: "#4a4a5a", fontSize: 14, lineHeight: "22px", margin: "0 0 12px" },
  row: {
    display: "flex" as const,
    justifyContent: "space-between" as const,
    padding: "8px 0",
    borderBottom: `1px solid ${BRAND_BORDER}`,
    fontSize: 14,
  },
  label: { color: BRAND_MUTED },
  value: { color: BRAND_NAVY, fontWeight: 600 },
  button: {
    backgroundColor: "#C8680A",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 700,
    borderRadius: 10,
    padding: "12px 24px",
    textDecoration: "none",
    display: "inline-block" as const,
  },
};
