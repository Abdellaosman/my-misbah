import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { withErrorHandling, ConflictError, NotFoundError, AppError, RateLimitedError } from "@/lib/http/errors";
import { submitIntakeSchema } from "@/lib/validation/booking";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const POST = withErrorHandling(async (
  request: Request,
  { params }: { params: Promise<{ reservationId: string }> },
) => {
  const { reservationId } = await params;
  const ip = getClientIp(request.headers);
  const userAgent = request.headers.get("user-agent");

  const rateLimit = await checkRateLimit({
    action: "booking-intake",
    identifier: ip,
    limit: 30,
    windowSeconds: 10 * 60,
  });
  if (!rateLimit.allowed) {
    throw new RateLimitedError();
  }

  const body = await request.json();
  const { contact, intake, consent } = submitIntakeSchema.parse(body);

  const reservation = await prisma.bookingReservation.findUnique({
    where: { id: reservationId },
    include: { service: { select: { intakeFormId: true } } },
  });
  if (!reservation) {
    throw new NotFoundError("Reservation not found");
  }
  if (reservation.status !== "HOLDING") {
    throw new ConflictError("This reservation is no longer active.");
  }
  if (reservation.expiresAt.getTime() <= Date.now()) {
    throw new ConflictError("Your reservation has expired. Please choose a new time.");
  }

  if (reservation.service.intakeFormId) {
    const questionIds = new Set(
      (
        await prisma.intakeQuestion.findMany({
          where: { formId: reservation.service.intakeFormId },
          select: { id: true, isRequired: true },
        })
      ).map((q) => q.id),
    );
    for (const answer of intake.answers) {
      if (!questionIds.has(answer.questionId)) {
        throw new AppError("One or more answers reference an unknown question.", 400, "invalid_answer");
      }
    }
  }

  await prisma.$transaction(async (tx) => {
    const client = await tx.client.upsert({
      where: { email: contact.email },
      create: {
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        country: contact.country,
        timezone: contact.timezone,
        preferredLanguage: contact.preferredLanguage,
      },
      update: {
        firstName: contact.firstName,
        lastName: contact.lastName,
        phone: contact.phone,
        country: contact.country,
        timezone: contact.timezone,
        preferredLanguage: contact.preferredLanguage,
      },
    });
    void client;

    await tx.bookingReservation.update({
      where: { id: reservationId },
      data: { clientEmail: contact.email },
    });

    const existingSubmission = await tx.intakeSubmission.findUnique({ where: { reservationId } });
    if (existingSubmission) {
      await tx.intakeAnswer.deleteMany({ where: { submissionId: existingSubmission.id } });
      await tx.intakeSubmission.update({
        where: { id: existingSubmission.id },
        data: {
          reasonForBooking: intake.reasonForBooking,
          situationDescription: intake.situationDescription,
          backgroundInfo: intake.backgroundInfo,
          desiredOutcome: intake.desiredOutcome,
          answers: {
            create: intake.answers.map((a) => ({
              questionId: a.questionId,
              answerText: a.answerText,
              answerOptions: a.answerOptions,
            })),
          },
        },
      });
    } else {
      await tx.intakeSubmission.create({
        data: {
          reservationId,
          reasonForBooking: intake.reasonForBooking,
          situationDescription: intake.situationDescription,
          backgroundInfo: intake.backgroundInfo,
          desiredOutcome: intake.desiredOutcome,
          answers: {
            create: intake.answers.map((a) => ({
              questionId: a.questionId,
              answerText: a.answerText,
              answerOptions: a.answerOptions,
            })),
          },
        },
      });
    }

    await tx.consentRecord.create({
      data: {
        reservationId,
        consentVersion: consent.consentVersion,
        ipAddress: ip,
        userAgent,
      },
    });
  });

  return NextResponse.json({ success: true });
});
