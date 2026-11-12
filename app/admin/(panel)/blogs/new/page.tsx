import { requirePageRole } from "@/lib/auth-guards";
import { createBlog } from "../../../_actions/blogs";
import { BlogForm } from "../../../_components/blog-form";
import { PageHeader } from "../../../_components/page-header";

export const metadata = { title: "New blog" };

export default async function NewBlogPage() {
  await requirePageRole("ADMIN");
  return (
    <>
      <PageHeader eyebrow="03 / BLOGS" title="New blog" />
      <BlogForm action={createBlog} submitLabel="Save blog" />
    </>
  );
}
