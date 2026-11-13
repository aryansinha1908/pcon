import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/api-guard";
import { prisma } from "@/lib/prisma";
import { blogSchema, fieldErrorsOf } from "@/lib/validation";
import { deleteBlogPost, updateBlogPost } from "@/lib/blogs-db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  try {
    const { id } = await params;
    const blogId = parseInt(id, 10);
    if (isNaN(blogId)) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
    }

    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      include: {
        category: true,
        author: true,
      },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch blog", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  try {
    const { id } = await params;
    const blogId = parseInt(id, 10);
    if (isNaN(blogId)) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = blogSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", fieldErrors: fieldErrorsOf(parsed.error) },
        { status: 400 }
      );
    }

    const updated = await updateBlogPost(blogId, parsed.data);

    revalidatePath("/blogs");
    revalidatePath(`/blogs/${updated.slug}`);
    revalidatePath(`/blogs/${updated.id}`);
    revalidatePath("/admin/blogs");

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update blog post", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  try {
    const { id } = await params;
    const blogId = parseInt(id, 10);
    if (isNaN(blogId)) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
    }

    const blog = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    await deleteBlogPost(blogId);

    revalidatePath("/blogs");
    revalidatePath(`/blogs/${blog.slug}`);
    revalidatePath("/admin/blogs");

    return NextResponse.json({ ok: true, message: "Blog post deleted." });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete blog post", details: (error as Error).message },
      { status: 500 }
    );
  }
}

