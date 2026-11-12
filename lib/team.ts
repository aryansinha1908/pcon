/**
 * Team Page types and shared constants.
 * Member data is served dynamically from the database via /api/team/members.
 */

export type DepartmentTint = "mint" | "blue" | "orange" | "violet";

export const TEAM_BATCHES = [2026, 2027, 2028, 2029] as const;
export type TeamBatch = (typeof TEAM_BATCHES)[number];

export const TEAM_HERO_BANNER =
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&h=820&q=80";

export type TeamMember = {
  id: string;
  name: string;
  photo?: string | null;
  image?: string | null;
  rollNumber?: string | null;
  designation?: string | null;
  domain?: string | null;
  department?: string | null;
  batch: number;
  github?: string | null;
  linkedin?: string | null;
  portfolio?: string | null;
  email?: string | null;
  displayOrder?: number;
  isActive?: boolean;
};
