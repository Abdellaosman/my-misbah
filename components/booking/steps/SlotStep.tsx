"use client";

import { useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
import { Loader2, Globe2, AlertCircle } from "lucide-react";
import { apiFetch, ApiClientError } from "@/lib/booking/api-client";
import { detectBrowserTimezone, listTimezones } from "@/lib/booking/timezones";
import type { WizardService } from "@/lib/booking/public-types";

interface SlotStepProps {
  practitionerSlug: string;
  service: WizardService;
  onSelectSlot: (startAtIso: string, timezone: string) => void;
  isReserving: boolean;
  reserveError: string | null;
}

const DAYS_TO_SHOW = 21;

interface DayOption {
  iso: string; // YYYY-MM-DD in the selected timezone
  weekday: string;
  dayNumber: string;
  month: string;
}

export default function SlotStep({ practitionerSlug, service, onSelectSlot, isReserving, reserveError }: SlotStepProps) {
  const [timezone, setTimezone] = useState<string>(() => detectBrowserTimezone());
  const timezoneOptions = useMemo(() => listTimezones(), []);

  const days = useMemo<DayOption[]>(() => {
    const maxAdvance = Math.min(service.maxAdvanceDays, DAYS_TO_SHOW);
    const now = DateTime.now().setZone(timezone);
    return Array.from({ length: Math.max(maxAdvance, 1) }, (_, i) => {
      const d = now.plus({ days: i });
      return {
        iso: d.toISODate()!,
        weekday: d.toFormat("ccc"),
        dayNumber: d.toFormat("d"),
        month: d.toFormat("LLL"),
      };
    });
  }, [timezone, service.maxAdvanceDays]);

  const [selectedDateOverride, setSelectedDateOverride] = useState<string | null>(null);
  const selectedDate =
    selectedDateOverride && days.some((d) => d.iso === selectedDateOverride)
      ? selectedDateOverride
      : days[0]?.iso ?? "";

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Keyed by "date|timezone|serviceId" so a stale in-flight fetch's result is
  // never applied after the user has already moved on to a different day —
  // `loadingSlots` is derived from this key match instead of a separate
  // synchronous `setState` at the top of the effect.
  const requestKey = `${selectedDate}|${timezone}|${service.id}`;
  const [slotsResult, setSlotsResult] = useState<{
    key: string;
    slots: { startAt: string; endAt: string }[];
    error: string | null;
  }>({ key: "", slots: [], error: null });

  const loadingSlots = slotsResult.key !== requestKey;
  const slots = loadingSlots ? [] : slotsResult.slots;
  const slotsError = loadingSlots ? null : slotsResult.error;

  useEffect(() => {
    if (!selectedDate) return;
    let cancelled = false;

    const from = DateTime.fromISO(selectedDate, { zone: timezone }).startOf("day").toUTC().toISO();
    const to = DateTime.fromISO(selectedDate, { zone: timezone }).plus({ days: 1 }).startOf("day").toUTC().toISO();

    const params = new URLSearchParams({ serviceId: service.id, from: from!, to: to! });
    const key = requestKey;

    apiFetch<{ slots: { startAt: string; endAt: string }[] }>(
      `/api/public/practitioners/${practitionerSlug}/availability?${params.toString()}`,
    )
      .then((data) => {
        if (!cancelled) setSlotsResult({ key, slots: data.slots, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setSlotsResult({
            key,
            slots: [],
            error: err instanceof ApiClientError ? err.message : "Could not load availability.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDate, timezone, service.id, practitionerSlug, requestKey]);

  return (
    <div>
      <h2 className="font-serif text-xl text-[#1A2B50] font-semibold mb-1">
        Pick a date &amp; time
      </h2>
      <p className="text-sm text-[#6b6878] mb-4">
        Times are shown in your selected timezone.
      </p>

      {/* Timezone selector */}
      <div className="flex items-center gap-2 mb-5 bg-[#F3EDE0] rounded-xl px-3.5 py-2.5">
        <Globe2 size={15} className="text-[#1A2B50] flex-shrink-0" />
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="flex-1 bg-transparent text-sm text-[#1A2B50] font-medium focus:outline-none min-w-0"
          aria-label="Timezone"
        >
          {!timezoneOptions.includes(timezone) && <option value={timezone}>{timezone}</option>}
          {timezoneOptions.map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Day picker */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-1 px-1">
        {days.map((day) => {
          const isSelected = day.iso === selectedDate;
          return (
            <button
              key={day.iso}
              type="button"
              data-testid={`day-option-${day.iso}`}
              onClick={() => {
                setSelectedDateOverride(day.iso);
                setSelectedSlot(null);
              }}
              className={`flex flex-col items-center flex-shrink-0 w-16 py-2.5 rounded-xl border transition-colors ${
                isSelected
                  ? "bg-[#1A2B50] border-[#1A2B50] text-white"
                  : "bg-white border-[#EAE3D4] text-[#1A2B50] hover:border-[#1A2B50]"
              }`}
            >
              <span className={`text-[10px] uppercase font-medium ${isSelected ? "text-blue-200" : "text-[#9895a2]"}`}>
                {day.weekday}
              </span>
              <span className="text-lg font-semibold leading-tight">{day.dayNumber}</span>
              <span className={`text-[10px] ${isSelected ? "text-blue-200" : "text-[#9895a2]"}`}>{day.month}</span>
            </button>
          );
        })}
      </div>

      {/* Slots */}
      {loadingSlots ? (
        <div className="flex items-center justify-center gap-2 text-[#6b6878] text-sm py-10">
          <Loader2 size={16} className="animate-spin" />
          Loading available times…
        </div>
      ) : slotsError ? (
        <div className="flex items-center gap-2 text-red-600 text-sm py-6">
          <AlertCircle size={15} />
          {slotsError}
        </div>
      ) : slots.length === 0 ? (
        <p className="text-sm text-[#9895a2] py-6 text-center">
          No available times on this day. Please try another date.
        </p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {slots.map((slot) => {
            const label = DateTime.fromISO(slot.startAt, { zone: "utc" }).setZone(timezone).toFormat("h:mm a");
            const isSelected = selectedSlot === slot.startAt;
            return (
              <button
                key={slot.startAt}
                type="button"
                data-testid={`slot-option-${slot.startAt}`}
                disabled={isReserving}
                onClick={() => {
                  setSelectedSlot(slot.startAt);
                  onSelectSlot(slot.startAt, timezone);
                }}
                className={`py-2.5 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 ${
                  isSelected
                    ? "bg-[#C8680A] border-[#C8680A] text-white"
                    : "bg-white border-[#EAE3D4] text-[#1A2B50] hover:border-[#C8680A]"
                }`}
              >
                {isSelected && isReserving ? <Loader2 size={14} className="animate-spin mx-auto" /> : label}
              </button>
            );
          })}
        </div>
      )}

      {reserveError && (
        <div className="flex items-center gap-2 text-red-600 text-sm mt-4">
          <AlertCircle size={15} />
          {reserveError}
        </div>
      )}
    </div>
  );
}
