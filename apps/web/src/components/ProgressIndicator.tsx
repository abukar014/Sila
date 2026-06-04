interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
}

export default function ProgressIndicator({
  currentStep,
  totalSteps,
  stepLabel,
}: ProgressIndicatorProps) {
  return (
    <div className="relative w-full px-[28px] pt-[8px]">
      <div className="flex items-center gap-[6px]">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const step = index + 1;
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;

          return (
            <div
              key={step}
              className={`rounded-full ${
                isActive
                  ? 'size-[9px] bg-[#1b2c4b]'
                  : isCompleted
                  ? 'size-[7px] bg-[#1b2c4b] mt-[1px]'
                  : 'size-[7px] bg-[rgba(40,70,107,0.46)] mt-[1px]'
              }`}
            />
          );
        })}
        <p
          className="ml-[12px] font-medium leading-[16.5px] text-[#535b6a] text-[11px] whitespace-nowrap"
          style={{ fontFamily: "'DM Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
        >
          {currentStep} of {totalSteps} · {stepLabel}
        </p>
      </div>
    </div>
  );
}
