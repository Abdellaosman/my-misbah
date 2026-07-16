# Stripe setup

The platform uses **Stripe Checkout Sessions** (hosted, redirect-based) for
payment — no card data ever touches our servers. Server-side code lives in
`lib/payments/stripe.ts` (real provider) and `lib/payments/provider.ts` (the
`PaymentProvider` interface it and the E2E-only fake implement).

## 1. Create a Stripe account / use an existing one

Sign up (or log in) at [dashboard.stripe.com](https://dashboard.stripe.com).
Everything below is done in **test mode** for local development and staging;
switch to live-mode keys only for the production deployment (see
[`DEPLOYMENT.md`](DEPLOYMENT.md)).

## 2. Get API keys

Dashboard → **Developers → API keys**:

| Env var | Where to find it |
|---|---|
| `STRIPE_SECRET_KEY` | "Secret key" (`sk_test_...` / `sk_live_...`) |
| `STRIPE_PUBLISHABLE_KEY` | "Publishable key" (`pk_test_...` / `pk_live_...`) — not currently used server-side (we redirect to hosted Checkout rather than mounting Stripe.js), but kept available for a future embedded Payment Element upgrade |

## 3. Set up the webhook endpoint

The webhook handler (`app/api/webhooks/stripe/route.ts`) is the **only**
place an appointment is marked as paid/confirmed — Stripe delivering this
event is on the critical path for every booking, so this step is required
even for local development.

### Local development — Stripe CLI

1. Install the [Stripe CLI](https://docs.stripe.com/stripe-cli).
2. Log in: `stripe login`.
3. Forward events to your dev server:

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. The CLI prints a webhook signing secret (`whsec_...`) — put that in
   `STRIPE_WEBHOOK_SECRET` in your `.env`. This secret is different from the
   one you'll create for the production endpoint in step 4 below.
5. Leave `stripe listen` running while you test the booking flow; you can
   also manually trigger events for a specific session with
   `stripe trigger checkout.session.completed`.

Alternatively, run the Playwright E2E suite (`npm run test:e2e`), which
constructs and delivers a real, correctly-signed webhook event itself (see
`tests/e2e/booking-flow.spec.ts`) — no Stripe CLI needed for that path.

### Production / any deployed environment

Dashboard → **Developers → Webhooks → Add endpoint**:

- **Endpoint URL:** `https://<your-domain>/api/webhooks/stripe`
- **Events to send** — select exactly these (the handler ignores anything
  else, logging it as "unhandled event type", so subscribing to extra events
  is harmless but unnecessary):
  - `checkout.session.completed` — confirms the appointment and payment,
    triggers Zoom meeting creation + confirmation emails.
  - `payment_intent.payment_failed` — records the failure; a no-op if the
    appointment was already confirmed by an earlier `checkout.session.completed`
    (out-of-order delivery protection, see `tests/integration/stripe-webhook.test.ts`).
  - `charge.refunded` — reconciles `Refund`/`Payment` status for
    admin-initiated refunds.
  - `charge.dispute.created` — records a chargeback dispute for admin
    follow-up.

After creating the endpoint, reveal its **Signing secret** and set it as
`STRIPE_WEBHOOK_SECRET` in that environment's env vars (e.g. Vercel project
settings). Each Stripe endpoint (CLI-forwarded, staging, production) has its
own distinct signing secret — don't reuse one across environments.

## 4. Idempotency & security notes

- Every inbound event's Stripe `id` is written to `StripeWebhookEvent`
  before processing (unique constraint), so retried or duplicate deliveries
  are detected and skipped — see `app/api/webhooks/stripe/route.ts`.
- Signature verification (`stripe.webhooks.constructEvent`) happens before
  any DB write; requests with a missing/invalid `stripe-signature` header
  are rejected with `400` and never touched further.
- Checkout Session creation
  (`app/api/public/bookings/checkout/route.ts`) is itself idempotent via an
  `idempotencyKey` stored on the `Payment` row, so retrying a checkout
  creation request (e.g. a flaky network on the client) can't create two
  Stripe sessions for the same appointment.

## 5. `PAYMENTS_PROVIDER=fake` (test-only escape hatch)

`lib/payments/fake.ts` implements a `FakePaymentProvider` that never calls
Stripe — used exclusively by the Playwright E2E suite
(`PAYMENTS_PROVIDER=fake` is set in `playwright.config.ts`'s `webServer.env`)
so the full booking flow can run offline without real Stripe test
credentials. `lib/payments/stripe.ts` throws on startup if this variable is
ever set to `"fake"` while `NODE_ENV=production`, so a misconfigured
production deploy can't silently "confirm" unpaid bookings. Leave
`PAYMENTS_PROVIDER` unset in every real environment (local dev included —
you want to exercise the real Stripe integration there).
