import Link from "next/link";
import { requireUser } from "@/lib/auth-guards";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roles";
import { deleteBlog, setBlogPublished } from "../../_actions/blogs";
import { ActionButton } from "../../_components/action-button";
import { PageHeader } from "../../_components/page-header";

export const metadata = { title: "Blogs" };

export default async function BlogsAdminPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireUser();
  const { denied } = await searchParams;
  const isAdmin = hasRole(user.role, "ADMIN");

  // Admins see every blog (read-only for ones they didn't write); members see only their own.
  const blogs = await prisma.blog.findMany({
    where: isAdmin ? {} : { authorId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      tags: true,
      published: true,
      updatedAt: true,
      authorId: true,
      author: { select: { name: true, email: true } },
    },
  });

  return (
    <>
      <PageHeader eyebrow="03 / BLOGS" title={isAdmin ? "Blogs" : "My blogs"}>
        {isAdmin && (
          <Link href="/admin/blogs/new" className="adm-btn adm-btn--primary">
            New blog
          </Link>
        )}
      </PageHeader>

      {denied && (
        <p className="adm-notice adm-notice--error" role="alert">
          Only a blog&apos;s author can edit it.
        </p>
      )}
      <p className="adm-rule">Only the author of a blog can edit, publish or delete it.</p>

      {blogs.length === 0 ? (
        <div className="adm-empty">
          <p>No blogs yet.</p>
          {isAdmin && (
            <Link href="/admin/blogs/new" className="adm-btn adm-btn--primary">
              Write the first one
            </Link>
          )}
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Updated</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {blogs.map((b) => {
                const mine = b.authorId === user.id;
                return (
                  <tr key={b.id}>
                    <td>
                      <strong>{b.title}</strong>
                      {b.tags.length > 0 && <span className="adm-muted adm-block">{b.tags.map((t) => `#${t}`).join(" ")}</span>}
                    </td>
                    <td className="adm-muted">{mine ? "You" : (b.author.name ?? b.author.email)}</td>
                    <td>
                      <span className={`adm-badge ${b.published ? "adm-badge--upcoming" : ""}`}>{b.published ? "Published" : "Draft"}</span>
                    </td>
                    <td className="adm-muted">{formatDate(b.updatedAt)}</td>
                    <td className="adm-table__actions">
                      {mine ? (
                        <>
                          <Link href={`/admin/blogs/${b.id}/edit`} className="adm-btn adm-btn--ghost adm-btn--sm">
                            Edit
                          </Link>
                          <ActionButton action={setBlogPublished.bind(null, b.id, !b.published)}>
                            {b.published ? "Unpublish" : "Publish"}
                          </ActionButton>
                          <ActionButton
                            variant="danger"
                            confirmText={`Delete "${b.title}"? This can't be undone.`}
                            action={deleteBlog.bind(null, b.id)}
                          >
                            Delete
                          </ActionButton>
                        </>
                      ) : (
                        <span className="adm-muted adm-small">Author only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
