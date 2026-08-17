"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/format";

export type DonutSegment = {
  label: string;
  value: number;
  color: string;
};

export function DonutChart({
  segments,
  size = 180,
  strokeWidth = 26,
  centerLabel,
  className,
}: {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: ReactNode;
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const gapPx = 3;

  const segLens = segments.map((seg) => (total > 0 ? (seg.value / total) * circumference : 0));
  const arcs = segments.map((seg, i) => {
    const cumulativeFraction = segments.slice(0, i).reduce((sum, s) => sum + (total > 0 ? s.value / total : 0), 0);
    const cumulative = segLens.slice(0, i).reduce((sum, len) => sum + len, 0);
    const drawnLen = Math.max(0, segLens[i] - gapPx);
    const pct = total > 0 ? seg.value / total : 0;
    const midAngleRad = ((cumulativeFraction + pct / 2) * 360 * Math.PI) / 180;
    return {
      ...seg,
      drawnLen,
      offset: -cumulative,
      index: i,
      pct,
      labelX: size / 2 + radius * Math.cos(midAngleRad),
      labelY: size / 2 + radius * Math.sin(midAngleRad),
    };
  });

  if (total <= 0) return null;

  // Slices under this share are too thin for an on-ring label; they still show in the legend below.
  const MIN_LABEL_PCT = 0.08;

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F1EDE2" strokeWidth={strokeWidth} />
          {arcs.map((arc) => (
            <circle
              key={arc.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={activeIndex === arc.index ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={`${arc.drawnLen} ${circumference - arc.drawnLen}`}
              strokeDashoffset={arc.offset}
              strokeLinecap="round"
              tabIndex={0}
              role="button"
              aria-label={`${arc.label}: ${formatINR(arc.value)}, ${Math.round(arc.pct * 100)}%`}
              className="cursor-pointer transition-[stroke-width] outline-none"
              onClick={() => setActiveIndex((cur) => (cur === arc.index ? null : arc.index))}
              onFocus={() => setActiveIndex(arc.index)}
            />
          ))}
          {arcs
            .filter((arc) => arc.pct >= MIN_LABEL_PCT)
            .map((arc) => (
              <text
                key={`label-${arc.label}`}
                x={arc.labelX}
                y={arc.labelY}
                transform={`rotate(90 ${arc.labelX} ${arc.labelY})`}
                textAnchor="middle"
                dominantBaseline="central"
                className="pointer-events-none select-none"
                style={{ fill: "#FFFFFF", fontSize: 11, fontWeight: 800 }}
              >
                {Math.round(arc.pct * 100)}%
              </text>
            ))}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center px-2">
          {activeIndex !== null ? (
            <div className="text-center">
              <p className="text-[11px] font-semibold text-cosfy-muted truncate max-w-[90px]">{arcs[activeIndex].label}</p>
              <p className="text-[16px] font-extrabold text-cosfy-ink">{formatINR(arcs[activeIndex].value)}</p>
            </div>
          ) : (
            centerLabel ?? (
              <div className="text-center">
                <p className="text-[11px] font-semibold text-cosfy-muted">Total</p>
                <p className="text-[16px] font-extrabold text-cosfy-ink">{formatINR(total)}</p>
              </div>
            )
          )}
        </div>
      </div>

      <div className="w-full space-y-1.5">
        {arcs.map((arc) => (
          <button
            key={arc.label}
            type="button"
            onClick={() => setActiveIndex((cur) => (cur === arc.index ? null : arc.index))}
            className={cn(
              "flex items-center gap-2.5 w-full rounded-lg px-2 py-1.5 text-left transition-colors",
              activeIndex === arc.index ? "bg-cosfy-card-soft" : "bg-transparent"
            )}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: arc.color }} />
            <span className="text-[13px] font-semibold text-cosfy-ink flex-1 truncate">{arc.label}</span>
            <span className="text-[12px] text-cosfy-muted">{Math.round(arc.pct * 100)}%</span>
            <span className="text-[13px] font-bold text-cosfy-ink tabular-nums">{formatINR(arc.value)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
