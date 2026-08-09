"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/format";

export type TrendPoint = { label: string; value: number };

export function TrendBarChart({
  data,
  color = "var(--chart-1)",
  height = 140,
  className,
}: {
  data: TrendPoint[];
  color?: string;
  height?: number;
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className={cn("w-full", className)}>
      <div className="relative flex items-end justify-between gap-1.5 border-b border-cosfy-border" style={{ height }}>
        {data.map((d, i) => {
          const pct = max > 0 ? d.value / max : 0;
          const isActive = activeIndex === i;
          return (
            <div key={d.label} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
              {d.value > 0 ? (
                <span className={cn("text-[10px] font-semibold mb-1 tabular-nums whitespace-nowrap", isActive ? "text-cosfy-ink" : "text-cosfy-muted")}>
                  {d.value >= 1000 ? `${Math.round(d.value / 100) / 10}k` : Math.round(d.value)}
                </span>
              ) : null}
              <button
                type="button"
                aria-label={`${d.label}: ${formatINR(d.value)}`}
                onClick={() => setActiveIndex((cur) => (cur === i ? null : i))}
                className="w-full max-w-[24px] rounded-t-[4px] transition-opacity outline-none"
                style={{
                  height: `${Math.max(pct * 100, d.value > 0 ? 3 : 0)}%`,
                  backgroundColor: color,
                  opacity: activeIndex === null || isActive ? 1 : 0.45,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-1.5 mt-1.5">
        {data.map((d, i) => (
          <span
            key={d.label}
            className={cn(
              "flex-1 text-center text-[10px] font-semibold truncate",
              activeIndex === i ? "text-cosfy-ink" : "text-cosfy-muted"
            )}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
