import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarCheck, CalendarClock } from "lucide-react";
import { requirePractitioner } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import LogoutButton from "@/components/practitioner/LogoutButton";
import AppointmentCard, { type DashboardAppointment } from "@/components/practitioner/AppointmentCard";
import type { Appointment, Client, Service, ZoomMeeting, IntakeSubmission } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Practitioner Dashboard — My Misbah",
};

type ConfirmedAppointment = Appointment & {
  client: Client;
  service: Service;
  zoomMeeting: ZoomMeeting | null;
  intakeSubmission: IntakeSubmission | null;
};

function toDashboardAppointment(appointment: ConfirmedAppointment): DashboardAppointment {
  return {
    id: appointment.id,
    publicId: appointment.publicId,
    startAt: appointment.startAt,
    endAt: appointment.endAt,
    practitionerTimezone: appointment.practitionerTimezone,
    priceAmount: appointment.priceAmount.toString(),
    currency: appointment.currency,
    paymentStatus: appointment.paymentStatus,
    client: {
      firstName: appointment.client.firstName,
      lastName: appointment.client.lastName,
      email: appointment.client.email,
      phone: appointment.client.phone,
    },
    service: {
      name: appointment.service.name,
      durationMinutes: appointment.service.durationMinutes,
    },
    zoomMeeting: appointment.zoomMeeting
      ? { startUrl: appointment.zoomMeeting.startUrl, joinUrl: appointment.zoomMeeting.joinUrl }
      : null,
    intakeSubmission: appointment.intakeSubmission
      ? {
          reasonForBooking: appointment.intakeSubmission.reasonForBooking,
          situationDescription: appointment.intakeSubmission.situationDescription,
        }
      : null,
  };
}

export default async function PractitionerDashboardPage() {
  let user;
  try {
    user = await requirePractitioner();
  } catch {
    redirect("/practitioner/login?next=/practitioner/dashboard");
  }

  const profile = await prisma.practitionerProfile.findUnique({ where: { userId: user.id } });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAF8F3]">
      <div className="bg-[#1A2B50] px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-serif text-white text-xl font-bold">
              Welcome{profile ? `, ${profile.displayName}` : ""}
            </h1>
            <p className="text-blue-200 text-sm mt-0.5">Your confirmed appointments</p>
          </div>
          <LogoutButton />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {!profile ? (
          <div className="bg-white rounded-2xl border border-[#EAE3D4] p-8 text-center max-w-md mx-auto">
            <h2 className="font-serif text-lg text-[#1A2B50] font-semibold mb-2">Profile not set up</h2>
            <p className="text-sm text-[#6b6878]">
              Your practitioner profile hasn&apos;t been configured yet. Please contact an administrator.
            </p>
          </div>
        ) : (
          <PractitionerAppointments practitionerId={profile.id} />
        )}
      </div>
    </div>
  );
}

function splitByTime<T extends { startAt: Date; endAt: Date }>(appointments: T[], asOf: Date) {
  const asOfMs = asOf.getTime();
  const upcoming = appointments.filter((a) => a.endAt.getTime() >= asOfMs);
  const past = appointments
    .filter((a) => a.endAt.getTime() < asOfMs)
    .sort((a, b) => b.startAt.getTime() - a.startAt.getTime());
  return { upcoming, past };
}

async function PractitionerAppointments({ practitionerId }: { practitionerId: string }) {
  const appointments = await prisma.appointment.findMany({
    where: { practitionerId, status: "CONFIRMED" },
    orderBy: { startAt: "asc" },
    include: { client: true, service: true, zoomMeeting: true, intakeSubmission: true },
  });

  const { upcoming, past } = splitByTime(appointments, new Date());

  return (
    <div className="space-y-10">
      <section>
        <h2 className="flex items-center gap-2 font-serif text-lg text-[#1A2B50] font-semibold mb-4">
          <CalendarClock size={18} className="text-[#C8680A]" />
          Upcoming ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EAE3D4] p-8 text-center">
            <p className="text-sm text-[#6b6878]">You have no upcoming confirmed appointments.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={toDashboardAppointment(appointment)} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="flex items-center gap-2 font-serif text-lg text-[#1A2B50] font-semibold mb-4">
          <CalendarCheck size={18} className="text-[#9895a2]" />
          Past ({past.length})
        </h2>
        {past.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#EAE3D4] p-8 text-center">
            <p className="text-sm text-[#6b6878]">No past confirmed appointments yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {past.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={toDashboardAppointment(appointment)} isPast />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
