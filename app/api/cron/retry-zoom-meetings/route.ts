import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/http/errors";
import { assertCronRequest } from "@/lib/jobs/cron-auth";
import { retryMissingZoomMeetings } from "@/lib/jobs/retry-zoom-meetings";

export const GET = withErrorHandling(async (request: Request) => {
  assertCronRequest(request);
  const result = await retryMissingZoomMeetings();
  return NextResponse.json(result);
});
