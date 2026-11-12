"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBlogAuthor, requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { blogSchema, fieldErrorsOf, type FormState } from "@/lib/validation";
import { str, toFormError } from "./shared";

function parse(formData: FormData) {
  return blogSchema.safeParse({
    title: str(formData, "title"),
    summary: str(formData, "summary"),
    content: str(formData, "content"),
    tags: str(formData, "tags"),
    published: str(formData, "published"),
  });
}

function refresh() {
  revalidatePath("/admin/blogs");
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

/** Any admin (or owner) can create a blog. */
export async function createBlog(_prev: FormState, formData: FormData): Promise<FormState> {
  let user;
  try {
    user = await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) };

  await prisma.blog.create({ data: { ...parsed.data, authorId: user.id } });
  refresh();
  redirect("/admin/blogs");
}

/** Only the author can edit — admins and owners cannot edit someone else's blog. */
export async function updateBlog(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await requireBlogAuthor(id);
  } catch (e) {
    return toFormError(e);
  }
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) };

  await prisma.blog.update({ where: { id }, data: parsed.data });
  refresh();
  redirect("/admin/blogs");
}

/** Only the author can delete. */
export async function deleteBlog(id: string): Promise<FormState> {
  try {
    await requireBlogAuthor(id);
  } catch (e) {
    return toFormError(e);
  }
  await prisma.blog.delete({ where: { id } });
  refresh();
  return { ok: "Blog deleted." };
}

/** Only the author can publish or unpublish. */
export async function setBlogPublished(id: string, published: boolean): Promise<FormState> {
  try {
    await requireBlogAuthor(id);
  } catch (e) {
    return toFormError(e);
  }
  await prisma.blog.update({ where: { id }, data: { published } });
  refresh();
  return { ok: published ? "Published." : "Moved to drafts." };
}
