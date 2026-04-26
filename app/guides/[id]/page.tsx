import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  CheckCircle,
  GraduationCap,
  BookOpen,
  Clock,
  Shield,
  ArrowLeft,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { guides, getGuideById, getInitials } from "@/lib/data";

const BOOKING_URL =
  "https://book.carepatron.com/My-Misbah/All?p=sI0lxnz0T5KtoqqOG.Vgbg";

export async function generateStaticParams() {
  return guides.map((g) => ({ id: g.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guide = getGuideById(id);
  if (!guide) return {};
  return {
    title: `${guide.name} — My Misbah`,
    description: guide.shortBio,
  };
}

export default async function GuideProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guide = getGuideById(id);
  if (!guide) notFound();

  const initials = getInitials(guide.name);

  return (
    <div className="bg-[#FAF8F3] min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-[#1A2B50] px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={15} />
            Back to All Guides
          </Link>
        </div>
      </div>

      {/* Hero banner */}
      <div
        className="bg-[#1A2B50] px-6 pb-10 relative overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 130%, rgba(200,104,10,0.18) 0%, transparent 60%)",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-8">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #1A2B50 0%, #2d4575 100%)",
                border: "2px solid rgba(200,104,10,0.4)",
              }}
            >
              <span className="text-white font-serif text-3xl font-bold">
                {initials}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-serif text-3xl md:text-4xl text-white font-bold">
                  {guide.name}
                </h1>
                {guide.verified && (
                  <span className="flex items-center gap-1 bg-[#C8680A]/20 border border-[#C8680A]/40 text-[#F0A500] text-xs px-2.5 py-1 rounded-full font-medium">
                    <CheckCircle size={12} />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-blue-200 text-lg mb-3">{guide.title}</p>

              <div className="flex flex-wrap gap-3">
                <span className="flex items-center gap-1.5 text-blue-300 text-sm">
                  <MapPin size={14} className="text-[#F0A500]" />
                  {guide.location}
                </span>
                {guide.yearsExperience && (
                  <span className="flex items-center gap-1.5 text-blue-300 text-sm">
                    <Clock size={14} className="text-[#F0A500]" />
                    {guide.yearsExperience}+ years experience
                  </span>
                )}
                {guide.languages.map((lang) => (
                  <span
                    key={lang}
                    className="text-xs bg-[#2d4575] text-blue-200 px-2.5 py-1 rounded-full"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section className="bg-white rounded-2xl border border-[#EAE3D4] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-[#FBF0D8] rounded-lg flex items-center justify-center">
                  <BookOpen size={18} className="text-[#C8680A]" />
                </div>
                <h2 className="font-serif text-xl text-[#1A2B50] font-semibold">
                  About
                </h2>
              </div>
              <div className="space-y-4">
                {guide.fullBio.split("\n\n").map((para, i) => (
                  <p
                    key={i}
                    className="text-[#4a4a5a] leading-relaxed text-base"
                  >
                    {para}
                  </p>
                ))}
              </div>
            </section>

            {/* Background & Education */}
            <section className="bg-white rounded-2xl border border-[#EAE3D4] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-[#FBF0D8] rounded-lg flex items-center justify-center">
                  <GraduationCap size={18} className="text-[#C8680A]" />
                </div>
                <h2 className="font-serif text-xl text-[#1A2B50] font-semibold">
                  Background &amp; Education
                </h2>
              </div>

              <div className="space-y-6">
                {guide.education.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-[#9895a2] mb-3">
                      Education
                    </h3>
                    <ul className="space-y-2">
                      {guide.education.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C8680A] mt-2 flex-shrink-0" />
                          <span className="text-[#4a4a5a] text-sm leading-relaxed">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {guide.certifications.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-[#9895a2] mb-3">
                      Certifications
                    </h3>
                    <ul className="space-y-2">
                      {guide.certifications.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <CheckCircle
                            size={14}
                            className="text-[#C8680A] mt-0.5 flex-shrink-0"
                          />
                          <span className="text-[#4a4a5a] text-sm leading-relaxed">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {guide.roles.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-[#9895a2] mb-3">
                      Roles &amp; Community Service
                    </h3>
                    <ul className="space-y-2">
                      {guide.roles.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1A2B50] mt-2 flex-shrink-0" />
                          <span className="text-[#4a4a5a] text-sm leading-relaxed">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>

            {/* Areas of Expertise */}
            <section className="bg-white rounded-2xl border border-[#EAE3D4] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-[#FBF0D8] rounded-lg flex items-center justify-center">
                  <BookOpen size={18} className="text-[#C8680A]" />
                </div>
                <h2 className="font-serif text-xl text-[#1A2B50] font-semibold">
                  Areas of Expertise
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {guide.expertise.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm bg-[#EEF1F8] text-[#2d4575] px-3.5 py-1.5 rounded-full font-medium border border-[#D4DCEF]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT: Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Booking card */}
              <div className="bg-white rounded-2xl border border-[#EAE3D4] shadow-sm overflow-hidden">
                {/* Card header */}
                <div
                  className="p-5"
                  style={{
                    background:
                      "linear-gradient(135deg, #1A2B50 0%, #2a3d68 100%)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={16} className="text-[#F0A500]" />
                    <h3 className="font-serif text-white font-semibold text-lg">
                      Book a Session
                    </h3>
                  </div>
                  <p className="text-blue-200 text-xs">
                    Private, one-on-one guidance with {guide.name.split(" ")[0]}.
                  </p>
                </div>

                <div className="p-5">
                  {/* Session options */}
                  <div className="space-y-3 mb-5">
                    <div className="rounded-xl border border-[#C8680A]/30 bg-[#FDFAF4] p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-[#1A2B50] text-sm">
                          50 Minute Session
                        </span>
                        <span className="text-[#C8680A] font-bold text-sm">
                          $80
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-[#9895a2]" />
                        <span className="text-xs text-[#9895a2]">
                          Full guidance session
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#EAE3D4] bg-[#FAF8F3] p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-[#1A2B50] text-sm">
                          25 Minute Session
                        </span>
                        <span className="text-[#C8680A] font-bold text-sm">
                          $35
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-[#9895a2]" />
                        <span className="text-xs text-[#9895a2]">
                          Focused Q&amp;A or follow-up
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Book Now CTA */}
                  <a
                    href={BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-white font-bold py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:brightness-110"
                    style={{
                      background:
                        "linear-gradient(135deg, #C8680A 0%, #E07D10 100%)",
                    }}
                  >
                    <Calendar size={16} />
                    Book Now
                    <ExternalLink size={13} className="opacity-70" />
                  </a>

                  <p className="text-center text-xs text-[#9895a2] mt-3">
                    Secure booking via Carepatron
                  </p>
                </div>
              </div>

              {/* Confidentiality */}
              <div className="bg-[#F3EDE0] rounded-2xl border border-[#EAE3D4] p-5 flex items-start gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Shield size={16} className="text-[#1A2B50]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1A2B50] text-sm mb-1">
                    Fully Confidential
                  </p>
                  <p className="text-[#6b6878] text-xs leading-relaxed">
                    All sessions are private and confidential. Your personal
                    matters stay between you and your guide.
                  </p>
                </div>
              </div>

              {/* Cancellation note */}
              <div className="bg-white rounded-2xl border border-[#EAE3D4] p-5">
                <p className="text-xs text-[#6b6878] leading-relaxed">
                  <span className="font-semibold text-[#1A2B50]">
                    Cancellation policy:
                  </span>{" "}
                  Appointments may be cancelled or rescheduled up to 48 hours in
                  advance without penalty. Changes within 48 hours may be charged
                  in full.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
