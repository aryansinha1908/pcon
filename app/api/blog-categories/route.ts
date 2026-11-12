import { NextResponse } from "next/server";
import { getBlogCategories } from "@/lib/blogs-db";

export async function GET() {
  try {
    const categories = await getBlogCategories();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch blog categories", details: (error as Error).message },
      { status: 500 }
    );
  }
}

