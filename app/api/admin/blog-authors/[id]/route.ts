import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/api-guard";
import { prisma } from "@/lib/prisma";
import { blogAuthorSchema, fieldErrorsOf } from "@/lib/validation";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  try {
    const { id } = await params;
    const authorId = parseInt(id, 10);
    if (isNaN(authorId)) {
      return NextResponse.json({ error: "Invalid author ID" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = blogAuthorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", fieldErrors: fieldErrorsOf(parsed.error) },
        { status: 400 }
      );
    }

    const updated = await prisma.blogAuthor.update({
      where: { id: authorId },
      data: {
        name: parsed.data.name,
        roleTitle: parsed.data.roleTitle,
        bio: parsed.data.bio,
        avatarUrl: parsed.data.avatarUrl || null,
        memberId: parsed.data.memberId || null,
      },
    });

    revalidatePath("/blogs");
    revalidatePath("/admin/blogs");

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update author", details: (error as Error).message },
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
    const authorId = parseInt(id, 10);
    if (isNaN(authorId)) {
      return NextResponse.json({ error: "Invalid author ID" }, { status: 400 });
    }

    const count = await prisma.blog.count({ where: { authorId } });
    if (count > 0) {
      return NextResponse.json(
        { error: `Cannot delete author with ${count} assigned blogs.` },
        { status: 400 }
      );
    }

    await prisma.blogAuthor.delete({ where: { id: authorId } });

    revalidatePath("/blogs");
    revalidatePath("/admin/blogs");

    return NextResponse.json({ ok: true, message: "Author deleted." });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete author", details: (error as Error).message },
      { status: 500 }
    );
  }
}

