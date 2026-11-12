import { requirePageRole } from "@/lib/auth-guards";
import { getBlogCategories, getBlogAuthors, addFallbackAuthor } from "@/lib/blogs-db";
import { createBlogAction } from "../../../_actions/blogs";
import { BlogForm } from "../../../_components/blog-form";
import { PageHeader } from "../../../_components/page-header";

export const metadata = { title: "New Blog Post" };

export default async function NewBlogPage() {
  const user = await requirePageRole("ADMIN");

  const [categories, authors] = await Promise.all([
    getBlogCategories(),
    getBlogAuthors(),
  ]);

  // Ensure logged-in user is an available Author and defaulted!
  let authorList = [...authors];
  const userName = user.name || "Yash Pandey";
  let userAuthor = authorList.find(
    (a) => a.memberId === user.id || a.name.toLowerCase() === userName.toLowerCase()
  );

  if (!userAuthor) {
    userAuthor = addFallbackAuthor({
      name: userName,
      roleTitle: "Club Admin",
      bio: "NIT Jamshedpur student and PCON member.",
      memberId: user.id,
    });
    authorList = [userAuthor, ...authors];
  }

  return (
    <>
      <PageHeader eyebrow="03 / BLOGS" title="New Blog Post" />
      <BlogForm
        action={createBlogAction}
        categories={categories}
        authors={authorList}
        defaults={{
          categoryId: categories[0]?.id ?? 1,
          authorId: userAuthor.id,
        }}
        submitLabel="Publish / Save post"
      />
    </>
  );
}
