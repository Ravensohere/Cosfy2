import { cn } from "@/lib/cn";

type Props = {
  step: number;
  total: number;
  onStepClick?: (step: number) => void;
};

export function ProgressDots({ step, total, onStepClick }: Props) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => {
        const dotClass = cn(
          "h-1.5 rounded-full transition-[width] duration-200",
          i < step ? "w-6 bg-cosfy-lime-deep" : "w-1.5 bg-cosfy-border-strong"
        );
        if (!onStepClick) {
          return <div key={i} className={dotClass} />;
        }
        return (
          <button
            key={i}
            type="button"
            aria-label={`Go to step ${i + 1}`}
            onClick={() => onStepClick(i + 1)}
            className="p-1 -m-1"
          >
            <span className={dotClass} />
          </button>
        );
      })}
    </div>
  );
}
