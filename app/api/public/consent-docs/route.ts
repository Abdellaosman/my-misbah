import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withErrorHandling } from "@/lib/http/errors";

/**
 * Public, read-only lookup of the current versioned consent / disclaimer
 * text shown before checkout. Kept in `SystemSetting` so admins can update
 * the wording without a deploy; the `version` string is what gets recorded
 * on each `ConsentRecord` so historical bookings always point at the exact
 * text the client agreed to at the time.
 */
export const GET = withErrorHandling(async () => {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: "consent_docs" },
  });

  const value = (setting?.value as Record<string, string> | undefined) ?? {
    version: "v1",
    disclaimer: "",
    privacySummary: "",
    cancellationSummary: "",
    consentToConsult: "",
  };

  return NextResponse.json({ consentDocs: value });
});
