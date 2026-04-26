import Link from "next/link";
import { MapPin, CheckCircle } from "lucide-react";
import { Guide, getInitials } from "@/lib/data";

interface GuideCardProps {
  guide: Guide;
}

export default function GuideCard({ guide }: GuideCardProps) {
  const initials = getInitials(guide.name);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#EAE3D4] overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200 group">
      {/* Header band — flame gradient */}
      <div
        className="h-1.5"
        style={{
          background: "linear-gradient(90deg, #1A2B50 0%, #C8680A 60%, #F0A500 100%)",
        }}
      />

      <div className="p-6 flex flex-col flex-1">
        {/* Avatar + name row */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl bg-[#1A2B50] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-serif text-xl font-bold">
              {initials}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-serif font-semibold text-[#1B2B4B] text-lg leading-tight">
                {guide.name}
              </h3>
              {guide.verified && (
                <CheckCircle
                  size={15}
                  className="text-[#C8680A] flex-shrink-0"
                  aria-label="Verified"
                />
              )}
            </div>
            <p className="text-[#6b6878] text-sm mt-0.5">{guide.title}</p>
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={12} className="text-[#9895a2]" />
              <span className="text-xs text-[#9895a2]">{guide.location}</span>
            </div>
          </div>
        </div>

        {/* Short bio */}
        <p className="text-sm text-[#4a4a5a] leading-relaxed mb-4 flex-1">
          {guide.shortBio}
        </p>

        {/* Languages */}
        {guide.languages.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {guide.languages.map((lang) => (
              <span
                key={lang}
                className="text-xs bg-[#F2EDE3] text-[#6b6878] px-2 py-0.5 rounded-full border border-[#ddd6c8]"
              >
                {lang}
              </span>
            ))}
          </div>
        )}

        {/* Expertise tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {guide.expertise.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-[#EEF1F8] text-[#2d4270] px-2.5 py-1 rounded-full font-medium"
            >
              {tag}
            </span>
          ))}
          {guide.expertise.length > 4 && (
            <span className="text-xs bg-[#EEF1F8] text-[#2d4270] px-2.5 py-1 rounded-full font-medium">
              +{guide.expertise.length - 4} more
            </span>
          )}
        </div>

        {/* CTA */}
        <Link
          href={`/guides/${guide.id}`}
          className="block text-center bg-[#1A2B50] hover:bg-[#2d4575] text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
