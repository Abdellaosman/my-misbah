import { Check } from "lucide-react";

export interface WizardStepMeta {
  key: string;
  label: string;
}

interface StepIndicatorProps {
  steps: WizardStepMeta[];
  currentIndex: number;
}

export default function StepIndicator({ steps, currentIndex }: StepIndicatorProps) {
  return (
    <ol className="flex items-center w-full">
      {steps.map((step, i) => {
        const isComplete = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <li key={step.key} className="flex-1 flex items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5 min-w-[64px]">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors ${
                  isComplete
                    ? "bg-[#C8680A] border-[#C8680A] text-white"
                    : isCurrent
                      ? "bg-[#1A2B50] border-[#1A2B50] text-white"
                      : "bg-white border-[#EAE3D4] text-[#9895a2]"
                }`}
              >
                {isComplete ? <Check size={14} /> : i + 1}
              </div>
              <span
                className={`text-[11px] font-medium text-center leading-tight hidden sm:block ${
                  isCurrent ? "text-[#1A2B50]" : "text-[#9895a2]"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1.5 rounded-full ${
                  isComplete ? "bg-[#C8680A]" : "bg-[#EAE3D4]"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
