"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import StepIndicator from "@/components/booking/StepIndicator";
import PractitionerSummaryCard from "@/components/booking/PractitionerSummaryCard";
import ServiceStep from "@/components/booking/steps/ServiceStep";
import SlotStep from "@/components/booking/steps/SlotStep";
import IntakeStep from "@/components/booking/steps/IntakeStep";
import ReviewStep from "@/components/booking/steps/ReviewStep";
import { apiFetch, ApiClientError } from "@/lib/booking/api-client";
import type { ConsentDocs, WizardPractitioner, WizardService } from "@/lib/booking/public-types";
import type { SubmitIntakeInput } from "@/lib/validation/booking";

type Step = "service" | "slot" | "intake" | "review";

const STEP_META = [
  { key: "service", label: "Session" },
  { key: "slot", label: "Date & Time" },
  { key: "intake", label: "Details" },
  { key: "review", label: "Payment" },
];

interface ReservationState {
  reservationId: string;
  startAt: string;
  endAt: string;
  expiresAt: string;
  timezone: string;
}

interface BookingWizardProps {
  practitioner: WizardPractitioner;
  consentDocs: ConsentDocs;
  initialServiceId?: string;
}

export default function BookingWizard({ practitioner, consentDocs, initialServiceId }: BookingWizardProps) {
  const router = useRouter();
  const initialService = practitioner.services.find((s) => s.id === initialServiceId) ?? null;

  const [step, setStep] = useState<Step>(initialService ? "slot" : "service");
  const [selectedService, setSelectedService] = useState<WizardService | null>(initialService);
  const [reservation, setReservation] = useState<ReservationState | null>(null);

  const [reserveLoading, setReserveLoading] = useState(false);
  const [reserveError, setReserveError] = useState<string | null>(null);
  const [intakeLoading, setIntakeLoading] = useState(false);
  const [intakeError, setIntakeError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [expiredNotice, setExpiredNotice] = useState(false);

  const currentIndex = STEP_META.findIndex((s) => s.key === step);

  function handleSelectService(service: WizardService) {
    setSelectedService(service);
    setStep("slot");
    setReserveError(null);
  }

  async function handleSelectSlot(startAtIso: string, timezone: string) {
    if (!selectedService) return;
    setReserveLoading(true);
    setReserveError(null);
    try {
      const result = await apiFetch<{
        reservationId: string;
        expiresAt: string;
        startAt: string;
        endAt: string;
      }>("/api/public/bookings/reserve", {
        method: "POST",
        body: JSON.stringify({ serviceId: selectedService.id, startAt: startAtIso }),
      });
      setReservation({
        reservationId: result.reservationId,
        startAt: result.startAt,
        endAt: result.endAt,
        expiresAt: result.expiresAt,
        timezone,
      });
      setExpiredNotice(false);
      setStep("intake");
    } catch (err) {
      setReserveError(err instanceof ApiClientError ? err.message : "Could not hold this time slot. Please try again.");
    } finally {
      setReserveLoading(false);
    }
  }

  async function handleIntakeSubmit(payload: SubmitIntakeInput) {
    if (!reservation) return;
    setIntakeLoading(true);
    setIntakeError(null);
    try {
      await apiFetch(`/api/public/bookings/${reservation.reservationId}/intake`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setStep("review");
    } catch (err) {
      setIntakeError(err instanceof ApiClientError ? err.message : "Could not save your details. Please try again.");
    } finally {
      setIntakeLoading(false);
    }
  }

  async function handlePay() {
    if (!reservation) return;
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const result = await apiFetch<{ checkoutUrl: string }>(
        `/api/public/bookings/${reservation.reservationId}/checkout`,
        { method: "POST" },
      );
      window.location.href = result.checkoutUrl;
    } catch (err) {
      setCheckoutError(err instanceof ApiClientError ? err.message : "Could not start payment. Please try again.");
      setCheckoutLoading(false);
    }
  }

  function handleExpire() {
    setExpiredNotice(true);
    setReservation(null);
    setStep("slot");
  }

  function handleStartOver() {
    setExpiredNotice(false);
    setReservation(null);
    setReserveError(null);
    setIntakeError(null);
    setCheckoutError(null);
    setStep("service");
    setSelectedService(null);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl border border-[#EAE3D4] shadow-sm p-5 sm:p-8">
          <div className="mb-7">
            <StepIndicator steps={STEP_META} currentIndex={currentIndex} />
          </div>

          {expiredNotice && (
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 rounded-xl px-4 py-3 text-sm mb-5">
              <AlertCircle size={15} className="flex-shrink-0" />
              Your reservation hold expired. Please choose a new time.
            </div>
          )}

          {step === "service" && (
            <ServiceStep
              services={practitioner.services}
              selectedServiceId={selectedService?.id ?? null}
              onSelect={handleSelectService}
            />
          )}

          {step === "slot" && selectedService && (
            <SlotStep
              practitionerSlug={practitioner.slug}
              service={selectedService}
              onSelectSlot={handleSelectSlot}
              isReserving={reserveLoading}
              reserveError={reserveError}
            />
          )}

          {step === "intake" && selectedService && reservation && (
            <IntakeStep
              questions={selectedService.intakeQuestions}
              consentDocs={consentDocs}
              defaultTimezone={reservation.timezone}
              onSubmit={handleIntakeSubmit}
              isSubmitting={intakeLoading}
              submitError={intakeError}
            />
          )}

          {step === "review" && selectedService && reservation && (
            <ReviewStep
              practitioner={practitioner}
              service={selectedService}
              startAtIso={reservation.startAt}
              timezone={reservation.timezone}
              expiresAtIso={reservation.expiresAt}
              onPay={handlePay}
              isProcessing={checkoutLoading}
              payError={checkoutError}
              onExpire={handleExpire}
            />
          )}

          {step !== "service" && (
            <button
              type="button"
              onClick={handleStartOver}
              className="text-xs text-[#9895a2] hover:text-[#1A2B50] mt-6 underline"
            >
              Start over
            </button>
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24">
          <PractitionerSummaryCard practitioner={practitioner} />
        </div>
      </div>
    </div>
  );
}
