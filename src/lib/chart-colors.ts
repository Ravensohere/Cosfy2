export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
] as const;

const FALLBACK_COLOR = "var(--cosfy-muted)";

/** Assigns fixed-order chart colors to an already-sorted list, folding overflow past 7 slots into a neutral gray. */
export function assignChartColors<T>(items: T[]): (T & { color: string })[] {
  return items.map((item, i) => ({
    ...item,
    color: i < CHART_COLORS.length ? CHART_COLORS[i] : FALLBACK_COLOR,
  }));
}
