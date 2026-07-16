import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, MapPin } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { formatMoney } from "@/lib/money";
import { getInitials } from "@/lib/data";

export const metadata = {
  title: "Book a Session — My Misbah",
  description: "Choose a trusted guide and book a confidential, one-on-one consultation.",
};

export const dynamic = "force-dynamic";

export default async function BookLandingPage() {
  const practitioners = await prisma.practitionerProfile.findMany({
    where: { approvalStatus: "APPROVED", deletedAt: null },
    orderBy: { displayName: "asc" },
    select: {
      slug: true,
      displayName: true,
      title: true,
      shortBio: true,
      photoUrl: true,
      languages: true,
      services: {
        where: { isActive: true, approvalStatus: "APPROVED", deletedAt: null },
        select: { price: true, durationMinutes: true },
        orderBy: { durationMinutes: "asc" },
        take: 1,
      },
    },
  });

  return (
    <div className="bg-[#FAF8F3] min-h-screen">
      <section className="bg-[#1A2B50] px-6 py-16 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 50% 130%, rgba(200,104,10,0.18) 0%, transparent 60%)",
          }}
        />
        <div className="max-w-6xl mx-auto relative">
          <p className="text-[#F0A500] text-sm font-medium uppercase tracking-widest mb-3">
            <Calendar size={13} className="inline mr-1.5 -mt-0.5" />
            Book a Session
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-white font-bold mb-4">
            Choose Your Guide
          </h1>
          <p className="text-blue-200 text-lg max-w-xl leading-relaxed">
            Select a verified guide to begin booking a confidential, one-on-one consultation.
          </p>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {practitioners.length === 0 ? (
            <p className="text-center text-[#6b6878] py-16">
              No guides are currently available for booking. Please check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {practitioners.map((p) => {
                const initials = getInitials(p.displayName);
                const startingPrice = p.services[0] ? formatMoney(p.services[0].price) : null;
                return (
                  <Link
                    key={p.slug}
                    href={`/book/${p.slug}`}
                    className="bg-white rounded-2xl shadow-sm border border-[#EAE3D4] overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200 group"
                  >
                    <div
                      className="h-1.5"
                      style={{ background: "linear-gradient(90deg, #1A2B50 0%, #C8680A 60%, #F0A500 100%)" }}
                    />
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#1A2B50]">
                          {p.photoUrl ? (
                            <Image
                              src={p.photoUrl}
                              alt={p.displayName}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover object-top"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-white font-serif text-xl font-bold">{initials}</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-serif font-semibold text-[#1A2B50] text-lg leading-tight">
                            {p.displayName}
                          </h3>
                          {p.title && <p className="text-[#6b6878] text-sm mt-0.5">{p.title}</p>}
                        </div>
                      </div>

                      {p.shortBio && (
                        <p className="text-sm text-[#4a4a5a] leading-relaxed mb-4 flex-1 line-clamp-3">
                          {p.shortBio}
                        </p>
                      )}

                      {p.languages.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {p.languages.map((lang) => (
                            <span
                              key={lang}
                              className="text-xs bg-[#F2EDE3] text-[#6b6878] px-2 py-0.5 rounded-full border border-[#ddd6c8]"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#EAE3D4]">
                        {startingPrice ? (
                          <span className="flex items-center gap-1.5 text-xs text-[#9895a2]">
                            <Clock size={12} />
                            From ${startingPrice}
                          </span>
                        ) : (
                          <span />
                        )}
                        <span className="text-sm font-semibold text-[#C8680A] group-hover:underline">
                          Book Now &rarr;
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="text-center mt-10">
            <p className="text-sm text-[#9895a2] flex items-center justify-center gap-1.5">
              <MapPin size={13} />
              Not sure who to choose? <Link href="/guides" className="text-[#1A2B50] font-medium hover:underline">Browse full guide profiles</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
