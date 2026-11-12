import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roles";

export type CurrentUser = { id: string; role: Role; name?: string | null; email?: string | null; image?: string | null };

/** Thrown by action guards; actions turn it into a form error. */
export class PermissionError extends Error {}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  return session?.user ?? null;
}

// ---------- For pages: redirect instead of throwing ----------

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requirePageRole(required: Role): Promise<CurrentUser> {
  const user = await requireUser();
  if (!hasRole(user.role, required)) redirect("/admin?denied=1");
  return user;
}

// ---------- For server actions: every action calls one of these ----------
// Layouts only hide UI. Server actions are public endpoints, so each one
// re-checks permissions itself.

export async function requireRole(required: Role): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new PermissionError("You need to sign in.");
  if (!hasRole(user.role, required)) throw new PermissionError("You don't have permission to do that.");
  return user;
}

/** Only the author of a blog may edit or delete it — admins included. */
export async function requireBlogAuthor(blogId: string) {
  const user = await getCurrentUser();
  if (!user) throw new PermissionError("You need to sign in.");
  const blog = await prisma.blog.findUnique({ where: { id: blogId }, select: { id: true, authorId: true } });
  if (!blog) throw new PermissionError("Blog not found.");
  if (blog.authorId !== user.id) throw new PermissionError("Only the author can change this blog.");
  return { user, blog };
}
