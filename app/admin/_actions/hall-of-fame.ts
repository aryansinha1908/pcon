"use server";

import type { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { RANKS } from "@/lib/achievement-options";
import { requireRole } from "@/lib/auth-guards";
import { slugify } from "@/lib/blog-utils";
import { prisma } from "@/lib/prisma";
import { fieldErrorsOf, hallOfFameSchema, placementSchema, type FormState } from "@/lib/validation";
import { str, toFormError } from "./shared";

type Placement = z.infer<typeof placementSchema>;
type Parsed = { data: z.infer<typeof hallOfFameSchema> } | { fieldErrors: NonNullable<FormState["fieldErrors"]> };

const splitTeam = (value: string) => value.split(",").map((s) => s.trim()).filter(Boolean);

/**
 * Reads the form: the event fields, three podium rows (place1_name, place1_roll,
 * place1_team, …) and the mentions textarea, one per line as "Name | Roll | Award".
 * Errors come back keyed by the form field they belong to.
 */
function parse(formData: FormData): Parsed {
  const fieldErrors: NonNullable<FormState["fieldErrors"]> = {};

  const podium: Placement[] = [];
  for (const rank of RANKS) {
    const name = str(formData, `place${rank}_name`);
    const roll = str(formData, `place${rank}_roll`);
    const team = str(formData, `place${rank}_team`);
    if (!name.trim() && !roll.trim() && !team.trim()) continue;
    const parsed = placementSchema.safeParse({ rank, name, roll, team: splitTeam(team) });
    if (parsed.success) podium.push(parsed.data);
    else for (const [key, messages] of Object.entries(fieldErrorsOf(parsed.error) ?? {})) fieldErrors[`place${rank}_${key}`] = messages;
  }
  if (!podium.some((p) => p.rank === 1) && !fieldErrors.place1_name) fieldErrors.place1_name = ["Add the winner."];

  const mentions: Placement[] = [];
  const lines = str(formData, "mentions").split("\n").map((l) => l.trim()).filter(Boolean);
  lines.forEach((line, i) => {
    const [name = "", roll = "", award = ""] = line.split("|").map((part) => part.trim());
    const parsed = placementSchema.safeParse({ rank: null, name, roll, award });
    if (parsed.success) mentions.push(parsed.data);
    else {
      const first = Object.values(fieldErrorsOf(parsed.error) ?? {}).flat()[0];
      (fieldErrors.mentions ??= []).push(`Line ${i + 1}: ${first ?? "check this line."}`);
    }
  });

  const event = hallOfFameSchema.omit({ podium: true, mentions: true }).safeParse({
    event: str(formData, "event"),
    date: str(formData, "date"),
    kind: str(formData, "kind"),
    summary: str(formData, "summary"),
    link: str(formData, "link"),
  });
  if (!event.success) Object.assign(fieldErrors, fieldErrorsOf(event.error));
  if (lines.length > 20) fieldErrors.mentions = ["At most 20 special mentions."];
  if (!event.success || Object.keys(fieldErrors).length) return { fieldErrors };
  return { data: { ...event.data, podium, mentions } };
}

function placementRows(data: z.infer<typeof hallOfFameSchema>) {
  return [
    ...data.podium.map((p) => ({ rank: p.rank, name: p.name, roll: p.roll, team: p.team })),
    ...data.mentions.map((m, order) => ({ rank: null, name: m.name, roll: m.roll, award: m.award, team: m.team, order })),
  ];
}

const entryFields = (data: z.infer<typeof hallOfFameSchema>) => ({
  event: data.event,
  date: new Date(`${data.date}T00:00:00Z`),
  kind: data.kind,
  summary: data.summary ?? null,
  link: data.link ?? null,
});

async function uniqueSlug(event: string) {
  const base = slugify(event) || "event";
  for (let i = 1; ; i += 1) {
    const slug = i === 1 ? base : `${base}-${i}`;
    if (!(await prisma.hallOfFameEntry.findUnique({ where: { slug }, select: { id: true } }))) return slug;
  }
}

function refresh() {
  revalidatePath("/admin/hall-of-fame");
  revalidatePath("/hall-of-fame");
}

export async function createFameEntry(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }
  const result = parse(formData);
  if ("fieldErrors" in result) return { fieldErrors: result.fieldErrors };

  await prisma.hallOfFameEntry.create({
    data: { ...entryFields(result.data), slug: await uniqueSlug(result.data.event), placements: { create: placementRows(result.data) } },
  });
  refresh();
  redirect("/admin/hall-of-fame");
}

export async function updateFameEntry(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }
  const result = parse(formData);
  if ("fieldErrors" in result) return { fieldErrors: result.fieldErrors };

  // Replace the placements in one transaction, so the entry is never left half-edited.
  const updated = await prisma.$transaction(async (tx) => {
    const changed = await tx.hallOfFameEntry.updateMany({ where: { id }, data: entryFields(result.data) });
    if (changed.count === 0) return false;
    await tx.hallOfFamePlacement.deleteMany({ where: { entryId: id } });
    await tx.hallOfFamePlacement.createMany({ data: placementRows(result.data).map((row) => ({ ...row, entryId: id })) });
    return true;
  });
  if (!updated) return { error: "This entry no longer exists." };
  refresh();
  redirect("/admin/hall-of-fame");
}

export async function deleteFameEntry(id: string): Promise<FormState> {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }
  // Placements go with it (ON DELETE CASCADE).
  await prisma.hallOfFameEntry.deleteMany({ where: { id } });
  refresh();
  return { ok: "Entry deleted." };
}
