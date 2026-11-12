import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasRole, type Role } from "@/lib/roles";

export type CurrentUser = { id: string; role: Role; name?: string | null; email?: string | null; image?: string | null };

/** Thrown by action guards; actions turn it into a form error. */
export class PermissionError extends Error {}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const session = await auth();
    if (session?.user) return session.user;
  } catch (err) {
    console.warn("auth() check encountered error:", (err as Error).message);
  }

  // In development, allow instant admin access if dev session cookie exists
  if (process.env.NODE_ENV === "development") {
    try {
      const cookieStore = await cookies();
      const devCookie = cookieStore.get("pcon_dev_admin_session");
      if (devCookie?.value) {
        return {
          id: "dev-admin-user",
          role: "OWNER",
          name: "Yash Pandey (Dev Admin)",
          email: devCookie.value,
        };
      }
    } catch {
      // outside request context or header access
    }
  }

  return null;
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

/** Admin or author of a blog may edit or delete it */
export async function requireBlogAuthor(blogId: number | string) {
  const user = await getCurrentUser();
  if (!user) throw new PermissionError("You need to sign in.");
  const id = typeof blogId === "string" ? parseInt(blogId, 10) : blogId;
  try {
    const blog = await prisma.blog.findUnique({
      where: { id },
      select: { id: true, author: { select: { memberId: true } } },
    });
    if (!blog) throw new PermissionError("Blog not found.");
    if (blog.author.memberId && blog.author.memberId !== user.id && !hasRole(user.role, "ADMIN")) {
      throw new PermissionError("Only the author can change this blog.");
    }
    return { user, blog };
  } catch (e) {
    if (e instanceof PermissionError) throw e;
    if (hasRole(user.role, "ADMIN")) {
      return { user, blog: { id, author: { memberId: null as string | null } } };
    }
    throw e;
  }
}
