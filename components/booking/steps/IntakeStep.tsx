"use client";

import { useState } from "react";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import type { ConsentDocs, WizardIntakeQuestion } from "@/lib/booking/public-types";
import { listTimezones } from "@/lib/booking/timezones";
import type { SubmitIntakeInput } from "@/lib/validation/booking";

interface IntakeStepProps {
  questions: WizardIntakeQuestion[];
  consentDocs: ConsentDocs;
  defaultTimezone: string;
  onSubmit: (payload: SubmitIntakeInput) => void;
  isSubmitting: boolean;
  submitError: string | null;
}

type AnswerValue = string | string[];

export default function IntakeStep({
  questions,
  consentDocs,
  defaultTimezone,
  onSubmit,
  isSubmitting,
  submitError,
}: IntakeStepProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState(defaultTimezone);
  const [reasonForBooking, setReasonForBooking] = useState("");
  const [situationDescription, setSituationDescription] = useState("");
  const [backgroundInfo, setBackgroundInfo] = useState("");
  const [desiredOutcome, setDesiredOutcome] = useState("");
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const timezoneOptions = listTimezones();

  function setAnswer(questionId: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    for (const q of questions) {
      if (!q.isRequired) continue;
      const value = answers[q.id];
      const isEmpty =
        value === undefined ||
        (typeof value === "string" && value.trim().length === 0) ||
        (Array.isArray(value) && value.length === 0);
      if (isEmpty) {
        setValidationError(`Please answer: "${q.label}"`);
        return;
      }
    }

    if (!consentAccepted) {
      setValidationError("Please accept the consent terms to continue.");
      return;
    }

    onSubmit({
      contact: {
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        country: country || undefined,
        timezone,
        preferredLanguage: undefined,
      },
      intake: {
        reasonForBooking,
        situationDescription,
        backgroundInfo: backgroundInfo || undefined,
        desiredOutcome: desiredOutcome || undefined,
        answers: questions.map((q) => {
          const value = answers[q.id];
          if (Array.isArray(value)) {
            return { questionId: q.id, answerOptions: value };
          }
          return { questionId: q.id, answerText: value ?? "" };
        }),
      },
      consent: {
        consentVersion: consentDocs.version,
        accepted: true,
      },
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="font-serif text-xl text-[#1A2B50] font-semibold mb-1">
        Your details
      </h2>
      <p className="text-sm text-[#6b6878] mb-5">
        This information is kept confidential and shared only with your selected guide.
      </p>

      <div className="space-y-5">
        {/* Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="First name" required>
            <input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Last name" required>
            <input
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Email" required>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Phone (optional)">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Country (optional)">
            <input value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Your timezone">
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputClass}>
              {!timezoneOptions.includes(timezone) && <option value={timezone}>{timezone}</option>}
              {timezoneOptions.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="h-px bg-[#EAE3D4]" />

        <Field label="What would you like guidance on?" required>
          <textarea
            required
            rows={2}
            value={reasonForBooking}
            onChange={(e) => setReasonForBooking(e.target.value)}
            className={inputClass}
            placeholder="A brief summary of what you'd like to discuss"
          />
        </Field>

        <Field label="Please describe your situation" required>
          <textarea
            required
            rows={4}
            value={situationDescription}
            onChange={(e) => setSituationDescription(e.target.value)}
            className={inputClass}
            placeholder="Share as much detail as you're comfortable with — this helps your guide prepare"
          />
        </Field>

        <Field label="Any relevant background? (optional)">
          <textarea
            rows={2}
            value={backgroundInfo}
            onChange={(e) => setBackgroundInfo(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="What outcome are you hoping for? (optional)">
          <textarea
            rows={2}
            value={desiredOutcome}
            onChange={(e) => setDesiredOutcome(e.target.value)}
            className={inputClass}
          />
        </Field>

        {questions.length > 0 && <div className="h-px bg-[#EAE3D4]" />}

        {questions.map((q) => (
          <IntakeQuestionField key={q.id} question={q} value={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} />
        ))}

        {/* Consent */}
        <div className="bg-[#F3EDE0] rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <ShieldCheck size={16} className="text-[#1A2B50] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#4a4a5a] leading-relaxed">{consentDocs.disclaimer}</p>
          </div>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={consentAccepted}
              onChange={(e) => setConsentAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#C8680A] flex-shrink-0"
            />
            <span className="text-xs text-[#4a4a5a] leading-relaxed">{consentDocs.consentToConsult}</span>
          </label>
        </div>
      </div>

      {(validationError || submitError) && (
        <div className="flex items-center gap-2 text-red-600 text-sm mt-4">
          <AlertCircle size={15} />
          {validationError ?? submitError}
        </div>
      )}

      <button
        type="submit"
        data-testid="intake-submit-button"
        disabled={isSubmitting}
        className="w-full mt-6 text-white font-bold py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:brightness-110 disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, #C8680A 0%, #E07D10 100%)" }}
      >
        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
        Continue to Review
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-[#EAE3D4] bg-white px-3.5 py-2.5 text-sm text-[#1A2B50] placeholder:text-[#9895a2] focus:outline-none focus:border-[#1A2B50] transition-colors";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-[#1A2B50] mb-1.5">
        {label} {required && <span className="text-[#C8680A]">*</span>}
      </span>
      {children}
    </label>
  );
}

function IntakeQuestionField({
  question,
  value,
  onChange,
}: {
  question: WizardIntakeQuestion;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
}) {
  const options = question.options ?? [];

  if (question.fieldType === "AGREEMENT") {
    return (
      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={value === "true"}
          onChange={(e) => onChange(e.target.checked ? "true" : "")}
          className="mt-0.5 w-4 h-4 accent-[#C8680A] flex-shrink-0"
        />
        <span className="text-xs text-[#4a4a5a] leading-relaxed">
          {question.label} {question.isRequired && <span className="text-[#C8680A]">*</span>}
        </span>
      </label>
    );
  }

  if (question.fieldType === "CHECKBOX") {
    return (
      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={value === "true"}
          onChange={(e) => onChange(e.target.checked ? "true" : "")}
          className="mt-0.5 w-4 h-4 accent-[#C8680A] flex-shrink-0"
        />
        <span className="text-sm text-[#1A2B50]">
          {question.label} {question.isRequired && <span className="text-[#C8680A]">*</span>}
        </span>
      </label>
    );
  }

  return (
    <Field label={question.label} required={question.isRequired}>
      {question.helpText && <span className="block text-xs text-[#9895a2] mb-1.5">{question.helpText}</span>}

      {question.fieldType === "LONG_TEXT" && (
        <textarea rows={3} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      )}

      {question.fieldType === "SHORT_TEXT" && (
        <input value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      )}

      {question.fieldType === "DROPDOWN" && (
        <select value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className={inputClass}>
          <option value="" disabled>
            Select an option
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {question.fieldType === "RADIO" && (
        <div className="flex flex-wrap gap-3 mt-1">
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="w-4 h-4 accent-[#C8680A]"
              />
              <span className="text-sm text-[#4a4a5a]">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {question.fieldType === "MULTI_SELECT" && (
        <div className="flex flex-wrap gap-3 mt-1">
          {options.map((opt) => {
            const selected = Array.isArray(value) && value.includes(opt);
            return (
              <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(e) => {
                    const current = Array.isArray(value) ? value : [];
                    onChange(e.target.checked ? [...current, opt] : current.filter((v) => v !== opt));
                  }}
                  className="w-4 h-4 accent-[#C8680A]"
                />
                <span className="text-sm text-[#4a4a5a]">{opt}</span>
              </label>
            );
          })}
        </div>
      )}
    </Field>
  );
}
