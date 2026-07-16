import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { hashPassword } from "../lib/auth/password";
import { guides } from "../lib/data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Location -> IANA timezone, used to seed each practitioner's working hours
// in their own local time.
const TIMEZONE_BY_ID: Record<string, string> = {
  "sheikh-zubair-sidyot": "America/Edmonton",
  "sheikh-yahya-abdi-hadi": "America/Vancouver",
  "sheikh-osama-raja": "America/Edmonton",
};

const DEFAULT_ADMIN_EMAIL = "admin@mymisbah.example";
const DEFAULT_ADMIN_PASSWORD = "ChangeMe123!";
const DEFAULT_PRACTITIONER_PASSWORD = "ChangeMe123!";

const CONSENT_DOC_VERSION = "v1";

async function main() {
  console.log("Seeding My Misbah booking platform...");

  await prisma.systemSetting.upsert({
    where: { key: "consent_docs" },
    create: {
      key: "consent_docs",
      description: "Versioned consent / privacy / cancellation / disclaimer text shown at checkout.",
      value: {
        version: CONSENT_DOC_VERSION,
        disclaimer:
          "My Misbah provides Islamic consultation and guidance from qualified sheikhs. It is not a replacement for emergency, medical, psychiatric, legal, or other regulated professional services. If you are experiencing a medical or psychiatric emergency, please contact your local emergency services immediately.",
        privacySummary:
          "Your personal information and the details you share are kept confidential and are only visible to the sheikh you book with and authorized My Misbah administrators for support purposes.",
        cancellationSummary:
          "Cancellation and refund terms are set per service and shown before you pay. Unless stated otherwise, cancellations made outside the stated notice window may not be eligible for a refund.",
        consentToConsult:
          "By booking, you consent to receiving Islamic guidance and consultation from the selected sheikh via a private video call, and confirm the information you provide is accurate to the best of your knowledge.",
      },
    },
    update: {},
  });

  await prisma.systemSetting.upsert({
    where: { key: "booking_rules" },
    create: {
      key: "booking_rules",
      description: "Platform-wide defaults for reservations and reminders.",
      value: {
        reservationHoldMinutes: 12,
        reminderHoursBeforeAppointment: [24, 1],
        phoneRequired: false,
      },
    },
    update: {},
  });

  const generalCategory = await prisma.serviceCategory.upsert({
    where: { slug: "general-guidance" },
    create: {
      slug: "general-guidance",
      name: "General Islamic Guidance",
      description: "Everyday questions on faith, worship, and personal matters.",
    },
    update: {},
  });

  const marriageCategory = await prisma.serviceCategory.upsert({
    where: { slug: "marriage-family" },
    create: {
      slug: "marriage-family",
      name: "Marriage & Family Guidance",
      description: "Support for couples, families, and pre-marital consultation.",
    },
    update: {},
  });

  await prisma.serviceCategory.upsert({
    where: { slug: "youth-guidance" },
    create: {
      slug: "youth-guidance",
      name: "Youth Guidance",
      description: "Guidance tailored for teenagers and young adults.",
    },
    update: {},
  });

  await prisma.serviceCategory.upsert({
    where: { slug: "new-muslim" },
    create: {
      slug: "new-muslim",
      name: "New Muslim Guidance",
      description: "Support for those who have recently accepted Islam.",
    },
    update: {},
  });

  const globalIntakeForm = await prisma.intakeForm.upsert({
    where: { id: "seed-global-intake-form" },
    create: {
      id: "seed-global-intake-form",
      name: "Standard Consultation Intake",
      scope: "GLOBAL",
      questions: {
        create: [
          {
            label: "Have you consulted a sheikh about this matter before?",
            fieldType: "RADIO",
            options: ["Yes", "No"],
            isRequired: true,
            order: 0,
          },
          {
            label: "Is there anything else you would like your sheikh to know before the session?",
            fieldType: "LONG_TEXT",
            isRequired: false,
            order: 1,
          },
          {
            label:
              "I understand that My Misbah provides Islamic consultation and guidance, and is not a replacement for emergency, medical, psychiatric, or legal services.",
            fieldType: "AGREEMENT",
            isRequired: true,
            order: 2,
          },
        ],
      },
    },
    update: {},
  });

  const adminPasswordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);
  const admin = await prisma.user.upsert({
    where: { email: DEFAULT_ADMIN_EMAIL },
    create: {
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
    },
    update: {},
  });
  console.log(`Admin user ready: ${admin.email} / ${DEFAULT_ADMIN_PASSWORD}`);

  const practitionerPasswordHash = await hashPassword(DEFAULT_PRACTITIONER_PASSWORD);

  for (const guide of guides) {
    const email = `${guide.id}@mymisbah.example`;
    const timezone = TIMEZONE_BY_ID[guide.id] ?? "America/Edmonton";

    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        passwordHash: practitionerPasswordHash,
        role: "PRACTITIONER",
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
      },
      update: {},
    });

    const profile = await prisma.practitionerProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        slug: guide.id,
        displayName: guide.name,
        title: guide.title,
        shortBio: guide.shortBio,
        fullBio: guide.fullBio,
        photoUrl: guide.image,
        qualifications: [...guide.education, ...guide.certifications],
        languages: guide.languages,
        areasOfGuidance: guide.expertise,
        timezone,
        approvalStatus: "APPROVED",
      },
      update: {
        displayName: guide.name,
        title: guide.title,
        shortBio: guide.shortBio,
        fullBio: guide.fullBio,
        photoUrl: guide.image,
        qualifications: [...guide.education, ...guide.certifications],
        languages: guide.languages,
        areasOfGuidance: guide.expertise,
      },
    });

    await prisma.service.upsert({
      where: { practitionerId_slug: { practitionerId: profile.id, slug: "general-guidance-session" } },
      create: {
        practitionerId: profile.id,
        categoryId: generalCategory.id,
        name: "General Islamic Guidance",
        slug: "general-guidance-session",
        description:
          "A focused, one-on-one session to discuss everyday questions on faith, worship, or personal matters.",
        durationMinutes: 45,
        price: "60.00",
        currency: "usd",
        isVirtual: true,
        isActive: true,
        approvalStatus: "APPROVED",
        minNoticeMinutes: 120,
        maxAdvanceDays: 60,
        bufferBeforeMinutes: 5,
        bufferAfterMinutes: 10,
        cancellationWindowHours: 48,
        cancellationPolicy:
          "Free cancellation or rescheduling up to 48 hours before your appointment. Cancellations within 48 hours are non-refundable.",
        refundPolicy: "Full refund if cancelled outside the cancellation window; no refund otherwise.",
        intakeFormId: globalIntakeForm.id,
      },
      update: {},
    });

    await prisma.service.upsert({
      where: { practitionerId_slug: { practitionerId: profile.id, slug: "marriage-family-consultation" } },
      create: {
        practitionerId: profile.id,
        categoryId: marriageCategory.id,
        name: "Marriage & Family Consultation",
        slug: "marriage-family-consultation",
        description:
          "A longer session for marriage, family, or pre-marital guidance rooted in Islamic tradition.",
        durationMinutes: 60,
        price: "85.00",
        currency: "usd",
        isVirtual: true,
        isActive: true,
        approvalStatus: "APPROVED",
        minNoticeMinutes: 180,
        maxAdvanceDays: 60,
        bufferBeforeMinutes: 10,
        bufferAfterMinutes: 10,
        cancellationWindowHours: 48,
        cancellationPolicy:
          "Free cancellation or rescheduling up to 48 hours before your appointment. Cancellations within 48 hours are non-refundable.",
        refundPolicy: "Full refund if cancelled outside the cancellation window; no refund otherwise.",
        intakeFormId: globalIntakeForm.id,
      },
      update: {},
    });

    // Recurring weekly availability: Sun-Thu 9am-5pm, practitioner-local time.
    const existingRules = await prisma.availabilityRule.count({
      where: { practitionerId: profile.id },
    });
    if (existingRules === 0) {
      const weekdays = [0, 1, 2, 3, 4]; // Sun-Thu
      await prisma.availabilityRule.createMany({
        data: weekdays.map((weekday) => ({
          practitionerId: profile.id,
          weekday,
          startMinute: 9 * 60,
          endMinute: 17 * 60,
        })),
      });
    }

    console.log(`Practitioner ready: ${user.email} / ${DEFAULT_PRACTITIONER_PASSWORD} (slug: ${profile.slug}, tz: ${timezone})`);
  }

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
