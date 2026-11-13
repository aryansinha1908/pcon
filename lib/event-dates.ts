import { SITE_TIME_ZONE } from "@/lib/format";

/** Calendar pieces of a date in IST (day, month, weekday, year), for date stubs and tiles. */
export function dateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: SITE_TIME_ZONE,
    day: "numeric",
    month: "short",
    weekday: "short",
    year: "numeric",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { day: get("day"), month: get("month"), weekday: get("weekday"), year: Number(get("year")) };
}

/** IST time of day, e.g. "6:30 pm". */
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", { timeZone: SITE_TIME_ZONE, hour: "numeric", minute: "2-digit" }).format(date);
}

/**
 * An event's span in IST: "Sat, 6 Dec 2026 · 10:00 am – 1:00 pm" when it starts
 * and ends on the same day, otherwise "6 Dec – 8 Dec 2026" (years shown when they differ).
 */
export function formatEventRange(start: Date, end: Date): string {
  const a = dateParts(start);
  const b = dateParts(end);
  if (a.day === b.day && a.month === b.month && a.year === b.year) {
    return `${a.weekday}, ${a.day} ${a.month} ${a.year} · ${formatTime(start)} – ${formatTime(end)}`;
  }
  return a.year === b.year
    ? `${a.day} ${a.month} – ${b.day} ${b.month} ${b.year}`
    : `${a.day} ${a.month} ${a.year} – ${b.day} ${b.month} ${b.year}`;
}
