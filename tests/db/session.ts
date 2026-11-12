import { AsyncLocalStorage } from "node:async_hooks";
import type { Role } from "@prisma/client";

/**
 * Stands in for Auth.js during tests. `actingAs(userId, fn)` runs `fn` as that
 * user. Like the real database sessions, the role is read fresh from the
 * database on every call, so a demotion applies immediately.
 */
type Ctx = { userId: string | null; staleRole?: Role };
const store = new AsyncLocalStorage<Ctx>();

export function actingAs<T>(userId: string | null, fn: () => Promise<T>, opts: { staleRole?: Role } = {}): Promise<T> {
  return store.run({ userId, ...opts }, fn);
}

export async function currentSession() {
  const ctx = store.getStore();
  if (!ctx?.userId) return null;
  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({ where: { id: ctx.userId } });
  if (!user) return null;
  return {
    user: { id: user.id, name: user.name, email: user.email, image: user.image, role: ctx.staleRole ?? user.role },
    expires: new Date(Date.now() + 86_400_000).toISOString(),
  };
}
