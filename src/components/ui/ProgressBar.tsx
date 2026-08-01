import { cn } from "@/lib/cn";

export function ProgressBar({
  value,
  max,
  className,
  trackClassName,
  fillClassName,
}: {
  value: number;
  max: number;
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const overBudget = max > 0 && value > max;

  return (
    <div className={cn("h-2 w-full rounded-full bg-cosfy-card-soft overflow-hidden", trackClassName, className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all",
          overBudget ? "bg-cosfy-red" : "bg-cosfy-lime",
          fillClassName
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
