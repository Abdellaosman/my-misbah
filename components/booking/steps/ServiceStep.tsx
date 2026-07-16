import { Clock, ShieldCheck } from "lucide-react";
import type { WizardService } from "@/lib/booking/public-types";

interface ServiceStepProps {
  services: WizardService[];
  selectedServiceId: string | null;
  onSelect: (service: WizardService) => void;
}

export default function ServiceStep({ services, selectedServiceId, onSelect }: ServiceStepProps) {
  if (services.length === 0) {
    return (
      <p className="text-sm text-[#6b6878]">
        This guide does not currently have any bookable services available.
      </p>
    );
  }

  return (
    <div>
      <h2 className="font-serif text-xl text-[#1A2B50] font-semibold mb-1">
        Choose a session
      </h2>
      <p className="text-sm text-[#6b6878] mb-5">
        Select the type of consultation you would like to book.
      </p>

      <div className="space-y-3">
        {services.map((service) => {
          const isSelected = service.id === selectedServiceId;
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onSelect(service)}
              className={`w-full text-left rounded-xl border p-4 sm:p-5 transition-colors ${
                isSelected
                  ? "border-[#C8680A] bg-[#FDFAF4] ring-1 ring-[#C8680A]/40"
                  : "border-[#EAE3D4] bg-white hover:border-[#C8680A]/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#1A2B50] text-sm sm:text-base">
                    {service.name}
                  </p>
                  <p className="text-[#6b6878] text-sm mt-1 leading-relaxed">
                    {service.description}
                  </p>
                </div>
                <span className="text-[#C8680A] font-bold text-lg whitespace-nowrap">
                  ${service.price}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="flex items-center gap-1.5 text-xs text-[#9895a2]">
                  <Clock size={13} />
                  {service.durationMinutes} minutes
                </span>
                {service.cancellationPolicy && (
                  <span className="flex items-center gap-1.5 text-xs text-[#9895a2]">
                    <ShieldCheck size={13} />
                    Flexible cancellation
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
