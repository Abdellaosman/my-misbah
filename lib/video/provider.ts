export interface CreateMeetingInput {
  topic: string;
  /** ISO 8601 instant (UTC) the meeting starts at. */
  startTimeIso: string;
  durationMinutes: number;
  /** Email of the Zoom user the meeting is scheduled under. */
  hostEmail: string;
}

export interface CreateMeetingResult {
  providerMeetingId: string;
  joinUrl: string;
  /** Host-only URL — never expose this to clients. */
  startUrl: string;
  password?: string;
}

/**
 * Video-conferencing provider abstraction. Zoom (Server-to-Server OAuth,
 * one org-managed account for V1) is the only implementation today
 * (lib/video/zoom.ts), but call sites depend on this interface so a second
 * provider, or per-practitioner Zoom OAuth in a later phase, is additive.
 */
export interface VideoProvider {
  createMeeting(input: CreateMeetingInput): Promise<CreateMeetingResult>;
  deleteMeeting(providerMeetingId: string): Promise<void>;
}
