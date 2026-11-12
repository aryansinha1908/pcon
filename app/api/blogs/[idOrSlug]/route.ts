import { NextRequest, NextResponse } from "next/server";
import { getPublishedBlogByIdOrSlug } from "@/lib/blogs-db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  try {
    const { idOrSlug } = await params;
    const blog = await getPublishedBlogByIdOrSlug(idOrSlug);

    if (!blog || blog.status !== "published") {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch blog post", details: (error as Error).message },
      { status: 500 }
    );
  }
}

