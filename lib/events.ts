import { prisma } from "@/lib/prisma";

/**
 * Public display rule for events:
 * once there are MORE than `maxBeforeCutoff` events, events that started more
 * than `cutoffYears` ago are hidden from the public site.
 * Admin pages always show every event.
 */
export const EVENT_RULE = { maxBeforeCutoff: 10, cutoffYears: 4 } as const;

export function eventCutoffDate(now: Date = new Date()): Date {
  const cutoff = new Date(now);
  cutoff.setFullYear(cutoff.getFullYear() - EVENT_RULE.cutoffYears);
  return cutoff;
}

/** Whether an event is hidden on the public site, given how many events exist in total. */
export function isHiddenOnSite(startDate: Date, totalEvents: number, now: Date = new Date()): boolean {
  return totalEvents > EVENT_RULE.maxBeforeCutoff && startDate < eventCutoffDate(now);
}

/** Use this for every public listing of events (events page, home carousel, ...). */
export async function getPublicEvents(now: Date = new Date()) {
  const total = await prisma.event.count();
  return prisma.event.findMany({
    where: total > EVENT_RULE.maxBeforeCutoff ? { startDate: { gte: eventCutoffDate(now) } } : {},
    orderBy: { startDate: "desc" },
  });
}
