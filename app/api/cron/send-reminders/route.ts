import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/http/errors";
import { assertCronRequest } from "@/lib/jobs/cron-auth";
import { sendDueAppointmentReminders } from "@/lib/jobs/send-reminders";

export const GET = withErrorHandling(async (request: Request) => {
  assertCronRequest(request);
  const result = await sendDueAppointmentReminders();
  return NextResponse.json(result);
});
