import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/api-guard";
import { prisma } from "@/lib/prisma";
import { blogSchema, fieldErrorsOf } from "@/lib/validation";
import { createBlogPost } from "@/lib/blogs-db";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        category: { select: { id: true, name: true, slug: true, hue: true } },
        author: { select: { id: true, name: true, roleTitle: true, bio: true, avatarUrl: true } },
      },
    });
    return NextResponse.json(blogs);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch admin blogs", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const parsed = blogSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", fieldErrors: fieldErrorsOf(parsed.error) },
        { status: 400 }
      );
    }

    const created = await createBlogPost(parsed.data);

    revalidatePath("/blogs");
    revalidatePath(`/blogs/${created.slug}`);
    revalidatePath("/admin/blogs");

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create blog post", details: (error as Error).message },
      { status: 500 }
    );
  }
}

