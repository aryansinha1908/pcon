import type { AchievementKind, AchievementTier } from "@/lib/achievement-options";
import { prisma } from "@/lib/prisma";

/**
 * Club achievements for /achievements: how PCON members have done at
 * competitions outside the club (ICPC regionals, national hackathons).
 * Managed by admins at /admin/achievements; stored in the `achievements` table.
 * Winners of PCON's own contests live in the hall of fame instead.
 */

export type ClubAchievement = {
  id: string;
  slug: string;
  title: string;
  organiser: string;
  year: number;
  /** Optional free-text dates, shown when known. */
  dates: string | null;
  kind: AchievementKind;
  /** Short badge, e.g. "Winner" or "Rank 54". */
  result: string;
  tier: AchievementTier;
  /** One line of context, e.g. "1st among all NITs". */
  highlight: string | null;
  image: { src: string; alt: string } | null;
  featured: boolean;
};

/** Every achievement, the featured one first, then newest first. */
export async function getAchievements(): Promise<ClubAchievement[]> {
  const rows = await prisma.achievement.findMany({ orderBy: [{ featured: "desc" }, { year: "desc" }, { createdAt: "desc" }] });
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    organiser: row.organiser,
    year: row.year,
    dates: row.dates,
    kind: row.kind as AchievementKind,
    result: row.result,
    tier: row.tier as AchievementTier,
    highlight: row.highlight,
    image: row.imageUrl ? { src: row.imageUrl, alt: row.imageAlt ?? row.title } : null,
    featured: row.featured,
  }));
}

/** From the club deck: PCON was officially established in 2017. */
export const FOUNDED = 2017;

/** The club's stated vision, from the seniors' deck. */
export const VISION = [
  "Improve the coding and development culture in our college.",
  "Compete in programming competitions such as ACM-ICPC, SIH, GSoC and the Adobe Hackathon.",
  "Establish a healthy competitive environment within college.",
];
