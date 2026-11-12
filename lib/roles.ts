export const ROLES = ["MEMBER", "ADMIN", "OWNER"] as const;
export type Role = (typeof ROLES)[number];

const RANK: Record<Role, number> = { MEMBER: 0, ADMIN: 1, OWNER: 2 };

/** True if `role` is at least `required` (an OWNER can do everything an ADMIN can). */
export function hasRole(role: Role | undefined | null, required: Role): boolean {
  if (!role) return false;
  return RANK[role] >= RANK[required];
}

export function roleLabel(role: Role): string {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}
