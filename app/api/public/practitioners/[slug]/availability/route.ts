import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withErrorHandling, NotFoundError, AppError } from "@/lib/http/errors";
import { availabilityQuerySchema } from "@/lib/validation/booking";
import { loadBookableService, getAvailableSlots } from "@/lib/availability/service";

export const GET = withErrorHandling(async (
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) => {
  const { slug } = await params;
  const url = new URL(request.url);

  const parsed = availabilityQuerySchema.safeParse({
    serviceId: url.searchParams.get("serviceId"),
    from: url.searchParams.get("from"),
    to: url.searchParams.get("to"),
  });
  if (!parsed.success) {
    throw new AppError("serviceId, from, and to are required (from/to must be ISO datetimes)", 400, "invalid_query");
  }

  const { serviceId, from, to } = parsed.data;

  const practitioner = await prisma.practitionerProfile.findUnique({
    where: { slug },
    select: { id: true, approvalStatus: true, deletedAt: true },
  });
  if (!practitioner || practitioner.deletedAt || practitioner.approvalStatus !== "APPROVED") {
    throw new NotFoundError("Practitioner not found");
  }

  const service = await loadBookableService(serviceId);
  if (service.practitionerId !== practitioner.id) {
    throw new NotFoundError("This service does not belong to this practitioner");
  }

  const slots = await getAvailableSlots({
    service,
    fromUtc: new Date(from),
    toUtc: new Date(to),
  });

  return NextResponse.json({
    slots: slots.map((s) => ({ startAt: s.startAtUtc.toISOString(), endAt: s.endAtUtc.toISOString() })),
  });
});
