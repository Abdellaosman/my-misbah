import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/http/errors";
import { assertCronRequest } from "@/lib/jobs/cron-auth";
import { expireStaleReservationsAndPayments } from "@/lib/jobs/expire-reservations";

export const GET = withErrorHandling(async (request: Request) => {
  assertCronRequest(request);
  const result = await expireStaleReservationsAndPayments();
  return NextResponse.json(result);
});
