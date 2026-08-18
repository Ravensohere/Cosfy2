const inrFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

export function formatINR(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? "-" : "";
  return `${sign}₹${inrFormatter.format(Math.abs(rounded))}`;
}

const IST_TZ = "Asia/Kolkata";

/**
 * timeZone is pinned to IST everywhere: this app is India-only, but the
 * server runtime (Vercel) defaults to UTC, so an unpinned format silently
 * shows the wrong calendar day for anyone whose IST date differs from UTC's.
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: IST_TZ,
  }).format(date);
}

/** "12 Aug" — no year, used for near-term due/renewal dates throughout the app. */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: IST_TZ });
}

/** "August 2026" — used by month pickers and period labels. */
export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: IST_TZ }).format(date);
}
