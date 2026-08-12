import { formatShortDate, formatDate, formatMonthYear } from "@/lib/format";

export type RangePreset = "this-month" | "last-3-months" | "this-year" | "all-time" | "custom";

export const RANGE_PRESETS: { value: RangePreset; label: string }[] = [
  { value: "this-month", label: "This month" },
  { value: "last-3-months", label: "Last 3 months" },
  { value: "this-year", label: "This year" },
  { value: "all-time", label: "All time" },
  { value: "custom", label: "Custom" },
];

export function resolveRange(
  preset: RangePreset,
  customStart?: string,
  customEnd?: string
): { start: Date; end: Date; label: string } {
  const now = new Date();

  if (preset === "this-month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { start, end, label: formatMonthYear(start) };
  }

  if (preset === "last-3-months") {
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { start, end, label: "Last 3 months" };
  }

  if (preset === "this-year") {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear() + 1, 0, 1);
    return { start, end, label: `${now.getFullYear()}` };
  }

  if (preset === "all-time") {
    return { start: new Date(2000, 0, 1), end: new Date(now.getFullYear() + 1, 0, 1), label: "All time" };
  }

  const start = customStart ? new Date(`${customStart}T00:00:00`) : new Date(now.getFullYear(), now.getMonth(), 1);
  const endDay = customEnd ? new Date(`${customEnd}T00:00:00`) : now;
  const end = new Date(endDay.getTime() + 24 * 60 * 60 * 1000);
  const startLabel = formatShortDate(start);
  const endLabel = formatDate(new Date(end.getTime() - 1));
  return { start, end, label: `${startLabel} to ${endLabel}` };
}

export function monthBuckets(start: Date, end: Date, maxBuckets = 12): { bucketStart: Date; bucketEnd: Date; label: string }[] {
  const buckets: { bucketStart: Date; bucketEnd: Date; label: string }[] = [];
  let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cursor < end) {
    const bucketEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    buckets.push({
      bucketStart: new Date(cursor),
      bucketEnd,
      label: cursor.toLocaleDateString("en-IN", { month: "short", year: buckets.length === 0 ? "2-digit" : undefined }),
    });
    cursor = bucketEnd;
  }
  return buckets.slice(-maxBuckets);
}
