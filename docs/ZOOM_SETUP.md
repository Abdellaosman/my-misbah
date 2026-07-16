# Zoom setup

V1 uses a single **org-managed Server-to-Server OAuth app** — one Zoom app
whose credentials create every meeting, hosted under one Zoom user
(`ZOOM_HOST_EMAIL`), rather than a per-practitioner OAuth consent flow. This
is intentionally the simplest thing that works for the current scale; the
`ZoomConnection` table is already practitioner-scoped (nullable
`practitionerId`) so per-sheikh OAuth can be added later without a schema
rewrite. Server-side code lives in `lib/video/zoom.ts` (`ZoomVideoProvider`,
implementing the `VideoProvider` interface in `lib/video/provider.ts`).

## 1. Prerequisites

- A Zoom account with a **Pro, Business, or Enterprise** plan (Server-to-Server
  OAuth apps require a paid account — Basic/free accounts can't create them).
- [Zoom App Marketplace](https://marketplace.zoom.us) access for that
  account (Marketplace access is usually restricted to the account owner or
  an admin — ask your Zoom account owner if you don't see "Develop" in the
  top nav).

## 2. Create the Server-to-Server OAuth app

1. Go to [marketplace.zoom.us/develop/create](https://marketplace.zoom.us/develop/create).
2. Choose **Server-to-Server OAuth**.
3. Give it a name (e.g. "My Misbah Booking Platform") and continue through
   the basic info screen (company name, developer contact email — these are
   just Marketplace metadata, not functional).

## 3. Get credentials

On the app's **App Credentials** tab, you'll see:

| Env var | Field |
|---|---|
| `ZOOM_ACCOUNT_ID` | Account ID |
| `ZOOM_CLIENT_ID` | Client ID |
| `ZOOM_CLIENT_SECRET` | Client Secret |

## 4. Add scopes

On the **Scopes** tab, add:

- `meeting:write:admin` — create/update/delete meetings on behalf of any
  user on the account (needed since meetings are created under
  `ZOOM_HOST_EMAIL`, a specific licensed user, by the org-level app rather
  than by that user's own OAuth grant).

(`lib/video/zoom.ts` records this same scope string on the `ZoomConnection`
row it creates for bookkeeping/audit purposes — if you ever change the
scopes granted in the Marketplace, there's nothing else to update in code.)

## 5. Activate the app

Server-to-Server OAuth apps don't need Marketplace review — after adding
scopes, go to the **Activation** tab and activate it. It's immediately live.

## 6. Set the host user

`ZOOM_HOST_EMAIL` must be the email of a **licensed** Zoom user on that same
account — every meeting the platform creates is created "as" this user (via
`POST /users/{userId}/meetings`, see `lib/video/zoom.ts`), and its Zoom
Personal Meeting settings (e.g. waiting room defaults) don't affect
per-meeting settings we already set explicitly (`waiting_room: true`,
`host_video: true`, `join_before_host: false`, no registration required).

This can be a shared/service Zoom license dedicated to the platform, or a
real staff member's license — either works identically from the API's
perspective. Whoever's email this is will see "Start Zoom Meeting" links in
the practitioner dashboard work under their account's meeting settings.

## 7. Generate the token-encryption key

Zoom access tokens are cached in the `ZoomConnection` table (so serverless
invocations share one token instead of each re-authenticating) and encrypted
at rest with AES-256-GCM (`lib/crypto/encryption.ts`). Generate a fresh
32-byte base64 key per environment — **do not reuse this across
environments, and never commit it**:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Set the result as `ZOOM_TOKEN_ENCRYPTION_KEY`.

## 8. Verify

With all five `ZOOM_*` variables set, complete a test booking end-to-end
(through the real Stripe integration, or by delivering a webhook manually —
see [`STRIPE_SETUP.md`](STRIPE_SETUP.md)). On confirmation,
`ensureZoomMeetingForAppointment` (`lib/video/zoom.ts`) fetches an OAuth
token, creates the meeting, and stores the join/start URLs on a
`ZoomMeeting` row. If it fails (bad credentials, host email not licensed,
etc.), the error is logged (`Post-confirmation Zoom meeting creation
failed; will be retried by cron sweep`) but never blocks the booking itself
— `/api/cron/retry-zoom-meetings` retries every 10 minutes (see
`vercel.json`) until it succeeds.
