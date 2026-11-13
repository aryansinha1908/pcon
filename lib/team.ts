/**
 * Team Page types and shared constants.
 * Member data is served dynamically from the database via /api/team/members.
 */

export type DepartmentTint = "mint" | "blue" | "orange" | "violet";

export const CURRENT_TEAM_BATCH = 2027;
export const TEAM_BATCHES = [2027, 2026, 2025] as const;
export type TeamBatch = (typeof TEAM_BATCHES)[number];

// 480px WebP (~15KB) instead of the 647px, 144KB PNG: it only fills a small placeholder.
export const PCON_FALLBACK_LOGO = "/pcon-logo-480.webp";

export const TEAM_HERO_BANNER =
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&h=820&q=80";

export type TeamMember = {
  id: string;
  name: string;
  studentId?: string | null;
  rollNumber?: string | null;
  photo?: string | null;
  image?: string | null;
  designation?: string | null;
  domain?: string | null;
  department?: string | null;
  batch: number;
  specializations?: string[];
  github?: string | null;
  linkedin?: string | null;
  portfolio?: string | null;
  email?: string | null;
  displayOrder?: number;
  isActive?: boolean;
};
