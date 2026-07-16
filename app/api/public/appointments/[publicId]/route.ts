import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withErrorHandling, NotFoundError } from "@/lib/http/errors";
import { formatMoney } from "@/lib/money";

/**
 * Public, read-only status lookup for the post-checkout confirmation page.
 * `publicId` (e.g. "MM-7F3K2Q") is a short reference code, not a secret —
 * so only non-sensitive summary fields are returned here. No intake
 * answers, no Zoom start URL, no internal notes.
 */
export const GET = withErrorHandling(async (
  _request: Request,
  { params }: { params: Promise<{ publicId: string }> },
) => {
  const { publicId } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: { publicId },
    select: {
      publicId: true,
      status: true,
      paymentStatus: true,
      startAt: true,
      endAt: true,
      clientTimezone: true,
      priceAmount: true,
      currency: true,
      practitioner: { select: { displayName: true, slug: true } },
      service: { select: { name: true, durationMinutes: true } },
      zoomMeeting: { select: { joinUrl: true, password: true } },
    },
  });

  if (!appointment) {
    throw new NotFoundError("Appointment not found");
  }

  return NextResponse.json({
    appointment: {
      publicId: appointment.publicId,
      status: appointment.status,
      paymentStatus: appointment.paymentStatus,
      startAt: appointment.startAt.toISOString(),
      endAt: appointment.endAt.toISOString(),
      clientTimezone: appointment.clientTimezone,
      price: formatMoney(appointment.priceAmount),
      currency: appointment.currency,
      practitionerName: appointment.practitioner.displayName,
      practitionerSlug: appointment.practitioner.slug,
      serviceName: appointment.service.name,
      durationMinutes: appointment.service.durationMinutes,
      zoomJoinUrl: appointment.zoomMeeting?.joinUrl ?? null,
    },
  });
});
