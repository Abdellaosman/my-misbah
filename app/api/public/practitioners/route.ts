import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withErrorHandling } from "@/lib/http/errors";
import { formatMoney } from "@/lib/money";

export const GET = withErrorHandling(async () => {
  const practitioners = await prisma.practitionerProfile.findMany({
    where: { approvalStatus: "APPROVED", deletedAt: null },
    orderBy: { displayName: "asc" },
    select: {
      slug: true,
      displayName: true,
      title: true,
      shortBio: true,
      photoUrl: true,
      languages: true,
      areasOfGuidance: true,
      timezone: true,
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
        },
        orderBy: { durationMinutes: "asc" },
      },
    },
  });

  return NextResponse.json({
    practitioners: practitioners.map((p) => ({
      ...p,
      services: p.services.map((s) => ({ ...s, price: formatMoney(s.price) })),
    })),
  });
});
