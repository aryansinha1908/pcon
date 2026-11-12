import Link from "next/link";
import { BlogCover } from "./blog-cover";
import type { BlogWithRelations } from "@/lib/blogs-db";

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

export function BlogPostCard({ post }: { post: BlogWithRelations }) {
  const initials = getInitials(post.author.name);

  return (
    <Link href={`/blogs/${post.slug || post.id}`} className="blog-card">
      <BlogCover
        category={post.category}
        coverImageUrl={post.coverImageUrl}
        coverImageAlt={post.coverImageAlt || post.title}
      />
      <div className="body">
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <div className="blog-meta">
          <span className="blog-av" aria-hidden="true">
            {post.author.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.author.avatarUrl} alt="" />
            ) : (
              initials
            )}
          </span>
          <span>
            {post.author.name} · {post.readTimeMinutes} min read
          </span>
        </div>
      </div>
    </Link>
  );
}

export function FeaturedBlogCard({ post }: { post: BlogWithRelations }) {
  const initials = getInitials(post.author.name);

  return (
    <Link href={`/blogs/${post.slug || post.id}`} className="blog-feature">
      <BlogCover
        category={post.category}
        coverImageUrl={post.coverImageUrl}
        coverImageAlt={post.coverImageAlt || post.title}
        categoryLabelPrefix="Featured"
      />
      <div className="body">
        <h2>{post.title}</h2>
        <p>{post.excerpt}</p>
        <div className="blog-meta">
          <span className="blog-av" aria-hidden="true">
            {post.author.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.author.avatarUrl} alt="" />
            ) : (
              initials
            )}
          </span>
          <span>
            {post.author.name} · {post.readTimeMinutes} min read
          </span>
        </div>
      </div>
    </Link>
  );
}

