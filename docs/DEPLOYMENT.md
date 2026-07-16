# Deployment (Vercel)

This assumes the [Stripe](STRIPE_SETUP.md) and [Zoom](ZOOM_SETUP.md) setup
docs have already been followed for the environment you're deploying (each
environment — staging, production — should have its own Stripe webhook
endpoint/secret and can share the same Zoom app, but needs its own
`ZOOM_TOKEN_ENCRYPTION_KEY`).

## 1. Provision a production database

Any Postgres 14+ works; a serverless-friendly provider is recommended since
Vercel's compute is also serverless (no long-lived connections to pool
against otherwise):

- [Neon](https://neon.tech) or [Vercel Postgres](https://vercel.com/storage/postgres) —
  both expose a plain `DATABASE_URL`, no code changes needed either way.
- Supabase, RDS + RDS Proxy, etc. also work identically — Prisma's
  `@prisma/adapter-pg` driver adapter (see `lib/db/prisma.ts`) just needs a
  standard `postgresql://` connection string.

Whatever you choose, confirm the role Prisma connects as is allowed to run
`CREATE EXTENSION IF NOT EXISTS btree_gist` (needed once, by the
`add_booking_exclusion_constraint` migration — see step 3). This is
allowlisted by default on Neon, Vercel Postgres, and Supabase. If you're on a
provider that restricts extensions, have a DB admin run that one line ahead
of time and everything else in the migration will apply normally.

## 2. Create the Vercel project

Import the repo in the [Vercel dashboard](https://vercel.com/new) (or
`vercel link` via the CLI). Framework preset auto-detects Next.js — no
changes needed to build/output settings.

## 3. Set environment variables

In the Vercel project → **Settings → Environment Variables**, set every
variable from `.env.example` for each environment (Production, Preview,
Development) you use — see that file's comments for what each one is for,
and [`STRIPE_SETUP.md`](STRIPE_SETUP.md) / [`ZOOM_SETUP.md`](ZOOM_SETUP.md)
for how to obtain the Stripe/Zoom ones specifically. A few deploy-specific
notes:

- `NEXT_PUBLIC_APP_URL` must be the real deployed URL (e.g.
  `https://mymisbah.com`) — it's used to build absolute links in emails and
  the Stripe Checkout success/cancel redirect URLs.
- `APP_SECRET`, `CRON_SECRET`, and `ZOOM_TOKEN_ENCRYPTION_KEY` must be
  freshly generated, unique values for production — never reuse local/dev
  values (see generation commands in `.env.example`'s comments).
- Leave `PAYMENTS_PROVIDER` **unset**. It only exists for the Playwright E2E
  suite, and `lib/payments/stripe.ts` refuses to honor `"fake"` when
  `NODE_ENV=production` regardless — this is belt-and-suspenders, not a
  substitute for actually leaving it unset.
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` should be **live-mode**
  keys for the Production environment (test-mode keys are fine for
  Preview deployments if you want preview builds to exercise Stripe without
  moving real money).

## 4. Run database migrations

`prisma migrate deploy` applies pending migrations without ever generating
new ones or prompting — the correct command for CI/CD, as opposed to
`prisma migrate dev` (interactive, local-only). It is **deliberately not**
wired into the Vercel build command, to avoid a migration running
concurrently from multiple in-flight deployments (e.g. a preview build and a
production build landing at the same time) against the same database.

Run it explicitly, once, right before (or as part of) each deploy that
includes new migrations:

```bash
# From your machine or CI, with DATABASE_URL pointed at the target DB:
DATABASE_URL="<production-connection-string>" npm run db:migrate:deploy
```

If you'd rather have Vercel do this automatically on every production
deploy and are confident deployments to that environment never overlap, you
can instead set the project's **Build Command** to:

```
prisma migrate deploy && next build
```

(`prisma generate` doesn't need to be added here — it already runs via the
`postinstall` script, before the build command executes.)

## 5. First deploy — seed data

After the first successful migration against a fresh production database,
seed it once:

```bash
DATABASE_URL="<production-connection-string>" npm run db:seed
```

**Immediately change the default admin/practitioner passwords** the seed
script prints (`admin@mymisbah.example` / `sheikh-*@mymisbah.example`, all
`ChangeMe123!` by default) — either by editing `DEFAULT_ADMIN_PASSWORD` /
`DEFAULT_PRACTITIONER_PASSWORD` in `prisma/seed.ts` before running it against
production, or by rotating them through the admin portal once that flow
exists. Do not leave the seeded default password active on a production
database.

## 6. Vercel Cron Jobs

Already declared in [`vercel.json`](../vercel.json) — no extra Vercel
dashboard setup needed, they activate automatically on deploy to Production:

| Path | Schedule | Purpose |
|---|---|---|
| `/api/cron/expire-reservations` | every 5 min | Releases `HOLDING` reservations and `PENDING_PAYMENT` appointments whose hold expired without payment, freeing the slot |
| `/api/cron/retry-zoom-meetings` | every 10 min | Retries Zoom meeting creation for confirmed appointments that don't have one yet (e.g. Zoom was down at confirmation time) |
| `/api/cron/send-reminders` | every 15 min | Sends appointment reminder emails at the configured offsets (default 24h and 1h before) |

Vercel Cron authenticates these requests with a bearer token that must equal
`CRON_SECRET` (see `lib/jobs/cron-auth.ts`) — Vercel sets this header
automatically for cron-triggered invocations once `CRON_SECRET` is set as an
environment variable on the project. Vercel Cron Jobs only run for
**Production** deployments, not Preview.

## 7. Stripe webhook for this environment

Create (or update) the Stripe webhook endpoint to point at
`https://<your-deployed-domain>/api/webhooks/stripe` and set that
endpoint's signing secret as `STRIPE_WEBHOOK_SECRET` for this Vercel
environment — full steps in [`STRIPE_SETUP.md`](STRIPE_SETUP.md#3-set-up-the-webhook-endpoint).
Every environment (each preview domain, staging, production) that should
receive real Stripe events needs its own endpoint + secret, since Stripe
signs each endpoint's deliveries with a distinct secret.

## 8. Post-deploy smoke test

1. Load `/book`, confirm all seeded practitioners/services render.
2. Complete a real test-mode booking end-to-end (use a
   [Stripe test card](https://docs.stripe.com/testing#cards), e.g.
   `4242 4242 4242 4242`) and confirm:
   - The confirmation page shows "Booking Confirmed" after Stripe redirects
     back.
   - The Stripe Dashboard → **Developers → Webhooks** → your endpoint shows
     a `200` response for the `checkout.session.completed` delivery.
   - A `ZoomMeeting` was created (check the practitioner dashboard for a
     "Start Zoom Meeting" link, or check `/api/cron/retry-zoom-meetings`
     picks it up within 10 minutes if Zoom briefly failed).
   - Confirmation emails arrived (client + practitioner), assuming Resend is
     configured.
3. Log in to `/practitioner/login` with a practitioner account and confirm
   the new appointment appears on the dashboard.

## Rollback notes

- Application code: standard Vercel instant rollback to a previous
  deployment (Vercel dashboard → Deployments → "..." → Promote to
  Production).
- Database migrations: Prisma migrations are forward-only by design; there
  is no automatic "down" migration. If a migration needs to be reverted,
  write and apply a new migration that undoes the specific change rather
  than trying to roll back the migration history itself.
