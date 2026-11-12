import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { updateBlog } from "../../../../_actions/blogs";
import { BlogForm } from "../../../../_components/blog-form";
import { PageHeader } from "../../../../_components/page-header";

export const metadata = { title: "Edit blog" };

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  // No role needed beyond being signed in: an author keeps control of their own
  // blogs even after they stop being an admin.
  const user = await requireUser();
  const { id } = await params;
  const blog = await prisma.blog.findUnique({ where: { id } });
  if (!blog) notFound();
  if (blog.authorId !== user.id) redirect("/admin/blogs?denied=1");

  return (
    <>
      <PageHeader eyebrow="03 / BLOGS" title="Edit blog" />
      <BlogForm
        action={updateBlog.bind(null, blog.id)}
        submitLabel="Save changes"
        defaults={{
          title: blog.title,
          summary: blog.summary ?? "",
          content: blog.content,
          tags: blog.tags.join(", "),
          published: blog.published,
        }}
      />
    </>
  );
}
