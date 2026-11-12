/**
 * The club runs on Indian time. Event times are entered and shown in IST,
 * whatever timezone the server happens to run in (Vercel runs in UTC).
 */
export const SITE_TIME_ZONE = "Asia/Kolkata";
const SITE_UTC_OFFSET = "+05:30"; // India has no daylight saving

/** "2026-11-12T18:30" typed into a datetime-local input → the real instant in IST. */
export function fromSiteLocal(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return undefined;
  return new Date(`${value}:00${SITE_UTC_OFFSET}`);
}

/** A Date → "2026-11-12T18:30" in IST, for a datetime-local input's value. */
export function toSiteLocal(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SITE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function formatDate(date: Date, withTime = false): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: SITE_TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(date);
}
