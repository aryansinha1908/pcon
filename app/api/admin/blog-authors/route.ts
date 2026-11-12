import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/api-guard";
import { prisma } from "@/lib/prisma";
import { blogAuthorSchema, fieldErrorsOf } from "@/lib/validation";

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  try {
    const authors = await prisma.blogAuthor.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { blogs: true } },
      },
    });
    return NextResponse.json(authors);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch authors", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const parsed = blogAuthorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", fieldErrors: fieldErrorsOf(parsed.error) },
        { status: 400 }
      );
    }

    try {
      const created = await prisma.blogAuthor.create({
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

      return NextResponse.json(created, { status: 201 });
    } catch {
      // If DB is offline, add to fallback store
      const { addFallbackAuthor } = await import("@/lib/blogs-db");
      const fallbackAuthor = addFallbackAuthor({
        name: parsed.data.name,
        roleTitle: parsed.data.roleTitle,
        bio: parsed.data.bio,
        avatarUrl: parsed.data.avatarUrl || null,
        memberId: parsed.data.memberId || null,
      });

      revalidatePath("/blogs");
      revalidatePath("/admin/blogs");

      return NextResponse.json(fallbackAuthor, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create author", details: (error as Error).message },
      { status: 500 }
    );
  }
}

