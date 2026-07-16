import "server-only";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { encryptSecret, decryptSecret } from "@/lib/crypto/encryption";
import type { VideoProvider, CreateMeetingInput, CreateMeetingResult } from "@/lib/video/provider";

const ZOOM_API_BASE = "https://api.zoom.us/v2";
const ZOOM_OAUTH_URL = "https://zoom.us/oauth/token";
// Refresh a bit before actual expiry so a request never races an
// about-to-expire token.
const TOKEN_REFRESH_BUFFER_MS = 60_000;

interface ZoomOAuthTokenResponse {
  access_token: string;
  expires_in: number;
}

/**
 * Fetches (and DB-caches) a Server-to-Server OAuth access token for the
 * single, org-managed Zoom account used for all V1 bookings. Cached in the
 * `ZoomConnection` table (practitionerId = null) rather than purely
 * in-memory so that separate serverless invocations share one token
 * instead of each hitting Zoom's OAuth endpoint.
 */
async function getAccessToken(): Promise<string> {
  const now = new Date();
  const existing = await prisma.zoomConnection.findFirst({
    where: { practitionerId: null, status: "CONNECTED" },
    orderBy: { connectedAt: "desc" },
  });

  if (existing && existing.tokenExpiresAt.getTime() > now.getTime() + TOKEN_REFRESH_BUFFER_MS) {
    return decryptSecret(existing.accessTokenEncrypted);
  }

  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  if (!accountId || !clientId || !clientSecret) {
    throw new Error("Zoom Server-to-Server OAuth environment variables are not configured");
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(
    `${ZOOM_OAUTH_URL}?grant_type=account_credentials&account_id=${encodeURIComponent(accountId)}`,
    {
      method: "POST",
      headers: { Authorization: `Basic ${basicAuth}` },
    },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Zoom OAuth token request failed (${response.status}): ${body}`);
  }

  const token = (await response.json()) as ZoomOAuthTokenResponse;
  const tokenExpiresAt = new Date(now.getTime() + token.expires_in * 1000);
  const accessTokenEncrypted = encryptSecret(token.access_token);

  if (existing) {
    await prisma.zoomConnection.update({
      where: { id: existing.id },
      data: { accessTokenEncrypted, tokenExpiresAt, status: "CONNECTED" },
    });
  } else {
    await prisma.zoomConnection.create({
      data: {
        practitionerId: null,
        zoomUserId: process.env.ZOOM_HOST_EMAIL ?? "org-default",
        accessTokenEncrypted,
        tokenExpiresAt,
        scopes: "meeting:write:admin",
        status: "CONNECTED",
      },
    });
  }

  return token.access_token;
}

interface ZoomCreateMeetingResponse {
  id: number;
  join_url: string;
  start_url: string;
  password?: string;
}

export class ZoomVideoProvider implements VideoProvider {
  async createMeeting(input: CreateMeetingInput): Promise<CreateMeetingResult> {
    const accessToken = await getAccessToken();

    const response = await fetch(`${ZOOM_API_BASE}/users/${encodeURIComponent(input.hostEmail)}/meetings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: input.topic,
        type: 2, // scheduled meeting
        start_time: input.startTimeIso,
        duration: input.durationMinutes,
        timezone: "UTC",
        settings: {
          join_before_host: false,
          waiting_room: true,
          host_video: true,
          participant_video: false,
          approval_type: 2, // no registration required
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Zoom create-meeting request failed (${response.status}): ${body}`);
    }

    const meeting = (await response.json()) as ZoomCreateMeetingResponse;
    return {
      providerMeetingId: String(meeting.id),
      joinUrl: meeting.join_url,
      startUrl: meeting.start_url,
      password: meeting.password,
    };
  }

  async deleteMeeting(providerMeetingId: string): Promise<void> {
    const accessToken = await getAccessToken();
    const response = await fetch(`${ZOOM_API_BASE}/meetings/${encodeURIComponent(providerMeetingId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    // 404 means it's already gone — treat as success for idempotency.
    if (!response.ok && response.status !== 404) {
      const body = await response.text().catch(() => "");
      throw new Error(`Zoom delete-meeting request failed (${response.status}): ${body}`);
    }
  }
}

export const videoProvider: VideoProvider = new ZoomVideoProvider();

/**
 * Creates the Zoom meeting for a confirmed appointment if it doesn't
 * already have one. Safe to call repeatedly (from the webhook and from
 * the retry-sweep cron job) — a `ZoomMeeting` row already existing is
 * treated as success, never re-created.
 */
export async function ensureZoomMeetingForAppointment(appointmentId: string): Promise<void> {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { service: true, zoomMeeting: true },
  });

  if (!appointment) {
    logger.warn("ensureZoomMeetingForAppointment: appointment not found", { appointmentId });
    return;
  }
  if (appointment.zoomMeeting) {
    return;
  }
  if (appointment.status !== "CONFIRMED") {
    logger.warn("ensureZoomMeetingForAppointment: appointment not CONFIRMED, skipping", {
      appointmentId,
      status: appointment.status,
    });
    return;
  }

  const hostEmail = process.env.ZOOM_HOST_EMAIL;
  if (!hostEmail) {
    throw new Error("ZOOM_HOST_EMAIL is not set");
  }

  const meeting = await videoProvider.createMeeting({
    topic: `${appointment.service.name} — My Misbah (${appointment.publicId})`,
    startTimeIso: appointment.startAt.toISOString(),
    durationMinutes: appointment.service.durationMinutes,
    hostEmail,
  });

  await prisma.zoomMeeting.create({
    data: {
      appointmentId: appointment.id,
      zoomMeetingId: meeting.providerMeetingId,
      joinUrl: meeting.joinUrl,
      startUrl: meeting.startUrl,
      password: meeting.password,
      hostZoomUserId: hostEmail,
    },
  });

  logger.info("Zoom meeting created for appointment", { appointmentId: appointment.id });
}
