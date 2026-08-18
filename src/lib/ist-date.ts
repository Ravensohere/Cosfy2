const IST_TZ = "Asia/Kolkata";

/**
 * Calendar date (YYYY-MM-DD) of the given instant, in India Standard Time.
 * Use this instead of Date#getFullYear/getMonth/getDate on the server:
 * those read the runtime's local timezone (UTC on Vercel), not IST.
 */
export function istDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: IST_TZ }).format(date);
}

/** The UTC instant corresponding to midnight IST on the given YYYY-MM-DD. */
export function istMidnight(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00+05:30`);
}
