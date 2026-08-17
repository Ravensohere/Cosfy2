import { formatDate, formatMonthYear, formatShortDate } from "@/lib/format";

export type ExpenseFilterMode = "day" | "range" | "month" | "year";

function toYM(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function resolveExpenseFilter(
  mode: ExpenseFilterMode | undefined,
  params: { date?: string; start?: string; end?: string; month?: string; year?: string }
): { mode: ExpenseFilterMode; start: Date; end: Date; label: string; month: string; year: string } {
  const now = new Date();

  if (mode === "day" && params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)) {
    const start = new Date(`${params.date}T00:00:00`);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return { mode: "day", start, end, label: formatDate(start), month: toYM(start), year: `${start.getFullYear()}` };
  }

  if (mode === "range" && params.start && params.end) {
    const start = new Date(`${params.start}T00:00:00`);
    const endDay = new Date(`${params.end}T00:00:00`);
    const end = new Date(endDay.getTime() + 24 * 60 * 60 * 1000);
    const label = `${formatShortDate(start)} to ${formatDate(endDay)}`;
    return { mode: "range", start, end, label, month: toYM(start), year: `${start.getFullYear()}` };
  }

  if (mode === "year" && params.year && /^\d{4}$/.test(params.year)) {
    const y = parseInt(params.year, 10);
    const start = new Date(y, 0, 1);
    const end = new Date(y + 1, 0, 1);
    return { mode: "year", start, end, label: `${y}`, month: toYM(start), year: params.year };
  }

  if (mode === "month" && params.month && /^\d{4}-\d{2}$/.test(params.month)) {
    const [y, m] = params.month.split("-").map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);
    return { mode: "month", start, end, label: formatMonthYear(start), month: params.month, year: `${y}` };
  }

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { mode: "month", start, end, label: formatMonthYear(start), month: toYM(start), year: `${now.getFullYear()}` };
}
