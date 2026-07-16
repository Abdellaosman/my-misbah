import type { ReactNode } from "react";

export interface SendEmailInput {
  to: string;
  subject: string;
  react: ReactNode;
}

export interface SendEmailResult {
  providerMessageId: string;
}

/**
 * Email provider abstraction. Resend (lib/email/resend.ts) is the only
 * implementation today, but call sites depend on this interface so a
 * second provider (e.g. Postmark) is additive, not a rewrite.
 *
 * No template ever receives intake answers, booking reasons, or other
 * free-text consultation content — only appointment metadata (names,
 * dates, a secure link) — per the platform's privacy requirements.
 */
export interface EmailProvider {
  send(input: SendEmailInput): Promise<SendEmailResult>;
}
