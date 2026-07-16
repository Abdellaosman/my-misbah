import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { formatMoney } from "@/lib/money";
import BookingWizard from "@/components/booking/BookingWizard";
import type { ConsentDocs, WizardPractitioner } from "@/lib/booking/public-types";

export const dynamic = "force-dynamic";

async function loadPractitioner(slug: string): Promise<WizardPractitioner | null> {
  const practitioner = await prisma.practitionerProfile.findUnique({
    where: { slug },
    select: {
      slug: true,
      displayName: true,
      title: true,
      shortBio: true,
      photoUrl: true,
      timezone: true,
      languages: true,
      areasOfGuidance: true,
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
    return null;
  }

  return {
    slug: practitioner.slug,
    displayName: practitioner.displayName,
    title: practitioner.title,
    shortBio: practitioner.shortBio,
    photoUrl: practitioner.photoUrl,
    timezone: practitioner.timezone,
    languages: practitioner.languages,
    areasOfGuidance: practitioner.areasOfGuidance,
    services: practitioner.services.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: s.description,
      durationMinutes: s.durationMinutes,
      price: formatMoney(s.price),
      currency: s.currency,
      cancellationPolicy: s.cancellationPolicy,
      refundPolicy: s.refundPolicy,
      minNoticeMinutes: s.minNoticeMinutes,
      maxAdvanceDays: s.maxAdvanceDays,
      intakeQuestions: (s.intakeForm?.questions ?? []).map((q) => ({
        id: q.id,
        label: q.label,
        helpText: q.helpText,
        fieldType: q.fieldType,
        options: (q.options as string[] | null) ?? null,
        isRequired: q.isRequired,
        order: q.order,
      })),
    })),
  };
}

async function loadConsentDocs(): Promise<ConsentDocs> {
  const setting = await prisma.systemSetting.findUnique({ where: { key: "consent_docs" } });
  const value = (setting?.value as Partial<ConsentDocs> | undefined) ?? {};
  return {
    version: value.version ?? "v1",
    disclaimer: value.disclaimer ?? "",
    privacySummary: value.privacySummary ?? "",
    cancellationSummary: value.cancellationSummary ?? "",
    consentToConsult: value.consentToConsult ?? "",
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ practitionerSlug: string }>;
}) {
  const { practitionerSlug } = await params;
  const practitioner = await loadPractitioner(practitionerSlug);
  if (!practitioner) return {};
  return {
    title: `Book ${practitioner.displayName} — My Misbah`,
    description: `Book a confidential consultation with ${practitioner.displayName}.`,
  };
}

export default async function BookPractitionerPage({
  params,
  searchParams,
}: {
  params: Promise<{ practitionerSlug: string }>;
  searchParams: Promise<{ service?: string; cancelled?: string }>;
}) {
  const { practitionerSlug } = await params;
  const { service: initialServiceId, cancelled } = await searchParams;

  const [practitioner, consentDocs] = await Promise.all([
    loadPractitioner(practitionerSlug),
    loadConsentDocs(),
  ]);

  if (!practitioner) notFound();

  return (
    <div className="bg-[#FAF8F3] min-h-screen">
      <div className="bg-[#1A2B50] px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <Link
            href={`/guides/${practitioner.slug}`}
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={15} />
            Back to {practitioner.displayName}&apos;s Profile
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="font-serif text-2xl md:text-3xl text-[#1A2B50] font-bold mb-1">
          Book with {practitioner.displayName}
        </h1>
        <p className="text-[#6b6878] mb-6">Complete the steps below to schedule your confidential session.</p>

        {cancelled && (
          <div className="flex items-center gap-2 text-amber-700 bg-amber-50 rounded-xl px-4 py-3 text-sm mb-6">
            <Info size={15} className="flex-shrink-0" />
            Your payment was not completed. You can pick up where you left off below.
          </div>
        )}

        <BookingWizard practitioner={practitioner} consentDocs={consentDocs} initialServiceId={initialServiceId} />
      </div>
    </div>
  );
}
