import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/api-guard";
import { prisma } from "@/lib/prisma";
import { blogCategorySchema, fieldErrorsOf } from "@/lib/validation";
import { slugify } from "@/lib/blog-utils";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { blogs: true } },
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch categories", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const parsed = blogCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", fieldErrors: fieldErrorsOf(parsed.error) },
        { status: 400 }
      );
    }

    const slug = parsed.data.slug || slugify(parsed.data.name);

    try {
      const created = await prisma.blogCategory.create({
        data: {
          name: parsed.data.name,
          slug,
          hue: parsed.data.hue,
        },
      });

      revalidatePath("/blogs");
      revalidatePath("/admin/blogs");

      return NextResponse.json(created, { status: 201 });
    } catch {
      // If DB is offline, add to fallback store
      const { addFallbackCategory } = await import("@/lib/blogs-db");
      const fallbackItem = addFallbackCategory({
        name: parsed.data.name,
        slug,
        hue: parsed.data.hue,
      });

      revalidatePath("/blogs");
      revalidatePath("/admin/blogs");

      return NextResponse.json(fallbackItem, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create category", details: (error as Error).message },
      { status: 500 }
    );
  }
}

