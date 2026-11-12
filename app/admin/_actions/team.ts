"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import {
  fieldErrorsOf,
  teamMemberInputSchema,
  teamMemberUpdateApiSchema,
  type FormState,
} from "@/lib/validation";
import { str, toFormError } from "./shared";

function refresh() {
  revalidatePath("/admin/team");
  revalidatePath("/admin/users");
  revalidatePath("/team");
  revalidatePath("/", "layout");
}

export async function addTeamMember(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }

  const rawBatch = str(formData, "batch");
  const rawOrder = str(formData, "displayOrder") || str(formData, "order") || "0";

  const parsed = teamMemberInputSchema.safeParse({
    name: str(formData, "name"),
    photo: str(formData, "photo") || undefined,
    batch: rawBatch ? Number(rawBatch) : undefined,
    designation: str(formData, "designation") || str(formData, "position") || undefined,
    domain: str(formData, "domain") || undefined,
    github: str(formData, "github") || undefined,
    linkedin: str(formData, "linkedin") || undefined,
    portfolio: str(formData, "portfolio") || undefined,
    email: str(formData, "email") || undefined,
    displayOrder: rawOrder ? Number(rawOrder) : 0,
    isActive: true,
  });

  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) };
  const memberData = parsed.data;

  let userId: string | undefined = undefined;
  if (memberData.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: memberData.email },
    });
    if (existingUser) {
      userId = existingUser.id;
    }
  }

  await prisma.teamMember.create({
    data: {
      name: memberData.name,
      photo: memberData.photo,
      batch: memberData.batch,
      designation: memberData.designation,
      domain: memberData.domain,
      github: memberData.github,
      linkedin: memberData.linkedin,
      portfolio: memberData.portfolio,
      email: memberData.email,
      displayOrder: memberData.displayOrder,
      isActive: memberData.isActive,
      userId,
    },
  });

  refresh();
  return { ok: `Added ${memberData.name} to the team.` };
}

export async function updateTeamMember(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }

  const rawBatch = str(formData, "batch");
  const rawOrder = str(formData, "displayOrder") || str(formData, "order");

  const parsed = teamMemberUpdateApiSchema.safeParse({
    name: str(formData, "name") || undefined,
    photo: str(formData, "photo") || undefined,
    batch: rawBatch ? Number(rawBatch) : undefined,
    designation: str(formData, "designation") || str(formData, "position") || undefined,
    domain: str(formData, "domain") || undefined,
    github: str(formData, "github") || undefined,
    linkedin: str(formData, "linkedin") || undefined,
    portfolio: str(formData, "portfolio") || undefined,
    email: str(formData, "email") || undefined,
    displayOrder: rawOrder ? Number(rawOrder) : undefined,
  });

  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) };

  await prisma.teamMember.update({
    where: { id },
    data: parsed.data,
  });

  refresh();
  return { ok: "Saved member details." };
}

export async function setTeamMemberActive(id: string, isActive: boolean): Promise<FormState> {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }

  await prisma.teamMember.update({
    where: { id },
    data: { isActive },
  });

  refresh();
  return { ok: isActive ? "Marked member as active." : "Marked member as inactive." };
}

export async function removeTeamMember(id: string): Promise<FormState> {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }

  await prisma.teamMember.delete({ where: { id } });
  refresh();
  return { ok: "Removed member from the team." };
}
