import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withErrorHandling, NotFoundError } from "@/lib/http/errors";
import { formatMoney } from "@/lib/money";

export const GET = withErrorHandling(async (
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) => {
  const { slug } = await params;

  const practitioner = await prisma.practitionerProfile.findUnique({
    where: { slug },
    select: {
      slug: true,
      displayName: true,
      title: true,
      shortBio: true,
      fullBio: true,
      photoUrl: true,
      qualifications: true,
      languages: true,
      areasOfGuidance: true,
      timezone: true,
      approvalStatus: true,
      deletedAt: true,
      services: {
        where: { isActive: true, approvalStatus: "APPROVED", deletedAt: null },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          durationMinutes: true,
          price: true,
          currency: true,
          cancellationPolicy: true,
          refundPolicy: true,
          minNoticeMinutes: true,
          maxAdvanceDays: true,
          intakeForm: {
            select: {
              id: true,
              questions: {
                select: {
                  id: true,
                  label: true,
                  helpText: true,
                  fieldType: true,
                  options: true,
                  isRequired: true,
                  order: true,
                },
                orderBy: { order: "asc" },
              },
            },
          },
        },
        orderBy: { durationMinutes: "asc" },
      },
    },
  });

  if (!practitioner || practitioner.deletedAt || practitioner.approvalStatus !== "APPROVED") {
    throw new NotFoundError("Practitioner not found");
  }

  const { deletedAt, approvalStatus, ...publicFields } = practitioner;
  void deletedAt;
  void approvalStatus;

  return NextResponse.json({
    practitioner: {
      ...publicFields,
      services: publicFields.services.map((s) => ({ ...s, price: formatMoney(s.price) })),
    },
  });
});
