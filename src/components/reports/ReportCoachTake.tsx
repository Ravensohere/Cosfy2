"use client";

import { Sparkles } from "lucide-react";
import { FormattedAIText } from "@/components/ui/FormattedAIText";
import { useAIInsight } from "@/lib/useAIInsight";

export function ReportCoachTake({
  report,
}: {
  report: { spent: number; income: number; surplus: number; leaks: string[]; wins: string[] };
}) {
  const { text, error, isLoading } = useAIInsight(
    { kind: "report-take", report },
    [report.spent, report.income, report.surplus],
    "Couldn't load the coach take."
  );

  return (
    <div className="rounded-card bg-cosfy-dark-card text-white p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={18} className="text-cosfy-lime" />
        <p className="font-bold text-[15px]">Coach take</p>
      </div>
      {isLoading ? <p className="text-[13px] text-white/70">Reading your month…</p> : null}
      {error ? <p className="text-[13px] text-white/70">{error}</p> : null}
      {text ? <FormattedAIText text={text} className="text-[13px] text-white/90" /> : null}
    </div>
  );
}
