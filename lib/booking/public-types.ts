/**
 * Plain, JSON-serializable shapes shared between the server components that
 * load booking data (via Prisma) and the client-side `BookingWizard`. Kept
 * separate from the Prisma models so the client bundle never depends on
 * `@/generated/prisma`.
 */

export type IntakeFieldType =
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "DROPDOWN"
  | "RADIO"
  | "MULTI_SELECT"
  | "CHECKBOX"
  | "AGREEMENT";

export interface WizardIntakeQuestion {
  id: string;
  label: string;
  helpText: string | null;
  fieldType: IntakeFieldType;
  options: string[] | null;
  isRequired: boolean;
  order: number;
}

export interface WizardService {
  id: string;
  name: string;
  slug: string;
  description: string;
  durationMinutes: number;
  price: string;
  currency: string;
  cancellationPolicy: string | null;
  refundPolicy: string | null;
  minNoticeMinutes: number;
  maxAdvanceDays: number;
  intakeQuestions: WizardIntakeQuestion[];
}

export interface WizardPractitioner {
  slug: string;
  displayName: string;
  title: string | null;
  shortBio: string | null;
  photoUrl: string | null;
  timezone: string;
  languages: string[];
  areasOfGuidance: string[];
  services: WizardService[];
}

export interface ConsentDocs {
  version: string;
  disclaimer: string;
  privacySummary: string;
  cancellationSummary: string;
  consentToConsult: string;
}
