"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DateTime } from "luxon";
import { CheckCircle2, Loader2, Video, AlertCircle, Calendar, Clock } from "lucide-react";
import { apiFetch, ApiClientError } from "@/lib/booking/api-client";

interface AppointmentSummary {
  publicId: string;
  status: string;
  paymentStatus: string;
  startAt: string;
  endAt: string;
  clientTimezone: string;
  price: string;
  currency: string;
  practitionerName: string;
  practitionerSlug: string;
  serviceName: string;
  durationMinutes: number;
  zoomJoinUrl: string | null;
}

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_MS = 2 * 60 * 1000;

export default function ConfirmationStatus({ publicId }: { publicId: string }) {
  const [appointment, setAppointment] = useState<AppointmentSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const startedAt = Date.now();

    async function poll() {
      try {
        const data = await apiFetch<{ appointment: AppointmentSummary }>(
          `/api/public/appointments/${publicId}`,
        );
        if (cancelled) return;
        setAppointment(data.appointment);
        setError(null);

        const isFinal = data.appointment.status !== "PENDING_PAYMENT";
        if (!isFinal && Date.now() - startedAt < MAX_POLL_MS) {
          setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof ApiClientError ? err.message : "Could not load your booking status.");
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [publicId]);

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-[#EAE3D4] p-8 text-center">
        <AlertCircle className="mx-auto text-red-500 mb-3" size={32} />
        <p className="text-[#1A2B50] font-semibold mb-1">We couldn&apos;t find this booking</p>
        <p className="text-sm text-[#6b6878] mb-4">{error}</p>
        <Link href="/book" className="text-sm text-[#C8680A] font-medium hover:underline">
          Return to booking
        </Link>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="bg-white rounded-2xl border border-[#EAE3D4] p-10 text-center">
        <Loader2 className="mx-auto text-[#1A2B50] animate-spin mb-3" size={28} />
        <p className="text-sm text-[#6b6878]">Loading your booking...</p>
      </div>
    );
  }

  const start = DateTime.fromISO(appointment.startAt, { zone: "utc" }).setZone(appointment.clientTimezone);
  const end = DateTime.fromISO(appointment.endAt, { zone: "utc" }).setZone(appointment.clientTimezone);
  const isConfirmed = appointment.status === "CONFIRMED";
  const isPending = appointment.status === "PENDING_PAYMENT";
  const isFailedOrCancelled = ["PAYMENT_FAILED", "EXPIRED", "CANCELLED_BY_CLIENT", "CANCELLED_BY_ADMIN", "CANCELLED_BY_PRACTITIONER"].includes(
    appointment.status,
  );

  return (
    <div className="bg-white rounded-2xl border border-[#EAE3D4] shadow-sm overflow-hidden">
      <div
        className="p-8 text-center"
        style={{
          background: isConfirmed
            ? "linear-gradient(135deg, #1A2B50 0%, #2a3d68 100%)"
            : "linear-gradient(135deg, #6b6878 0%, #4a4a5a 100%)",
        }}
      >
        {isConfirmed ? (
          <CheckCircle2 className="mx-auto text-[#F0A500] mb-3" size={40} />
        ) : isPending ? (
          <Loader2 className="mx-auto text-white animate-spin mb-3" size={36} />
        ) : (
          <AlertCircle className="mx-auto text-white mb-3" size={36} />
        )}
        <h1 className="font-serif text-white text-2xl font-bold mb-1">
          {isConfirmed
            ? "Booking Confirmed"
            : isPending
              ? "Confirming your payment…"
              : "Booking Not Completed"}
        </h1>
        <p className="text-blue-200 text-sm">
          Reference <span className="font-mono">{appointment.publicId}</span>
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#6b6878]">Guide</span>
          <span className="text-sm font-semibold text-[#1A2B50]">{appointment.practitionerName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#6b6878]">Session</span>
          <span className="text-sm font-semibold text-[#1A2B50]">{appointment.serviceName}</span>
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
            {start.toFormat("h:mm a")} – {end.toFormat("h:mm a")} ({appointment.clientTimezone.replace(/_/g, " ")})
          </span>
        </div>

        {isConfirmed && appointment.zoomJoinUrl && (
          <a
            href={appointment.zoomJoinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-white font-bold py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:brightness-110 mt-2"
            style={{ background: "linear-gradient(135deg, #C8680A 0%, #E07D10 100%)" }}
          >
            <Video size={16} />
            Join Zoom Meeting
          </a>
        )}

        {isConfirmed && !appointment.zoomJoinUrl && (
          <p className="text-xs text-[#9895a2] text-center pt-2">
            Your video call link will be emailed to you shortly.
          </p>
        )}

        {isPending && (
          <p className="text-xs text-[#9895a2] text-center pt-2">
            This usually takes a few seconds. This page will update automatically.
          </p>
        )}

        {isFailedOrCancelled && (
          <div className="pt-2 text-center">
            <p className="text-sm text-[#6b6878] mb-3">
              Your payment could not be completed for this booking.
            </p>
            <Link
              href={`/book/${appointment.practitionerSlug}`}
              className="text-sm text-[#C8680A] font-medium hover:underline"
            >
              Try booking again
            </Link>
          </div>
        )}

        <p className="text-center text-xs text-[#9895a2] pt-3 border-t border-[#EAE3D4]">
          A confirmation email with all details has been sent to your inbox.
        </p>
      </div>
    </div>
  );
}
