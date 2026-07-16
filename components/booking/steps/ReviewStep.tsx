"use client";

import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { AlertCircle, Calendar, Clock, Loader2, Lock, Timer } from "lucide-react";
import type { WizardPractitioner, WizardService } from "@/lib/booking/public-types";

interface ReviewStepProps {
  practitioner: WizardPractitioner;
  service: WizardService;
  startAtIso: string;
  timezone: string;
  expiresAtIso: string;
  onPay: () => void;
  isProcessing: boolean;
  payError: string | null;
  onExpire: () => void;
}

export default function ReviewStep({
  practitioner,
  service,
  startAtIso,
  timezone,
  expiresAtIso,
  onPay,
  isProcessing,
  payError,
  onExpire,
}: ReviewStepProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    Math.max(0, Math.floor((new Date(expiresAtIso).getTime() - Date.now()) / 1000)),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const secs = Math.max(0, Math.floor((new Date(expiresAtIso).getTime() - Date.now()) / 1000));
      setRemainingSeconds(secs);
      if (secs <= 0) {
        clearInterval(interval);
        onExpire();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAtIso, onExpire]);

  const start = DateTime.fromISO(startAtIso, { zone: "utc" }).setZone(timezone);
  const end = start.plus({ minutes: service.durationMinutes });
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const isExpiringSoon = remainingSeconds <= 120;

  return (
    <div>
      <h2 className="font-serif text-xl text-[#1A2B50] font-semibold mb-1">Review &amp; pay</h2>
      <p className="text-sm text-[#6b6878] mb-5">
        Please confirm the details below before proceeding to secure payment.
      </p>

      <div
        className={`flex items-center gap-2.5 rounded-xl px-4 py-3 mb-5 text-sm font-medium ${
          isExpiringSoon ? "bg-red-50 text-red-700" : "bg-[#F3EDE0] text-[#1A2B50]"
        }`}
      >
        <Timer size={16} className="flex-shrink-0" />
        Your slot is held for {minutes}:{seconds.toString().padStart(2, "0")} minutes
      </div>

      <div className="bg-white rounded-xl border border-[#EAE3D4] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#6b6878]">Guide</span>
          <span className="text-sm font-semibold text-[#1A2B50]">{practitioner.displayName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#6b6878]">Session</span>
          <span className="text-sm font-semibold text-[#1A2B50]">{service.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#6b6878] flex items-center gap-1.5">
            <Calendar size={13} /> Date
          </span>
          <span className="text-sm font-semibold text-[#1A2B50]">{start.toFormat("cccc, LLLL d, yyyy")}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#6b6878] flex items-center gap-1.5">
            <Clock size={13} /> Time
          </span>
          <span className="text-sm font-semibold text-[#1A2B50]">
            {start.toFormat("h:mm a")} – {end.toFormat("h:mm a")} ({timezone.replace(/_/g, " ")})
          </span>
        </div>
        <div className="h-px bg-[#EAE3D4]" />
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[#1A2B50]">Total</span>
          <span className="text-lg font-bold text-[#C8680A]">
            ${service.price} {service.currency.toUpperCase()}
          </span>
        </div>
      </div>

      {service.cancellationPolicy && (
        <p className="text-xs text-[#9895a2] leading-relaxed mt-4">
          <span className="font-semibold text-[#1A2B50]">Cancellation policy:</span> {service.cancellationPolicy}
        </p>
      )}

      {payError && (
        <div className="flex items-center gap-2 text-red-600 text-sm mt-4">
          <AlertCircle size={15} />
          {payError}
        </div>
      )}

      <button
        type="button"
        data-testid="pay-button"
        onClick={onPay}
        disabled={isProcessing || remainingSeconds <= 0}
        className="w-full mt-6 text-white font-bold py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:brightness-110 disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, #C8680A 0%, #E07D10 100%)" }}
      >
        {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Lock size={15} />}
        Proceed to Secure Payment
      </button>
      <p className="text-center text-xs text-[#9895a2] mt-3">Payments are securely processed by Stripe.</p>
    </div>
  );
}
