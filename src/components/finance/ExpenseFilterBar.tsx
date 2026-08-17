"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PillChip } from "@/components/ui/PillChip";
import { FieldLabel } from "@/components/ui/Input";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { formatMonthYear } from "@/lib/format";
import type { ExpenseFilterMode } from "@/lib/expense-filter";

const MODES: { value: ExpenseFilterMode; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "range", label: "Range" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

export function ExpenseFilterBar({
  mode,
  date,
  start,
  end,
  month,
  year,
}: {
  mode: ExpenseFilterMode;
  date?: string;
  start?: string;
  end?: string;
  month: string;
  year: string;
}) {
  const router = useRouter();
  const [rangeStart, setRangeStart] = useState(start ?? "");
  const [rangeEnd, setRangeEnd] = useState(end ?? "");

  const now = new Date();
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentYear = `${now.getFullYear()}`;

  function selectMode(next: ExpenseFilterMode) {
    if (next === "month") router.push(`/budgets?mode=month&month=${month}`);
    else if (next === "year") router.push(`/budgets?mode=year&year=${year}`);
    else if (next === "day") router.push(`/budgets?mode=day&date=${date ?? month + "-01"}`);
    else router.push(`/budgets?mode=range`);
  }

  function stepMonth(delta: number) {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    router.push(`/budgets?mode=month&month=${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  function stepYear(delta: number) {
    router.push(`/budgets?mode=year&year=${parseInt(year, 10) + delta}`);
  }

  function applyRange() {
    if (!rangeStart || !rangeEnd) return;
    router.push(`/budgets?mode=range&start=${rangeStart}&end=${rangeEnd}`);
  }

  return (
    <div className="mb-4">
      <div className="flex gap-2 mb-3">
        {MODES.map((m) => (
          <PillChip key={m.value} variant={mode === m.value ? "active" : "inactive"} onClick={() => selectMode(m.value)}>
            {m.label}
          </PillChip>
        ))}
      </div>

      {mode === "day" ? (
        <DatePickerField
          value={date ?? ""}
          onChange={(v) => router.push(`/budgets?mode=day&date=${v}`)}
          maxDate={`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`}
        />
      ) : null}

      {mode === "range" ? (
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <FieldLabel>From</FieldLabel>
            <DatePickerField value={rangeStart} onChange={setRangeStart} maxDate={rangeEnd || undefined} />
          </div>
          <div className="flex-1">
            <FieldLabel>To</FieldLabel>
            <DatePickerField value={rangeEnd} onChange={setRangeEnd} minDate={rangeStart || undefined} />
          </div>
          <PrimaryButton className="h-[52px] px-4 text-[13px]" disabled={!rangeStart || !rangeEnd} onClick={applyRange}>
            Go
          </PrimaryButton>
        </div>
      ) : null}

      {mode === "month" ? (
        <div className="flex items-center justify-between rounded-input border border-cosfy-border bg-cosfy-card h-[52px] px-2">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => stepMonth(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-cosfy-ink-soft active:bg-cosfy-card-soft"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-[14px] font-bold text-cosfy-ink">{formatMonthYear(new Date(`${month}-01T00:00:00`))}</span>
          <button
            type="button"
            aria-label="Next month"
            disabled={month >= currentYM}
            onClick={() => stepMonth(1)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-cosfy-ink-soft active:bg-cosfy-card-soft disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      ) : null}

      {mode === "year" ? (
        <div className="flex items-center justify-between rounded-input border border-cosfy-border bg-cosfy-card h-[52px] px-2">
          <button
            type="button"
            aria-label="Previous year"
            onClick={() => stepYear(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-cosfy-ink-soft active:bg-cosfy-card-soft"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-[14px] font-bold text-cosfy-ink">{year}</span>
          <button
            type="button"
            aria-label="Next year"
            disabled={year >= currentYear}
            onClick={() => stepYear(1)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-cosfy-ink-soft active:bg-cosfy-card-soft disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
