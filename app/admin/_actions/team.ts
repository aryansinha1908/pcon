"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { fieldErrorsOf, teamMemberSchema, teamMemberUpdateSchema, type FormState } from "@/lib/validation";
import { str, toFormError } from "./shared";

function refresh() {
  revalidatePath("/admin/team");
  revalidatePath("/admin/users");
  revalidatePath("/", "layout");
}

/**
 * Add someone to the team by college email. If they haven't signed in yet, a
 * user record is created now and their Google account links to it on first login.
 */
export async function addTeamMember(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }
  const parsed = teamMemberSchema.safeParse({
    email: str(formData, "email"),
    position: str(formData, "position"),
    batch: str(formData, "batch"),
    order: str(formData, "order") || 0,
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) };
  const { email, ...member } = parsed.data;

  const domain = (process.env.ALLOWED_EMAIL_DOMAIN ?? "nitjsr.ac.in").toLowerCase();
  if (!email.endsWith("@" + domain)) return { fieldErrors: { email: [`Use an @${domain} email.`] } };

  const name = str(formData, "name").trim() || null;
  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name },
    update: {},
    include: { teamMember: true },
  });
  if (!user.name && name) await prisma.user.update({ where: { id: user.id }, data: { name } });
  if (user.teamMember) return { error: `${email} is already on the team${user.teamMember.isActive ? "" : " (as alumni)"}.` };

  await prisma.teamMember.create({ data: { ...member, userId: user.id } });
  refresh();
  return { ok: `Added ${user.name ?? name ?? email} to the team.` };
}

export async function updateTeamMember(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }
  const parsed = teamMemberUpdateSchema.safeParse({
    position: str(formData, "position"),
    batch: str(formData, "batch"),
    order: str(formData, "order") || 0,
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) };

  await prisma.teamMember.updateMany({ where: { id }, data: parsed.data });
  refresh();
  return { ok: "Saved." };
}

/** Move to alumni (or back). Profile and blogs stay; only the members-page section changes. */
export async function setTeamMemberActive(id: string, isActive: boolean): Promise<FormState> {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }
  await prisma.teamMember.updateMany({ where: { id }, data: { isActive } });
  refresh();
  return { ok: isActive ? "Moved back to the current team." : "Moved to alumni." };
}

export async function removeTeamMember(id: string): Promise<FormState> {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }
  await prisma.teamMember.deleteMany({ where: { id } });
  refresh();
  return { ok: "Removed from the team page." };
}
