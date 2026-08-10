"use client";

import { useEffect, useState } from "react";
import { Sparkles, TriangleAlert } from "lucide-react";
import { FormattedAIText } from "@/components/ui/FormattedAIText";

export function InsightsPanel({
  thisMonth,
  lastMonth,
}: {
  thisMonth: Record<string, number>;
  lastMonth: Record<string, number>;
}) {
  const [insights, setInsights] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thisMonth, lastMonth }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok) {
          setError(data.error ?? "Couldn't load insights.");
          return;
        }
        setInsights(data.insights);
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
  }, [thisMonth, lastMonth]);

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
