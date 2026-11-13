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

  const rawEmail = str(formData, "email").trim();
  const normalizedEmail = rawEmail ? rawEmail.toLowerCase() : undefined;

  const domain = (process.env.ALLOWED_EMAIL_DOMAIN ?? "nitjsr.ac.in").toLowerCase();
  if (normalizedEmail && !normalizedEmail.endsWith("@" + domain)) {
    return { fieldErrors: { email: [`Use an @${domain} email.`] } };
  }

  let user = null;
  const rawName = str(formData, "name").trim();

  if (normalizedEmail) {
    user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { teamMember: true },
    });

    if (user?.teamMember) {
      return { error: `${normalizedEmail} is already on the team${user.teamMember.isActive ? "" : " (as alumni)"}.` };
    }

    const existingMemberByEmail = await prisma.teamMember.findFirst({
      where: { email: normalizedEmail },
    });
    if (existingMemberByEmail) {
      return { error: `${normalizedEmail} is already on the team${existingMemberByEmail.isActive ? "" : " (as alumni)"}.` };
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: rawName || null,
          role: "MEMBER",
        },
        include: { teamMember: true },
      });
    } else if (!user.name && rawName) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name: rawName },
        include: { teamMember: true },
      });
    }
  }

  const rawBatch = str(formData, "batch");
  const rawOrder = str(formData, "displayOrder") || str(formData, "order") || "0";
  const rawSpecs = str(formData, "specializations");
  const rawDesignation = str(formData, "designation") || str(formData, "position") || undefined;
  const finalOrder = Number(rawOrder) || 0;
  const resolvedName = rawName || user?.name || (normalizedEmail ? normalizedEmail.split("@")[0] : "") || "Member";

  const parsed = teamMemberInputSchema.safeParse({
    name: resolvedName,
    studentId: str(formData, "studentId") || undefined,
    photo: str(formData, "photo") || undefined,
    batch: rawBatch ? Number(rawBatch) : undefined,
    designation: rawDesignation,
    domain: str(formData, "domain") || undefined,
    specializations: rawSpecs || undefined,
    github: str(formData, "github") || undefined,
    linkedin: str(formData, "linkedin") || undefined,
    portfolio: str(formData, "portfolio") || undefined,
    email: normalizedEmail,
    displayOrder: finalOrder,
    isActive: true,
  });

  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) };
  const memberData = parsed.data;

  const specs = memberData.specializations ?? [];

  await prisma.teamMember.create({
    data: {
      name: memberData.name,
      studentId: memberData.studentId,
      photo: memberData.photo,
      batch: memberData.batch,
      position: memberData.designation ?? null,
      designation: memberData.designation ?? null,
      domain: memberData.domain,
      github: memberData.github,
      linkedin: memberData.linkedin,
      portfolio: memberData.portfolio,
      email: memberData.email,
      order: memberData.displayOrder,
      displayOrder: memberData.displayOrder,
      isActive: memberData.isActive,
      userId: user?.id ?? undefined,
      ...(specs.length > 0
        ? {
            specializations: {
              create: specs.map((name) => ({ name })),
            },
          }
        : {}),
    },
  });

  refresh();
  return { ok: `Added ${user?.name ?? memberData.name ?? rawName ?? normalizedEmail} to the team.` };
}

export async function updateTeamMember(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }

  const rawBatch = str(formData, "batch");
  const rawOrder = str(formData, "displayOrder") || str(formData, "order");

  const hasName = formData.has("name");
  const hasStudentId = formData.has("studentId");
  const hasPhoto = formData.has("photo");
  const hasSpecs = formData.has("specializations");
  const hasDesignation = formData.has("designation") || formData.has("position");
  const hasDomain = formData.has("domain");
  const hasGithub = formData.has("github");
  const hasLinkedin = formData.has("linkedin");
  const hasPortfolio = formData.has("portfolio");
  const hasEmail = formData.has("email");

  const rawName = str(formData, "name");
  const rawStudentId = str(formData, "studentId");
  const rawPhoto = str(formData, "photo");
  const rawSpecs = str(formData, "specializations");
  const rawDesignation = str(formData, "designation") || str(formData, "position");
  const rawDomain = str(formData, "domain");
  const rawGithub = str(formData, "github");
  const rawLinkedin = str(formData, "linkedin");
  const rawPortfolio = str(formData, "portfolio");
  const rawEmail = str(formData, "email");

  const parsed = teamMemberUpdateApiSchema.safeParse({
    name: hasName ? (rawName || undefined) : undefined,
    studentId: hasStudentId ? (rawStudentId !== "" ? rawStudentId : null) : undefined,
    photo: hasPhoto ? (rawPhoto !== "" ? rawPhoto : null) : undefined,
    batch: rawBatch ? Number(rawBatch) : undefined,
    designation: hasDesignation ? (rawDesignation !== "" ? rawDesignation : null) : undefined,
    domain: hasDomain ? (rawDomain !== "" ? rawDomain : null) : undefined,
    specializations: hasSpecs ? (rawSpecs !== "" ? rawSpecs : []) : undefined,
    github: hasGithub ? (rawGithub !== "" ? rawGithub : null) : undefined,
    linkedin: hasLinkedin ? (rawLinkedin !== "" ? rawLinkedin : null) : undefined,
    portfolio: hasPortfolio ? (rawPortfolio !== "" ? rawPortfolio : null) : undefined,
    email: hasEmail ? (rawEmail !== "" ? rawEmail : null) : undefined,
    displayOrder: rawOrder ? Number(rawOrder) : undefined,
  });

  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) };

  const { specializations, ...memberFields } = parsed.data;

  await prisma.$transaction(async (tx) => {
    if (specializations !== undefined) {
      const uniqueSpecs = Array.from(new Set(specializations));
      await tx.memberSpecialization.deleteMany({
        where: { teamMemberId: id },
      });
      if (uniqueSpecs.length > 0) {
        await tx.memberSpecialization.createMany({
          data: uniqueSpecs.map((name) => ({ teamMemberId: id, name })),
        });
      }
    }

    if (Object.keys(memberFields).length > 0) {
      const updateData: Record<string, unknown> = { ...memberFields };
      if (memberFields.designation !== undefined) {
        updateData.position = memberFields.designation;
      }
      if (memberFields.displayOrder !== undefined) {
        updateData.order = memberFields.displayOrder;
      }
      await tx.teamMember.update({
        where: { id },
        data: updateData,
      });
    }
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
