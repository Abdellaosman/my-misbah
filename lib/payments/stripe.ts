import "server-only";
import Stripe from "stripe";
import type {
  PaymentProvider,
  CreateCheckoutSessionInput,
  CheckoutSessionResult,
  RefundInput,
  RefundResult,
} from "@/lib/payments/provider";
import { FakePaymentProvider } from "@/lib/payments/fake";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (stripeClient) return stripeClient;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  stripeClient = new Stripe(secretKey);
  return stripeClient;
}

export class StripePaymentProvider implements PaymentProvider {
  async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSessionResult> {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: input.customerEmail,
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        client_reference_id: input.appointmentPublicId,
        metadata: input.metadata,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: input.currency,
              unit_amount: input.amountMinorUnits,
              product_data: {
                name: `${input.serviceName} with ${input.practitionerName}`,
                metadata: input.metadata,
              },
            },
          },
        ],
        payment_intent_data: {
          metadata: input.metadata,
        },
      },
      { idempotencyKey: input.idempotencyKey },
    );

    if (!session.url) {
      throw new Error("Stripe did not return a Checkout Session URL");
    }

    return { providerSessionId: session.id, url: session.url };
  }

  async retrieveCheckoutSession(providerSessionId: string) {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(providerSessionId);
    return { status: session.status ?? "unknown", url: session.url };
  }

  async refund(input: RefundInput): Promise<RefundResult> {
    const stripe = getStripeClient();
    const refund = await stripe.refunds.create({
      payment_intent: input.providerPaymentIntentId,
      amount: input.amountMinorUnits,
      reason: mapRefundReason(input.reason),
    });
    return { providerRefundId: refund.id, status: refund.status ?? "unknown" };
  }
}

function mapRefundReason(reason?: string): Stripe.RefundCreateParams.Reason | undefined {
  if (reason === "duplicate" || reason === "fraudulent" || reason === "requested_by_customer") {
    return reason;
  }
  return "requested_by_customer";
}

/**
 * `PAYMENTS_PROVIDER=fake` swaps in an in-process stand-in that never calls
 * Stripe (see `lib/payments/fake.ts`). It exists solely for the Playwright
 * E2E suite to run fully offline; refusing to enable it in production is a
 * deliberate hard stop against a misconfigured deploy accidentally
 * "confirming" unpaid bookings.
 */
function createPaymentProvider(): PaymentProvider {
  const useFake = process.env.PAYMENTS_PROVIDER === "fake";
  if (useFake && process.env.NODE_ENV === "production") {
    throw new Error("PAYMENTS_PROVIDER=fake must never be enabled in production");
  }
  return useFake ? new FakePaymentProvider() : new StripePaymentProvider();
}

export const paymentProvider: PaymentProvider = createPaymentProvider();

/** Converts a Decimal-as-string amount (e.g. "60.00") to integer minor units for Stripe. */
export function toMinorUnits(amount: string): number {
  return Math.round(Number(amount) * 100);
}

/** Converts integer minor units (e.g. cents) back to a "60.00"-style decimal string. */
export function fromMinorUnits(amountMinorUnits: number): string {
  return (amountMinorUnits / 100).toFixed(2);
}

/**
 * Verifies a Stripe webhook signature and parses the event. Thrown errors
 * are plain `Error`s (not `AppError`) — the webhook route decides how to
 * map a verification failure to an HTTP response.
 */
export function constructStripeEvent(rawBody: string, signature: string): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  }
  const stripe = getStripeClient();
  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
}
