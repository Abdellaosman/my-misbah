import "server-only";
import Stripe from "stripe";
import type {
  PaymentProvider,
  CreateCheckoutSessionInput,
  CheckoutSessionResult,
  RefundInput,
  RefundResult,
} from "@/lib/payments/provider";

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

export const paymentProvider: PaymentProvider = new StripePaymentProvider();

/** Converts a Decimal-as-string amount (e.g. "60.00") to integer minor units for Stripe. */
export function toMinorUnits(amount: string): number {
  return Math.round(Number(amount) * 100);
}
