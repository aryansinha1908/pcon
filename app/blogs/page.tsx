import { Suspense } from "react";
import { getBlogCategories, getPublishedBlogs } from "@/lib/blogs-db";
import { BlogFilterChips } from "@/components/blog-filter-chips";
import { BlogPostCard, FeaturedBlogCard } from "@/components/blog-post-card";

export const dynamic = "force-dynamic";

export default async function BlogListingPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category = "all" } = await searchParams;
  const isAll = !category || category.toLowerCase() === "all";

  const [categories, { posts, featuredPost }] = await Promise.all([
    getBlogCategories(),
    getPublishedBlogs(isAll ? undefined : category),
  ]);

  // Featured post logic matching the reference:
  // If on "All", use the featured post (or first post) as the hero card, and the rest in grid
  const heroPost = isAll ? featuredPost || posts[0] || null : null;
  let gridPosts = posts;

  if (heroPost && isAll) {
    gridPosts = posts.filter((p) => p.id !== heroPost!.id);
  }

  return (
    <>
      <section className="blog-hero">
        <span className="blog-tag">THE PCON BLOG</span>
        <h1>
          Ideas worth <span>shipping.</span>
        </h1>
        <p className="blog-lede">
          Tutorials, deep dives and lessons learned, written by the students of NIT Jamshedpur.
        </p>
      </section>

      <Suspense fallback={null}>
        <BlogFilterChips categories={categories} activeCategorySlug={category} />
      </Suspense>

      {/* Featured post (only displayed on "All" view) */}
      {heroPost && <FeaturedBlogCard post={heroPost} />}

      {/* Post Grid */}
      <div className="blog-grid">
        {gridPosts.length > 0 ? (
          gridPosts.map((post) => <BlogPostCard key={post.slug || post.id} post={post} />)
        ) : (
          <p className="blog-empty">
            No posts in this topic yet. Want to write the first one?
          </p>
        )}
      </div>
    </>
  );
}
