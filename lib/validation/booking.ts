import { z } from "zod";

export const availabilityQuerySchema = z.object({
  serviceId: z.string().uuid(),
  from: z.string().datetime(),
  to: z.string().datetime(),
});

export const reserveSlotSchema = z.object({
  serviceId: z.string().uuid(),
  startAt: z.string().datetime(),
});

export const contactSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().max(30).optional(),
  country: z.string().trim().max(100).optional(),
  timezone: z.string().min(1).max(100),
  preferredLanguage: z.string().trim().max(50).optional(),
});

export const intakeAnswerSchema = z.object({
  questionId: z.string().uuid(),
  answerText: z.string().max(5000).optional(),
  answerOptions: z.array(z.string().max(200)).max(50).optional(),
});

export const submitIntakeSchema = z.object({
  contact: contactSchema,
  intake: z.object({
    reasonForBooking: z.string().trim().min(1).max(2000),
    situationDescription: z.string().trim().min(1).max(5000),
    backgroundInfo: z.string().trim().max(5000).optional(),
    desiredOutcome: z.string().trim().max(2000).optional(),
    answers: z.array(intakeAnswerSchema).max(50).default([]),
  }),
  consent: z.object({
    consentVersion: z.string().min(1).max(50),
    accepted: z.literal(true),
  }),
});

export type SubmitIntakeInput = z.infer<typeof submitIntakeSchema>;
export type ReserveSlotInput = z.infer<typeof reserveSlotSchema>;
