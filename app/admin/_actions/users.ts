"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { isRole } from "@/lib/roles";
import type { FormState } from "@/lib/validation";
import { toFormError } from "./shared";

/**
 * Owner-only. Rules:
 *  - you can't change your own role (hand over first, then ask the new owner);
 *  - the last remaining owner can't be demoted, so the club is never locked out.
 */
export async function changeUserRole(userId: string, role: string): Promise<FormState> {
  let actor;
  try {
    actor = await requireRole("OWNER");
  } catch (e) {
    return toFormError(e);
  }
  if (!isRole(role)) return { error: "Unknown role." };
  if (userId === actor.id) return { error: "You can't change your own role. Ask another owner." };

  try {
    const message = await prisma.$transaction(
      async (tx) => {
        // Re-check inside the transaction: the actor may have been demoted by
        // another owner after `requireRole` ran but before this point.
        const me = await tx.user.findUnique({ where: { id: actor.id }, select: { role: true } });
        if (me?.role !== "OWNER") return "You're no longer an owner.";

        const target = await tx.user.findUnique({ where: { id: userId }, select: { role: true } });
        if (!target) return "That user no longer exists.";
        if (target.role === role) return null;

        if (target.role === "OWNER" && role !== "OWNER") {
          const owners = await tx.user.count({ where: { role: "OWNER" } });
          if (owners <= 1) return "This is the last owner. Make someone else an owner first.";
        }
        // Sessions are database-backed and read the role on every request,
        // so the change applies to their next page load without logging them out.
        await tx.user.update({ where: { id: userId }, data: { role } });
        return null;
      },
      // Serializable so two owners demoting each other at once can't both succeed.
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    if (message) return { error: message };
  } catch (e) {
    if (isWriteConflict(e)) {
      return { error: "Someone else changed roles at the same time. Please try again." };
    }
    throw e;
  }

  revalidatePath("/admin/users");
  return { ok: "Role updated." };
}

/**
 * Postgres refused one of two transactions that ran at the same moment.
 * Prisma reports this as P2034 with its built-in engine, and as a driver
 * error (Postgres code 40001) with driver adapters, the default from Prisma 7.
 */
function isWriteConflict(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2034") return true;
  const err = e as { name?: string; message?: string; cause?: { originalCode?: string; kind?: string } } | null;
  return (
    err?.cause?.originalCode === "40001" ||
    err?.cause?.kind === "TransactionWriteConflict" ||
    /TransactionWriteConflict|could not serialize access/i.test(`${err?.name ?? ""} ${err?.message ?? ""}`)
  );
}
