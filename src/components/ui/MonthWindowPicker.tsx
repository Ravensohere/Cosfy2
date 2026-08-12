"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { PillChip } from "@/components/ui/PillChip";
import { cn } from "@/lib/cn";
import { formatMonthYear } from "@/lib/format";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function toYM(year: number, monthIndex: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

function parseYM(ym: string) {
  const [year, month] = ym.split("-").map(Number);
  return { year, monthIndex: month - 1 };
}

function formatLabel(ym: string) {
  const { year, monthIndex } = parseYM(ym);
  return formatMonthYear(new Date(year, monthIndex, 1));
}

export function MonthWindowPicker({
  value,
  basePath,
  allowedMonths,
  allowAll = false,
}: {
  value: string | null;
  basePath: string;
  allowedMonths?: string[];
  allowAll?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const now = new Date();
  const initial = value ? parseYM(value) : { year: now.getFullYear(), monthIndex: now.getMonth() };
  const [displayYear, setDisplayYear] = useState(initial.year);

  const allowedSet = allowedMonths ? new Set(allowedMonths) : null;

  function isFuture(year: number, monthIndex: number) {
    return year > now.getFullYear() || (year === now.getFullYear() && monthIndex > now.getMonth());
  }

  function isDisabled(year: number, monthIndex: number) {
    if (isFuture(year, monthIndex)) return true;
    if (allowedSet) return !allowedSet.has(toYM(year, monthIndex));
    return false;
  }

  function selectMonth(year: number, monthIndex: number) {
    if (isDisabled(year, monthIndex)) return;
    router.push(`${basePath}?m=${toYM(year, monthIndex)}`);
    setOpen(false);
  }

  function selectAll() {
    router.push(basePath);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full px-3.5 h-8 bg-cosfy-card-soft border border-cosfy-border text-[12px] font-semibold text-cosfy-ink"
      >
        <CalendarDays size={14} className="text-cosfy-muted" />
        {value ? formatLabel(value) : "All time"}
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Select month">
        <div className="flex flex-col gap-4">
          {allowAll ? (
            <PillChip
              variant={value === null ? "active" : "inactive"}
              onClick={selectAll}
              className="self-start"
            >
              All time
            </PillChip>
          ) : null}

          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous year"
              onClick={() => setDisplayYear((y) => y - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-cosfy-card-soft text-cosfy-ink-soft"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[15px] font-extrabold text-cosfy-ink">{displayYear}</span>
            <button
              type="button"
              aria-label="Next year"
              disabled={displayYear >= now.getFullYear()}
              onClick={() => setDisplayYear((y) => y + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-cosfy-card-soft text-cosfy-ink-soft disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {MONTH_LABELS.map((label, monthIndex) => {
              const ym = toYM(displayYear, monthIndex);
              const disabled = isDisabled(displayYear, monthIndex);
              const active = value === ym;
              return (
                <button
                  key={label}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectMonth(displayYear, monthIndex)}
                  className={cn(
                    "rounded-card h-11 text-[13px] font-semibold border transition-colors",
                    active
                      ? "bg-cosfy-lime text-cosfy-lime-ink border-cosfy-lime"
                      : disabled
                        ? "bg-cosfy-card-soft text-cosfy-muted border-cosfy-border opacity-40"
                        : "bg-cosfy-card text-cosfy-ink border-cosfy-border"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
