import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/api-guard";
import { prisma } from "@/lib/prisma";
import { blogCategorySchema, fieldErrorsOf } from "@/lib/validation";
import { slugify } from "@/lib/blog-utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  try {
    const { id } = await params;
    const catId = parseInt(id, 10);
    if (isNaN(catId)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = blogCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", fieldErrors: fieldErrorsOf(parsed.error) },
        { status: 400 }
      );
    }

    const slug = parsed.data.slug || slugify(parsed.data.name);

    const updated = await prisma.blogCategory.update({
      where: { id: catId },
      data: {
        name: parsed.data.name,
        slug,
        hue: parsed.data.hue,
      },
    });

    revalidatePath("/blogs");
    revalidatePath("/admin/blogs");

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update category", details: (error as Error).message },
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
    const catId = parseInt(id, 10);
    if (isNaN(catId)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const count = await prisma.blog.count({ where: { categoryId: catId } });
    if (count > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${count} assigned blogs.` },
        { status: 400 }
      );
    }

    await prisma.blogCategory.delete({ where: { id: catId } });

    revalidatePath("/blogs");
    revalidatePath("/admin/blogs");

    return NextResponse.json({ ok: true, message: "Category deleted." });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete category", details: (error as Error).message },
      { status: 500 }
    );
  }
}

