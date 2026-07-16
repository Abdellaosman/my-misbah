import { DateTime } from "luxon";
import { Calendar, Clock, Mail, Phone, Video } from "lucide-react";

export interface DashboardAppointment {
  id: string;
  publicId: string;
  startAt: Date;
  endAt: Date;
  practitionerTimezone: string;
  priceAmount: string;
  currency: string;
  paymentStatus: string;
  client: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  service: {
    name: string;
    durationMinutes: number;
  };
  zoomMeeting: {
    startUrl: string;
    joinUrl: string;
  } | null;
  intakeSubmission: {
    reasonForBooking: string;
    situationDescription: string;
  } | null;
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "amber" }) {
  const toneClasses =
    tone === "green" ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200";
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${toneClasses}`}>{label}</span>
  );
}

export default function AppointmentCard({
  appointment,
  isPast = false,
}: {
  appointment: DashboardAppointment;
  isPast?: boolean;
}) {
  const tz = appointment.practitionerTimezone || "UTC";
  const start = DateTime.fromJSDate(appointment.startAt, { zone: "utc" }).setZone(tz);
  const end = DateTime.fromJSDate(appointment.endAt, { zone: "utc" }).setZone(tz);
  const clientName = `${appointment.client.firstName} ${appointment.client.lastName}`;

  return (
    <div className="bg-white rounded-2xl border border-[#EAE3D4] shadow-sm p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-serif text-[#1A2B50] font-semibold text-base">{clientName}</p>
          <p className="text-sm text-[#6b6878]">{appointment.service.name}</p>
        </div>
        <StatusPill
          label={appointment.paymentStatus === "SUCCEEDED" ? "Paid" : appointment.paymentStatus}
          tone={appointment.paymentStatus === "SUCCEEDED" ? "green" : "amber"}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-sm text-[#4a4a5a]">
        <span className="flex items-center gap-1.5">
          <Calendar size={13} className="text-[#9895a2]" />
          {start.toFormat("cccc, LLLL d, yyyy")}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={13} className="text-[#9895a2]" />
          {start.toFormat("h:mm a")} – {end.toFormat("h:mm a")} ({tz.replace(/_/g, " ")})
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2 text-xs text-[#6b6878]">
        <a href={`mailto:${appointment.client.email}`} className="flex items-center gap-1.5 hover:text-[#C8680A]">
          <Mail size={12} />
          {appointment.client.email}
        </a>
        {appointment.client.phone && (
          <span className="flex items-center gap-1.5">
            <Phone size={12} />
            {appointment.client.phone}
          </span>
        )}
        <span>
          {appointment.service.durationMinutes} min · ${appointment.priceAmount} {appointment.currency.toUpperCase()}
        </span>
      </div>

      {appointment.intakeSubmission && (
        <details className="mt-3 group">
          <summary className="text-xs font-medium text-[#1A2B50] cursor-pointer select-none list-none flex items-center gap-1">
            <span className="inline-block transition-transform group-open:rotate-90">▸</span>
            View client intake
          </summary>
          <div className="mt-2 bg-[#F3EDE0] rounded-xl p-3.5 space-y-2 text-xs text-[#4a4a5a] leading-relaxed">
            <div>
              <p className="font-semibold text-[#1A2B50] mb-0.5">Reason for booking</p>
              <p>{appointment.intakeSubmission.reasonForBooking}</p>
            </div>
            <div>
              <p className="font-semibold text-[#1A2B50] mb-0.5">Situation</p>
              <p>{appointment.intakeSubmission.situationDescription}</p>
            </div>
          </div>
        </details>
      )}

      {!isPast && appointment.zoomMeeting && (
        <a
          href={appointment.zoomMeeting.startUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow-md hover:brightness-110 transition-all"
          style={{ background: "linear-gradient(135deg, #C8680A 0%, #E07D10 100%)" }}
        >
          <Video size={14} />
          Start Zoom Meeting
        </a>
      )}
      {!isPast && !appointment.zoomMeeting && (
        <p className="text-xs text-[#9895a2] mt-4">Zoom link is being generated — check back shortly.</p>
      )}

      <p className="text-[11px] text-[#9895a2] mt-3 font-mono">Ref: {appointment.publicId}</p>
    </div>
  );
}
