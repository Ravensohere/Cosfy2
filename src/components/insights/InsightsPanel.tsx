"use client";

import { Sparkles, TriangleAlert } from "lucide-react";
import { FormattedAIText } from "@/components/ui/FormattedAIText";
import { useAIInsight } from "@/lib/useAIInsight";

export function InsightsPanel({
  thisMonth,
  lastMonth,
}: {
  thisMonth: Record<string, number>;
  lastMonth: Record<string, number>;
}) {
  const {
    text: insights,
    error,
    isLoading,
  } = useAIInsight({ thisMonth, lastMonth }, [thisMonth, lastMonth], "Couldn't load insights.");

  return (
    <div className="rounded-card bg-cosfy-dark-card text-white p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={18} className="text-cosfy-lime" />
        <p className="font-bold text-[15px]">AI insights</p>
      </div>

      {isLoading ? <p className="text-[13px] text-white/70">Analysing your spending…</p> : null}
      {error ? <p className="text-[13px] text-white/70">{error}</p> : null}
      {insights ? <FormattedAIText text={insights} className="text-[13px] text-white/90" /> : null}

      {insights ? (
        <div className="mt-3 pt-3 border-t border-white/10 flex items-start gap-1.5 text-[11px] text-cosfy-lime">
          <TriangleAlert size={13} className="mt-[1px] shrink-0" />
          <span>Not financial advice, verify before acting on it.</span>
        </div>
      ) : null}
    </div>
  );
}
