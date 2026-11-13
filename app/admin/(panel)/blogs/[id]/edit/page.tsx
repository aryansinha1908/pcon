import { notFound } from "next/navigation";
import { requirePageRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { getBlogCategories, getBlogAuthors } from "@/lib/blogs-db";
import { updateBlogAction } from "../../../../_actions/blogs";
import { BlogForm } from "../../../../_components/blog-form";
import { PageHeader } from "../../../../_components/page-header";

export const metadata = { title: "Edit Blog Post" };

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePageRole("ADMIN");
  const { id } = await params;
  const blogId = parseInt(id, 10);

  if (isNaN(blogId)) notFound();

  const [blog, categories, authors] = await Promise.all([
    prisma.blog.findUnique({
      where: { id: blogId },
      include: { category: true, author: true },
    }),
    getBlogCategories(),
    getBlogAuthors(),
  ]);

  if (!blog) notFound();

  return (
    <>
      <PageHeader eyebrow="03 / BLOGS" title={`Edit: ${blog.title}`} />
      <BlogForm
        action={updateBlogAction.bind(null, blog.id)}
        defaults={{
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt,
          content: blog.content,
          coverImageUrl: blog.coverImageUrl || "",
          coverImageAlt: blog.coverImageAlt || "",
          categoryId: blog.categoryId,
          authorId: blog.authorId,
          status: blog.status as "draft" | "published",
          isFeatured: blog.isFeatured,
        }}
        categories={categories}
        authors={authors}
        submitLabel="Save changes"
      />
    </>
  );
}
