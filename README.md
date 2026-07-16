# My Misbah — Booking Platform

A Next.js 16 / React 19 / Tailwind v4 site for My Misbah, extended with a full
booking, payments, video-consultation, and portal system:

- **Public booking wizard** (`/book`, `/book/[practitionerSlug]`) — visitors
  pick a service, pick an available slot, submit an intake form, and pay via
  Stripe Checkout, with no account required.
- **Practitioner portal** (`/practitioner/login`, `/practitioner/dashboard`)
  — sheikhs sign in and see their confirmed upcoming/past appointments,
  client contact info, intake answers, and a one-click Zoom start link.
- **Admin portal** (`/admin/login`) — platform administration (login is
  wired up; the rest of the admin surface is a follow-on slice).
- **Background jobs** (Vercel Cron) — expire abandoned reservations, retry
  failed Zoom meeting creation, and send appointment reminder emails.

This README covers local development setup. For third-party integrations and
production deployment, see:

- [`docs/STRIPE_SETUP.md`](docs/STRIPE_SETUP.md) — Stripe account, API keys,
  and webhook configuration.
- [`docs/ZOOM_SETUP.md`](docs/ZOOM_SETUP.md) — Zoom Server-to-Server OAuth
  app setup.
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Vercel deployment, database
  migrations, and Cron Jobs.

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16.2.4 (App Router), React 19.2.4 |
| Database | PostgreSQL (any Postgres 14+; Neon / Vercel Postgres / Supabase / RDS all work) |
| ORM | Prisma 7 (`@prisma/adapter-pg` driver adapter) |
| Auth | Hand-rolled: `bcryptjs` password hashing + DB-backed session tokens in `httpOnly` cookies (see [Architecture notes](#authentication)) |
| Payments | Stripe Checkout Sessions |
| Video | Zoom Server-to-Server OAuth (one org-managed app for all practitioners) |
| Email | Resend + React Email templates |
| Background jobs | Vercel Cron Jobs → `/api/cron/*` Route Handlers → plain functions in `lib/jobs/` |
| Validation | Zod |
| Testing | Vitest (unit + integration against a real test DB) + Playwright (E2E) |

## Prerequisites

- Node.js 20.9+ (Next.js 16 requirement)
- PostgreSQL 14+ running locally (or a connection string to a remote instance)
- A Stripe account in **test mode** (see [`docs/STRIPE_SETUP.md`](docs/STRIPE_SETUP.md))
- A Zoom account with access to create a Server-to-Server OAuth app (see [`docs/ZOOM_SETUP.md`](docs/ZOOM_SETUP.md)) — optional for pure UI/booking-flow work, but required for Zoom links to actually generate
- A Resend account + API key — optional locally (email send failures are logged and swallowed, never block a booking)

## Local development setup

### 1. Install dependencies

```bash
npm install
```

`postinstall` automatically runs `prisma generate`, which regenerates the
Prisma Client into `generated/` (gitignored — this directory must be
regenerated after every fresh `npm install` and after any `prisma/schema.prisma`
change; there is no need to run it manually after `npm install`, but you will
need `npm run db:generate` after editing the schema directly).

### 2. Create a local database

Using the `psql` CLI against a Postgres server you already have running:

```bash
psql -U postgres -c "CREATE ROLE mymisbah WITH LOGIN PASSWORD 'mymisbah_dev_password';"
psql -U postgres -c "CREATE DATABASE mymisbah_dev OWNER mymisbah;"
```

The booking-exclusion-constraint migration runs `CREATE EXTENSION IF NOT
EXISTS btree_gist` for you — no extra setup needed, as long as your Postgres
role can create extensions (true for a fresh local install; on managed
providers this contrib extension is allowlisted by default on Neon, Supabase,
and Vercel Postgres).

If you'd rather use Docker instead of a native install:

```bash
docker run --name mymisbah-postgres -e POSTGRES_USER=mymisbah \
  -e POSTGRES_PASSWORD=mymisbah_dev_password -e POSTGRES_DB=mymisbah_dev \
  -p 5432:5432 -d postgres:16
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Then fill in the values. See the comments in `.env.example` for what each
variable is for; the sections below cover the ones that need setup on a
third-party dashboard:

- **Stripe** → [`docs/STRIPE_SETUP.md`](docs/STRIPE_SETUP.md)
- **Zoom** → [`docs/ZOOM_SETUP.md`](docs/ZOOM_SETUP.md)
- **Resend** → sign up at [resend.com](https://resend.com), create an API
  key, and set `RESEND_API_KEY` + `EMAIL_FROM` (must be a verified sending
  domain in production; Resend's shared sandbox domain works for local dev).

For `APP_SECRET`, `CRON_SECRET`, and `ZOOM_TOKEN_ENCRYPTION_KEY`, generate a
fresh random value per environment (the exact commands are in
`.env.example`'s comments) — never reuse the same secret across local, test,
and production.

### 4. Run migrations and seed data

```bash
npm run db:migrate      # applies prisma/migrations/*, prompts to create prisma/migrations if diverged
npm run db:seed         # creates SystemSettings, ServiceCategories, an intake form, and 3 practitioners from lib/data.ts
```

The seed script prints the credentials it creates. By default:

- **Admin:** `admin@mymisbah.example` / `ChangeMe123!`
- **Practitioners:** `<practitioner-slug>@mymisbah.example` / `ChangeMe123!`
  (slugs come from `lib/data.ts`, e.g. `sheikh-zubair-sidyot@mymisbah.example`)

Change these passwords (or re-seed with different ones) before using
anything but a local/dev database — `prisma/seed.ts` is idempotent (`upsert`
throughout), so it's safe to re-run.

### 5. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`. `/book` lists all approved practitioners;
`/practitioner/login` and `/admin/login` are the portal entry points.

## Testing

Three independent layers, all runnable locally against the same test
database configuration (`.env.test`, gitignored — copy `.env.example` to
`.env.test` and point `DATABASE_URL` at a **separate** database, e.g.
`mymisbah_test`, so tests never touch dev data):

```bash
# Unit tests (pure functions — e.g. the availability engine, DST-safe by design)
# + integration tests (real Postgres — reservation concurrency, Stripe
# webhook idempotency/out-of-order delivery) via Vitest:
npm run test          # single run
npm run test:watch    # watch mode

# End-to-end (Playwright): spins up a real Next.js dev server on :3100 with
# PAYMENTS_PROVIDER=fake (see lib/payments/fake.ts — an in-process Stripe
# stand-in used *only* for this suite, refused outright in production),
# seeds/tears down its own fixture data, and drives the full booking wizard
# through a real signed Stripe webhook delivery:
npm run test:e2e
```

Vitest reads `DATABASE_URL` etc. from `vitest.setup.ts` → `.env.test`.
Playwright loads `.env.test` directly in `playwright.config.ts`. Both need a
real reachable Postgres database — there is no mocked DB layer for the
integration/E2E suites by design, since the behavior under test (Postgres
`EXCLUDE` constraints, transaction isolation, webhook idempotency) only
exists at that layer.

## Architecture notes

### Authentication

Custom-built rather than a third-party auth library, to avoid an
early-compatibility risk against a brand-new major Next.js version and to
get instant session revocation (needed to suspend a practitioner or
force-logout everywhere). See `lib/auth/`:

- Passwords hashed with `bcryptjs` (pure JS, no native build step — safe on
  Vercel's build environment).
- Sessions are cryptographically random tokens (`crypto.randomBytes`); only
  a SHA-256 hash of the token is stored in `Session`, never the raw token.
- Cookies are `httpOnly`, `Secure` (in production), `SameSite=Lax`.
- `proxy.ts` (Next.js 16's replacement for `middleware.ts`, Node.js runtime
  only) does a cheap cookie-presence redirect for UX only. Real
  authorization happens server-side via `requireUser` / `requireAdmin` /
  `requirePractitioner` (`lib/auth/guards.ts`) in every protected Server
  Component, Server Action, and Route Handler — defense in depth, never
  trust the proxy alone.

### Double-booking prevention

Slot exclusivity is enforced at three layers, from advisory to absolute:

1. The availability engine (`lib/availability/`) computes free slots from
   `AvailabilityRule` minus existing `BookingReservation`/`Appointment` rows.
2. The reserve endpoint (`app/api/public/bookings/reserve/route.ts`)
   re-checks the slot inside a transaction before creating a `HOLDING`
   `BookingReservation`.
3. **Database-level safety net:** a Postgres `EXCLUDE USING gist` constraint
   (see `prisma/migrations/20260716181100_add_booking_exclusion_constraint/`)
   makes it physically impossible to persist two overlapping
   holding-or-active rows for the same practitioner, even across concurrent
   requests hitting different serverless instances. Covered by
   `tests/integration/reservation-concurrency.test.ts`.

### Payment confirmation & idempotency

Stripe Checkout Sessions are created server-side
(`app/api/public/bookings/checkout/route.ts`); the webhook handler
(`app/api/webhooks/stripe/route.ts`) is the *only* place an appointment is
ever marked `CONFIRMED`. Every inbound event is persisted to
`StripeWebhookEvent` keyed by Stripe's event id before processing, so
retried/duplicate deliveries are no-ops, and out-of-order deliveries (e.g. a
delayed `payment_intent.payment_failed` arriving after a later
`checkout.session.completed` already confirmed the booking) can't undo a
confirmed appointment. Covered by `tests/integration/stripe-webhook.test.ts`.

### Zoom meeting creation

Meeting creation happens as a fire-and-forget step right after payment
confirmation, and is safe to retry: `ensureZoomMeetingForAppointment` is a
no-op if the appointment already has a `ZoomMeeting` row. A Cron job
(`/api/cron/retry-zoom-meetings`, every 10 minutes) sweeps for confirmed
appointments still missing a meeting (e.g. because Zoom's API was down at
confirmation time) and retries.

## Repository layout

```
app/
  (public site pages — unchanged from the marketing site)
  book/                      Public booking wizard (multi-step, client + server components)
  practitioner/              Practitioner portal (login, dashboard)
  admin/                     Admin portal (login; dashboard is a follow-on)
  api/
    public/                  Unauthenticated booking API (practitioners, availability, reserve, intake, checkout)
    webhooks/stripe/         Stripe webhook handler
    cron/                    Vercel Cron-triggered jobs (bearer-secret protected)
components/
  booking/steps/             The 4 wizard steps (service, slot, intake, review/pay)
  practitioner/              Practitioner dashboard components
lib/
  auth/                      Password hashing, sessions, guards, server actions
  availability/              Pure slot-computation engine (DST-safe, unit tested)
  crypto/                    AES-256-GCM encryption for secrets at rest (Zoom tokens)
  payments/                  Stripe provider + fake provider for E2E tests
  video/                     Zoom Server-to-Server OAuth provider
  email/                     Resend provider + React Email templates
  jobs/                      Cron job logic (plain, unit-testable functions)
  db/, rate-limit/, logger.ts, http/errors.ts
prisma/
  schema.prisma              Full data model
  migrations/                Including the double-booking exclusion constraint
  seed.ts                    Seeds practitioners/services from lib/data.ts
tests/
  integration/               Vitest, against a real Postgres test database
  e2e/                       Playwright, full booking flow through a real webhook delivery
docs/
  STRIPE_SETUP.md, ZOOM_SETUP.md, DEPLOYMENT.md
```

## Deploy on Vercel

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the full checklist
(environment variables, running migrations against the production database,
Stripe/Zoom production configuration, and Vercel Cron Jobs, which are already
declared in `vercel.json`).
