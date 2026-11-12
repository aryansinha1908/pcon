import { NextRequest, NextResponse } from "next/server";
import { getPublishedBlogs } from "@/lib/blogs-db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = searchParams.has("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;

    const data = await getPublishedBlogs(category, limit, page);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch blogs", details: (error as Error).message },
      { status: 500 }
    );
  }
}

