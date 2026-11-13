/**
 * Allowed values for achievements and hall-of-fame entries. Shared by the
 * validation rules, the admin forms and the public pages (no database code,
 * so client components can import it).
 */

export const ACHIEVEMENT_KINDS = ["ICPC", "Hackathon", "Other"] as const;
export type AchievementKind = (typeof ACHIEVEMENT_KINDS)[number];

/** Badge colour on /achievements. */
export const ACHIEVEMENT_TIERS = [
  { value: "winner", label: "Winner (gold)" },
  { value: "runner-up", label: "Runner-up (silver)" },
  { value: "finalist", label: "Finalist (mint)" },
  { value: "rank", label: "Rank / other result (blue)" },
] as const;
export type AchievementTier = (typeof ACHIEVEMENT_TIERS)[number]["value"];
export const ACHIEVEMENT_TIER_VALUES = ACHIEVEMENT_TIERS.map((t) => t.value) as [AchievementTier, ...AchievementTier[]];

export const FAME_KINDS = ["Contest", "Hackathon", "Quiz", "Other"] as const;
export type FameKind = (typeof FAME_KINDS)[number];

export const RANKS = [1, 2, 3] as const;
export type Rank = (typeof RANKS)[number];
