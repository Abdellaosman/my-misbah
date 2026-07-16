import { randomUUID } from "crypto";
import type {
  PaymentProvider,
  CreateCheckoutSessionInput,
  CheckoutSessionResult,
  RefundInput,
  RefundResult,
} from "@/lib/payments/provider";

/**
 * Test-only stand-in for Stripe, activated exclusively via
 * `PAYMENTS_PROVIDER=fake` (see `lib/payments/stripe.ts`) for the Playwright
 * E2E suite (see `playwright.config.ts`). It never calls the real Stripe
 * API — the browser is sent straight to the success URL, and the E2E test
 * confirms payment out-of-band by POSTing a real, signed
 * `checkout.session.completed` event to `/api/webhooks/stripe`, exercising
 * the exact same webhook code path a genuine Stripe delivery would use. This
 * lets the full booking flow be tested offline, without real Stripe
 * test-mode credentials or leaving our own origin for a hosted Checkout page
 * we don't control.
 */
export class FakePaymentProvider implements PaymentProvider {
  async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSessionResult> {
    return { providerSessionId: `cs_test_fake_${randomUUID()}`, url: input.successUrl };
  }

  async retrieveCheckoutSession(): Promise<{ status: string; url: string | null }> {
    return { status: "open", url: null };
  }

  async refund(_input: RefundInput): Promise<RefundResult> {
    return { providerRefundId: `re_test_fake_${randomUUID()}`, status: "succeeded" };
  }
}
