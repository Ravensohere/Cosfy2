import { cn } from "@/lib/cn";

export function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn("h-1.5 rounded-full", i < step ? "w-6 bg-cosfy-lime-deep" : "w-1.5 bg-cosfy-border-strong")}
        />
      ))}
    </div>
  );
}
