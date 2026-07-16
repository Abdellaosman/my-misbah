import "server-only";
import { Resend } from "resend";
import type { EmailProvider, SendEmailInput, SendEmailResult } from "@/lib/email/provider";

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (resendClient) return resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }
  resendClient = new Resend(apiKey);
  return resendClient;
}

export class ResendEmailProvider implements EmailProvider {
  async send(input: SendEmailInput): Promise<SendEmailResult> {
    const from = process.env.EMAIL_FROM;
    if (!from) {
      throw new Error("EMAIL_FROM is not set");
    }

    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      react: input.react,
    });

    if (error || !data) {
      throw new Error(`Resend send failed: ${error?.message ?? "unknown error"}`);
    }

    return { providerMessageId: data.id };
  }
}

export const emailProvider: EmailProvider = new ResendEmailProvider();
