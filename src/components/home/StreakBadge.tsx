import { Flame } from "lucide-react";

export function StreakBadge({ noSpendStreak, loggingStreak }: { noSpendStreak: number; loggingStreak: number }) {
  const message =
    noSpendStreak >= 2
      ? `${noSpendStreak}-day no-spend streak, keep it going`
      : loggingStreak >= 3
      ? `${loggingStreak}-day logging streak, you're on top of it`
      : null;

  if (!message) return null;

  return (
    <div className="flex items-center gap-2 rounded-card bg-cosfy-lime-pale border border-cosfy-lime-soft px-4 py-3">
      <Flame size={16} className="text-cosfy-lime-ink shrink-0" />
      <p className="text-[13px] font-semibold text-cosfy-lime-ink">{message}</p>
    </div>
  );
}
