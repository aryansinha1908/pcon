"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { fromSiteLocal } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { eventSchema, fieldErrorsOf, type FormState } from "@/lib/validation";
import { str, toFormError } from "./shared";

function parse(formData: FormData) {
  return eventSchema.safeParse({
    title: str(formData, "title"),
    description: str(formData, "description"),
    location: str(formData, "location"),
    posterUrl: str(formData, "posterUrl"),
    registrationUrl: str(formData, "registrationUrl"),
    startDate: fromSiteLocal(str(formData, "startDate")),
    endDate: fromSiteLocal(str(formData, "endDate")),
  });
}

function refresh() {
  revalidatePath("/admin/events");
  revalidatePath("/admin");
  revalidatePath("/", "layout"); // public pages that list events, once they exist
}

export async function createEvent(_prev: FormState, formData: FormData): Promise<FormState> {
  let user;
  try {
    user = await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) };

  await prisma.event.create({ data: { ...parsed.data, createdById: user.id } });
  refresh();
  redirect("/admin/events");
}

export async function updateEvent(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) };

  const result = await prisma.event.updateMany({ where: { id }, data: parsed.data });
  if (result.count === 0) return { error: "This event no longer exists." };
  refresh();
  redirect("/admin/events");
}

export async function deleteEvent(id: string): Promise<FormState> {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }
  await prisma.event.deleteMany({ where: { id } });
  refresh();
  return { ok: "Event deleted." };
}
