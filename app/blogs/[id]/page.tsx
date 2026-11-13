import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedBlogByIdOrSlug, getRelatedBlogs, getPublishedBlogs } from "@/lib/blogs-db";
import { BlogCover } from "@/components/blog-cover";
import { BlogMarkdown } from "@/components/blog-markdown";
import { ReadingProgressBar, CopyLinkButton } from "@/components/blog-detail-client";
import { BlogPostCard } from "@/components/blog-post-card";

export const revalidate = 60;

function getInitials(name: string): string {
  if (!name) return "PC";
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatPostDate(date: Date | string | null): string {
  if (!date) return "Recently";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export async function generateStaticParams() {
  const { posts } = await getPublishedBlogs();
  return posts.map((p) => ({ id: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPublishedBlogByIdOrSlug(id);

  if (!post || post.status !== "published") {
    return { title: "Blog not found" };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      images: post.coverImageUrl ? [{ url: post.coverImageUrl, alt: post.coverImageAlt || post.title }] : [],
    },
  };
}

export default async function BlogPostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPublishedBlogByIdOrSlug(id);

  if (!post || post.status !== "published") {
    notFound();
  }

  const related = await getRelatedBlogs(post.slug, post.categoryId, 3);
  const initials = getInitials(post.author.name);
  const dateStr = formatPostDate(post.publishedAt || post.createdAt);

  return (
    <>
      <ReadingProgressBar />

      <Link className="blog-back" href="/blogs">
        ← All posts
      </Link>

      <header className="blog-phead">
        <div className="blog-crumbs">
          <span className="blog-pill">{post.category.name}</span>
          <span>{post.readTimeMinutes} min read</span>
        </div>

        <h1>{post.title}</h1>

        <p className="blog-dek">{post.excerpt}</p>

        <div className="blog-by">
          <span className="blog-av ring" aria-hidden="true">
            {post.author.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.author.avatarUrl} alt="" />
            ) : (
              initials
            )}
          </span>
          <div className="blog-who">
            <small>Written by</small>
            <b>{post.author.name}</b>
            <span>{post.author.roleTitle}</span>
          </div>

          <div className="blog-act">
            <span className="blog-date">{dateStr}</span>
            <CopyLinkButton />
          </div>
        </div>
      </header>

      {/* 21:9 Cover banner */}
      <div className="blog-hcover">
        <BlogCover
          category={post.category}
          coverImageUrl={post.coverImageUrl}
          coverImageAlt={post.coverImageAlt || post.title}
        />
      </div>

      {/* Two column layout: Sticky author aside left, article prose right */}
      <div className="blog-pgrid">
        <aside className="blog-side">
          <div className="blog-acard">
            <span className="blog-av big ring" aria-hidden="true">
              {post.author.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.author.avatarUrl} alt="" />
              ) : (
                initials
              )}
            </span>
            <small>Written by</small>
            <b>{post.author.name}</b>
            <span className="role">{post.author.roleTitle}</span>
            <p>{post.author.bio || "Member of Programming Club, NIT Jamshedpur."}</p>
            <Link className="blog-more-by" href="/blogs">
              More from PCON ↗
            </Link>
          </div>
        </aside>

        {/* Article Column */}
        <BlogMarkdown content={post.content} />
      </div>

      {/* Bottom CTA Card */}
      <div className="blog-cta">
        <div>
          <h2>Have something to teach?</h2>
          <p>Every PCON post is written by a member. Pitch yours.</p>
        </div>
        <Link className="blog-join" href="/#community">
          Write for PCON ↗
        </Link>
      </div>

      {/* Keep Reading Grid */}
      {related.length > 0 && (
        <section className="blog-more">
          <h2>Keep reading</h2>
          <div className="blog-grid">
            {related.map((item) => (
              <BlogPostCard key={item.slug || item.id} post={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

