"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { slugify } from "@/lib/blog-utils";
import { prisma } from "@/lib/prisma";
import { achievementSchema, fieldErrorsOf, type FormState } from "@/lib/validation";
import { str, toFormError } from "./shared";

function parse(formData: FormData) {
  return achievementSchema.safeParse({
    title: str(formData, "title"),
    organiser: str(formData, "organiser"),
    year: str(formData, "year"),
    dates: str(formData, "dates"),
    kind: str(formData, "kind"),
    result: str(formData, "result"),
    tier: str(formData, "tier"),
    highlight: str(formData, "highlight"),
    imageUrl: str(formData, "imageUrl"),
    imageAlt: str(formData, "imageAlt"),
    featured: str(formData, "featured"),
  });
}

/** A slug from the title that no other achievement uses yet. */
async function uniqueSlug(title: string) {
  const base = slugify(title) || "achievement";
  for (let i = 1; ; i += 1) {
    const slug = i === 1 ? base : `${base}-${i}`;
    if (!(await prisma.achievement.findUnique({ where: { slug }, select: { id: true } }))) return slug;
  }
}

function refresh() {
  revalidatePath("/admin/achievements");
  revalidatePath("/achievements");
}

export async function createAchievement(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) };

  const slug = await uniqueSlug(parsed.data.title);
  // Only one achievement is spotlighted at a time.
  await prisma.$transaction([
    ...(parsed.data.featured ? [prisma.achievement.updateMany({ where: { featured: true }, data: { featured: false } })] : []),
    prisma.achievement.create({ data: { ...parsed.data, slug } }),
  ]);
  refresh();
  redirect("/admin/achievements");
}

export async function updateAchievement(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) };

  // Only one achievement is spotlighted at a time; nothing changes if this one is gone.
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.achievement.updateMany({ where: { id }, data: parsed.data });
    if (result.count === 0) return false;
    if (parsed.data.featured) await tx.achievement.updateMany({ where: { featured: true, NOT: { id } }, data: { featured: false } });
    return true;
  });
  if (!updated) return { error: "This achievement no longer exists." };
  refresh();
  redirect("/admin/achievements");
}

export async function deleteAchievement(id: string): Promise<FormState> {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }
  await prisma.achievement.deleteMany({ where: { id } });
  refresh();
  return { ok: "Achievement deleted." };
}
