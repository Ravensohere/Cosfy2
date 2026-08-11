"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { cn } from "@/lib/cn";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseYMD(s: string | undefined): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDisplay(s: string) {
  const d = parseYMD(s);
  if (!d) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function DatePickerField({
  value,
  onChange,
  placeholder = "Select date",
  minDate,
  maxDate,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = parseYMD(value);
  const [viewDate, setViewDate] = useState<Date>(selected ?? new Date());

  const min = parseYMD(minDate);
  const max = parseYMD(maxDate);

  function openSheet() {
    setViewDate(selected ?? new Date());
    setOpen(true);
  }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false });
  }

  const today = toYMD(new Date());

  function isDisabled(d: Date) {
    if (min && d < min) return true;
    if (max && d > max) return true;
    return false;
  }

  function selectDay(d: Date) {
    if (isDisabled(d)) return;
    onChange(toYMD(d));
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        className={cn(
          "w-full flex items-center gap-2 rounded-input border border-cosfy-border bg-cosfy-card h-[52px] px-4 text-[14px] text-left",
          className
        )}
      >
        <CalendarDays size={16} className="text-cosfy-muted shrink-0" />
        <span className={value ? "text-cosfy-ink" : "text-cosfy-muted"}>{value ? formatDisplay(value) : placeholder}</span>
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Select date">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-cosfy-card-soft text-cosfy-ink-soft"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[15px] font-extrabold text-cosfy-ink">
            {viewDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </span>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-cosfy-card-soft text-cosfy-ink-soft"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((w, i) => (
            <span key={i} className="text-[10px] font-semibold text-cosfy-muted text-center">
              {w}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map(({ date, inMonth }, i) => {
            const ymd = toYMD(date);
            const isSelected = ymd === value;
            const isToday = ymd === today;
            const disabled = isDisabled(date);
            return (
              <button
                key={i}
                type="button"
                disabled={disabled}
                onClick={() => selectDay(date)}
                className={cn(
                  "h-10 rounded-input text-[13px] font-semibold transition-colors",
                  !inMonth && "text-cosfy-muted opacity-40",
                  inMonth && !isSelected && "text-cosfy-ink",
                  isSelected && "bg-cosfy-lime text-cosfy-lime-ink",
                  !isSelected && isToday && "border border-cosfy-lime-deep",
                  disabled && "opacity-30 pointer-events-none"
                )}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </>
  );
}
