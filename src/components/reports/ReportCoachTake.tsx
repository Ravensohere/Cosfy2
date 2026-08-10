"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { FormattedAIText } from "@/components/ui/FormattedAIText";

export function ReportCoachTake({
  report,
}: {
  report: { spent: number; income: number; surplus: number; leaks: string[]; wins: string[] };
}) {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "report-take", report }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok) {
          setError(data.error ?? "Couldn't load the coach take.");
          return;
        }
        setText(data.insights);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't reach the server.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report.spent, report.income, report.surplus]);

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
