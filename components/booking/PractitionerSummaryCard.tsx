import Image from "next/image";
import { Shield, Globe2 } from "lucide-react";
import type { WizardPractitioner } from "@/lib/booking/public-types";
import { getInitials } from "@/lib/data";

export default function PractitionerSummaryCard({ practitioner }: { practitioner: WizardPractitioner }) {
  const initials = getInitials(practitioner.displayName);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-[#EAE3D4] shadow-sm overflow-hidden">
        <div
          className="p-5"
          style={{ background: "linear-gradient(135deg, #1A2B50 0%, #2a3d68 100%)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/20">
              {practitioner.photoUrl ? (
                <Image
                  src={practitioner.photoUrl}
                  alt={practitioner.displayName}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#2d4575]">
                  <span className="text-white font-serif text-lg font-bold">{initials}</span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-serif text-white font-semibold text-base leading-tight truncate">
                {practitioner.displayName}
              </p>
              {practitioner.title && <p className="text-blue-200 text-xs mt-0.5 truncate">{practitioner.title}</p>}
            </div>
          </div>
        </div>
        {practitioner.shortBio && (
          <div className="p-5">
            <p className="text-[#4a4a5a] text-xs leading-relaxed">{practitioner.shortBio}</p>
            {practitioner.languages.length > 0 && (
              <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                <Globe2 size={12} className="text-[#9895a2]" />
                {practitioner.languages.map((lang) => (
                  <span key={lang} className="text-[11px] bg-[#F2EDE3] text-[#6b6878] px-2 py-0.5 rounded-full">
                    {lang}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-[#F3EDE0] rounded-2xl border border-[#EAE3D4] p-5 flex items-start gap-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
          <Shield size={16} className="text-[#1A2B50]" />
        </div>
        <div>
          <p className="font-semibold text-[#1A2B50] text-sm mb-1">Fully Confidential</p>
          <p className="text-[#6b6878] text-xs leading-relaxed">
            All sessions are private and confidential, held over a secure video call.
          </p>
        </div>
      </div>
    </div>
  );
}
