export interface CreateCheckoutSessionInput {
  /** Used as the Stripe `Idempotency-Key` so a retried request never double-charges. */
  idempotencyKey: string;
  appointmentPublicId: string;
  practitionerName: string;
  serviceName: string;
  /** Integer minor units (e.g. cents), never a float — server-recomputed, never trusted from the client. */
  amountMinorUnits: number;
  currency: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
}

export interface CheckoutSessionResult {
  providerSessionId: string;
  url: string;
}

export interface RefundInput {
  providerPaymentIntentId: string;
  /** Integer minor units. Omit for a full refund. */
  amountMinorUnits?: number;
  reason?: string;
}

export interface RefundResult {
  providerRefundId: string;
  status: string;
}

/**
 * Payment provider abstraction. Stripe is the only implementation today
 * (lib/payments/stripe.ts), but every call site depends on this interface
 * rather than the Stripe SDK directly so a second provider (or Stripe
 * Connect payouts in Phase 3) is additive, not a rewrite.
 */
export interface PaymentProvider {
  createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSessionResult>;
  retrieveCheckoutSession(providerSessionId: string): Promise<{ status: string; url: string | null }>;
  refund(input: RefundInput): Promise<RefundResult>;
}
