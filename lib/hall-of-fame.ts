import type { FameKind, Rank } from "@/lib/achievement-options";
import { prisma } from "@/lib/prisma";

/**
 * Hall of fame for /hall-of-fame: winners of events the club organised.
 * Managed by admins at /admin/hall-of-fame; stored in `hall_of_fame_entries`
 * and `hall_of_fame_placements`. (Achievements at outside competitions live in
 * lib/club-achievements.ts.)
 */

export type Mention = { name: string; roll?: string; award?: string };

export type Placement = { rank: Rank; name: string; roll?: string; team?: string[] };

export type FameEntry = {
  id: string;
  slug: string;
  event: string;
  /** Day the event was held, YYYY-MM-DD. */
  date: string;
  kind: FameKind;
  summary?: string;
  link?: string;
  podium: Placement[];
  mentions: Mention[];
};

const orUndefined = <T,>(value: T | null) => value ?? undefined;

/** Every entry, newest first, with its podium (1→3) and mentions in order. */
export async function getHallOfFame(): Promise<FameEntry[]> {
  const rows = await prisma.hallOfFameEntry.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: { placements: { orderBy: [{ rank: "asc" }, { order: "asc" }] } },
  });
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    event: row.event,
    // A @db.Date column comes back as midnight UTC.
    date: row.date.toISOString().slice(0, 10),
    kind: row.kind as FameKind,
    summary: orUndefined(row.summary),
    link: orUndefined(row.link),
    podium: row.placements
      .filter((p) => p.rank !== null)
      .map((p) => ({ rank: p.rank as Rank, name: p.name, roll: orUndefined(p.roll), team: p.team.length ? p.team : undefined })),
    mentions: row.placements
      .filter((p) => p.rank === null)
      .map((p) => ({ name: p.name, roll: orUndefined(p.roll), award: orUndefined(p.award) })),
  }));
}

export const yearOf = (entry: FameEntry) => Number(entry.date.slice(0, 4));

/** "9 Mar 2024", read as a calendar day (no timezone shift). */
export function formatAchievementDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(Date.UTC(year, month - 1, day));
}

/** Everyone who has made a podium, with their finishes, most podiums first. */
export function podiumBoard(list: FameEntry[]) {
  const board = new Map<string, { name: string; roll?: string; golds: number; total: number; events: string[] }>();
  for (const entry of list) {
    for (const place of entry.podium) {
      const people = place.team?.length ? place.team.map((name) => ({ name, roll: undefined })) : [{ name: place.name, roll: place.roll }];
      for (const person of people) {
        // Roll numbers identify people reliably; fall back to the name.
        const key = person.roll ?? person.name;
        const row = board.get(key) ?? { name: person.name, roll: person.roll, golds: 0, total: 0, events: [] };
        row.total += 1;
        if (place.rank === 1) row.golds += 1;
        row.events.push(entry.event);
        board.set(key, row);
      }
    }
  }
  return [...board.values()].sort((a, b) => b.total - a.total || b.golds - a.golds || a.name.localeCompare(b.name));
}
