"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface CategoryChip {
  name: string;
  slug: string;
}

export function BlogFilterChips({
  categories,
  activeCategorySlug,
}: {
  categories: CategoryChip[];
  activeCategorySlug?: string;
}) {
  const searchParams = useSearchParams();
  const current = searchParams.get("category") || activeCategorySlug || "all";

  const allItems = [{ name: "All", slug: "all" }, ...categories];

  return (
    <div className="blog-filters" role="group" aria-label="Filter by topic">
      {allItems.map((item) => {
        const isCurrent =
          item.slug === "all"
            ? current === "all" || !current || current === "All"
            : current.toLowerCase() === item.slug.toLowerCase() ||
              current.toLowerCase() === item.name.toLowerCase();

        const href = item.slug === "all" ? "/blogs" : `/blogs?category=${item.slug}`;

        return (
          <Link
            key={item.slug}
            href={href}
            className={`blog-chip ${isCurrent ? "active" : ""}`}
            aria-pressed={isCurrent}
            scroll={false}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}
