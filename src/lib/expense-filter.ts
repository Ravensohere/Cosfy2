import { formatDate, formatMonthYear, formatShortDate } from "@/lib/format";
import { istDateString, istMidnight } from "@/lib/ist-date";

export type ExpenseFilterMode = "day" | "range" | "month" | "year";

/** Shifts an IST calendar date (YYYY-MM-DD) by whole days, IST-safe. */
function addIstDays(dateStr: string, days: number): string {
  const shifted = istMidnight(dateStr);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return istDateString(shifted);
}

export function resolveExpenseFilter(
  mode: ExpenseFilterMode | undefined,
  params: { date?: string; start?: string; end?: string; month?: string; year?: string }
): { mode: ExpenseFilterMode; start: Date; end: Date; label: string; month: string; year: string } {
  if (mode === "day" && params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)) {
    const start = istMidnight(params.date);
    const end = istMidnight(addIstDays(params.date, 1));
    return { mode: "day", start, end, label: formatDate(start), month: params.date.slice(0, 7), year: params.date.slice(0, 4) };
  }

  if (mode === "range" && params.start && params.end) {
    const start = istMidnight(params.start);
    const endDay = istMidnight(params.end);
    const end = istMidnight(addIstDays(params.end, 1));
    const label = `${formatShortDate(start)} to ${formatDate(endDay)}`;
    return { mode: "range", start, end, label, month: params.start.slice(0, 7), year: params.start.slice(0, 4) };
  }

  if (mode === "year" && params.year && /^\d{4}$/.test(params.year)) {
    const start = istMidnight(`${params.year}-01-01`);
    const end = istMidnight(`${Number(params.year) + 1}-01-01`);
    return { mode: "year", start, end, label: params.year, month: `${params.year}-01`, year: params.year };
  }

  if (mode === "month" && params.month && /^\d{4}-\d{2}$/.test(params.month)) {
    const [y, m] = params.month.split("-").map(Number);
    const start = istMidnight(`${params.month}-01`);
    const nextMonth = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
    const end = istMidnight(`${nextMonth}-01`);
    return { mode: "month", start, end, label: formatMonthYear(start), month: params.month, year: `${y}` };
  }

  const todayMonth = istDateString().slice(0, 7);
  const [y, m] = todayMonth.split("-").map(Number);
  const start = istMidnight(`${todayMonth}-01`);
  const nextMonth = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
  const end = istMidnight(`${nextMonth}-01`);
  return { mode: "month", start, end, label: formatMonthYear(start), month: todayMonth, year: `${y}` };
}
