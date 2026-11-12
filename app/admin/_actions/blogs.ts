"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import {
  blogSchema,
  blogCategorySchema,
  blogAuthorSchema,
  fieldErrorsOf,
  type FormState,
} from "@/lib/validation";
import {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  updateAuthorAvatar,
  getFallbackPosts,
} from "@/lib/blogs-db";
import { str, toFormError } from "./shared";

function refresh(slug?: string) {
  revalidatePath("/admin/blogs");
  revalidatePath("/admin");
  revalidatePath("/blogs");
  if (slug) {
    revalidatePath(`/blogs/${slug}`);
  }
}

/** Any admin can create a blog */
export async function createBlogAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }

  const raw = {
    title: str(formData, "title"),
    slug: str(formData, "slug"),
    excerpt: str(formData, "excerpt"),
    content: str(formData, "content"),
    coverImageUrl: str(formData, "coverImageUrl"),
    coverImageAlt: str(formData, "coverImageAlt"),
    categoryId: Number(formData.get("categoryId")),
    authorId: Number(formData.get("authorId")),
    status: str(formData, "status") || (formData.get("published") === "on" ? "published" : "draft"),
    isFeatured: formData.get("isFeatured") === "on" || formData.get("isFeatured") === "true",
  };

  const parsed = blogSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsOf(parsed.error) };
  }

  try {
    const post = await createBlogPost(parsed.data);
    const authorAvatarUrl = str(formData, "authorAvatarUrl");
    if (authorAvatarUrl) {
      await updateAuthorAvatar(parsed.data.authorId, authorAvatarUrl);
    }
    refresh(post.slug);
  } catch (err) {
    return { error: `Failed to create blog: ${(err as Error).message}` };
  }

  redirect("/admin/blogs");
}

/** Any admin can update a blog */
export async function updateBlogAction(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }

  const raw = {
    title: str(formData, "title"),
    slug: str(formData, "slug"),
    excerpt: str(formData, "excerpt"),
    content: str(formData, "content"),
    coverImageUrl: str(formData, "coverImageUrl"),
    coverImageAlt: str(formData, "coverImageAlt"),
    categoryId: Number(formData.get("categoryId")),
    authorId: Number(formData.get("authorId")),
    status: str(formData, "status") || (formData.get("published") === "on" ? "published" : "draft"),
    isFeatured: formData.get("isFeatured") === "on" || formData.get("isFeatured") === "true",
  };

  const parsed = blogSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsOf(parsed.error) };
  }

  try {
    const post = await updateBlogPost(id, parsed.data);
    const authorAvatarUrl = str(formData, "authorAvatarUrl");
    if (authorAvatarUrl) {
      await updateAuthorAvatar(parsed.data.authorId, authorAvatarUrl);
    }
    refresh(post.slug);
  } catch (err) {
    return { error: `Failed to update blog: ${(err as Error).message}` };
  }

  redirect("/admin/blogs");
}

/** Any admin can delete a blog */
export async function deleteBlogAction(id: number): Promise<FormState> {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }

  try {
    const blog = await prisma.blog.findUnique({ where: { id } }).catch(() => null);
    await deleteBlogPost(id);
    refresh(blog?.slug);
    return { ok: "Blog post deleted." };
  } catch (err) {
    return { error: `Failed to delete blog: ${(err as Error).message}` };
  }
}

/** Toggle featured post (only ONE featured post at a time) */
export async function toggleFeaturedAction(id: number, isFeatured: boolean): Promise<FormState> {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }

  try {
    if (isFeatured) {
      await prisma.blog.updateMany({
        where: { isFeatured: true, id: { not: id } },
        data: { isFeatured: false },
      });
    }

    const post = await prisma.blog.update({
      where: { id },
      data: { isFeatured },
    });

    refresh(post.slug);
    return { ok: isFeatured ? "Post set as featured." : "Post unfeatured." };
  } catch {
    // In-memory fallback
    const posts = getFallbackPosts();
    if (isFeatured) {
      posts.forEach((p) => {
        if (p.id !== id) p.isFeatured = false;
      });
    }
    const p = posts.find((p) => p.id === id);
    if (p) {
      p.isFeatured = isFeatured;
      refresh(p.slug);
      return { ok: isFeatured ? "Post set as featured." : "Post unfeatured." };
    }
    return { error: "Failed to toggle featured status." };
  }
}

/** Toggle publish status */
export async function togglePublishedAction(id: number, publish: boolean): Promise<FormState> {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }

  try {
    const post = await prisma.blog.update({
      where: { id },
      data: {
        status: publish ? "published" : "draft",
        publishedAt: publish ? new Date() : undefined,
      },
    });

    refresh(post.slug);
    return { ok: publish ? "Post published." : "Post moved to drafts." };
  } catch {
    // In-memory fallback
    const posts = getFallbackPosts();
    const p = posts.find((p) => p.id === id);
    if (p) {
      p.status = publish ? "published" : "draft";
      if (publish && !p.publishedAt) p.publishedAt = new Date();
      refresh(p.slug);
      return { ok: publish ? "Post published." : "Post moved to drafts." };
    }
    return { error: "Failed to toggle published status." };
  }
}

/** Create category action */
export async function createCategoryAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }

  const raw = {
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    hue: Number(formData.get("hue")) || 160,
  };

  const parsed = blogCategorySchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsOf(parsed.error) };
  }

  try {
    const cat = await prisma.blogCategory.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug || parsed.data.name.toLowerCase().replace(/\s+/g, "-"),
        hue: parsed.data.hue,
      },
    });
    refresh();
    return { ok: "Category created.", data: cat };
  } catch {
    const { addFallbackCategory } = await import("@/lib/blogs-db");
    const fallbackCat = addFallbackCategory({
      name: parsed.data.name,
      slug: parsed.data.slug || parsed.data.name.toLowerCase().replace(/\s+/g, "-"),
      hue: parsed.data.hue,
    });
    refresh();
    return { ok: "Category created.", data: fallbackCat };
  }
}

/** Delete category action */
export async function deleteCategoryAction(id: number): Promise<FormState> {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }

  try {
    const count = await prisma.blog.count({ where: { categoryId: id } });
    if (count > 0) {
      return { error: `Cannot delete: category has ${count} assigned posts.` };
    }
    await prisma.blogCategory.delete({ where: { id } });
    refresh();
    return { ok: "Category removed." };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

/** Create author action */
export async function createAuthorAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }

  const raw = {
    name: str(formData, "name"),
    roleTitle: str(formData, "roleTitle"),
    bio: str(formData, "bio"),
    avatarUrl: str(formData, "avatarUrl"),
  };

  const parsed = blogAuthorSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsOf(parsed.error) };
  }

  try {
    const author = await prisma.blogAuthor.create({
      data: {
        name: parsed.data.name,
        roleTitle: parsed.data.roleTitle,
        bio: parsed.data.bio,
        avatarUrl: parsed.data.avatarUrl || null,
      },
    });
    refresh();
    return { ok: "Author added.", data: author };
  } catch {
    const { addFallbackAuthor } = await import("@/lib/blogs-db");
    const fallbackAuthor = addFallbackAuthor({
      name: parsed.data.name,
      roleTitle: parsed.data.roleTitle,
      bio: parsed.data.bio,
      avatarUrl: parsed.data.avatarUrl || null,
    });
    refresh();
    return { ok: "Author added.", data: fallbackAuthor };
  }
}

/** Delete author action */
export async function deleteAuthorAction(id: number): Promise<FormState> {
  try {
    await requireRole("ADMIN");
  } catch (e) {
    return toFormError(e);
  }

  try {
    const count = await prisma.blog.count({ where: { authorId: id } });
    if (count > 0) {
      return { error: `Cannot delete: author has written ${count} posts.` };
    }
    await prisma.blogAuthor.delete({ where: { id } });
    refresh();
    return { ok: "Author removed." };
  } catch (err) {
    return { error: (err as Error).message };
  }
}
