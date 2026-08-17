/**
 * Literal hex, not var(--chart-N): html2canvas (used for "share as image")
 * unreliably resolves CSS custom properties on mobile Safari/WebView,
 * silently producing a blank capture. Keep in sync with globals.css.
 */
export const CHART_COLORS = [
  "#2a78d6",
  "#eb6834",
  "#1baf7a",
  "#eda100",
  "#e87ba4",
  "#008300",
  "#4a3aa7",
] as const;

const FALLBACK_COLOR = "#8C887C";

/** Assigns fixed-order chart colors to an already-sorted list, folding overflow past 7 slots into a neutral gray. */
export function assignChartColors<T>(items: T[]): (T & { color: string })[] {
  return items.map((item, i) => ({
    ...item,
    color: i < CHART_COLORS.length ? CHART_COLORS[i] : FALLBACK_COLOR,
  }));
}
