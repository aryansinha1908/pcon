import Link from "next/link";
import { requirePageRole } from "@/lib/auth-guards";
import { formatDate } from "@/lib/format";
import { deleteBlogAction, togglePublishedAction, toggleFeaturedAction, deleteCategoryAction, deleteAuthorAction } from "../../_actions/blogs";
import { ActionButton } from "../../_components/action-button";
import { PageHeader } from "../../_components/page-header";
import { getBlogCategories, getBlogAuthors, getAllBlogsAdmin } from "@/lib/blogs-db";

export const metadata = { title: "Blogs & Content" };

export default async function BlogsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requirePageRole("ADMIN");
  const { tab = "blogs" } = await searchParams;

  const [blogs, categories, authors] = await Promise.all([
    getAllBlogsAdmin(),
    getBlogCategories(),
    getBlogAuthors(),
  ]);

  return (
    <>
      <PageHeader eyebrow="03 / BLOGS & ARTICLES" title="Blog Manager">
        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/admin/blogs/new" className="adm-btn adm-btn--primary">
            + New blog post
          </Link>
          <Link href="/blogs" target="_blank" className="adm-btn adm-btn--ghost">
            View public blog ↗
          </Link>
        </div>
      </PageHeader>

      {/* Tabs */}
      <div className="adm-tabs" role="tablist" style={{ alignSelf: "flex-start", marginBottom: "8px" }}>
        <Link
          href="/admin/blogs?tab=blogs"
          className="adm-btn"
          style={{
            background: tab === "blogs" ? "rgb(112 227 199 / 14%)" : "transparent",
            color: tab === "blogs" ? "var(--mint)" : "var(--adm-muted)",
            border: 0,
            borderRadius: 0,
            minHeight: "36px",
          }}
        >
          Articles ({blogs.length})
        </Link>
        <Link
          href="/admin/blogs?tab=categories"
          className="adm-btn"
          style={{
            background: tab === "categories" ? "rgb(112 227 199 / 14%)" : "transparent",
            color: tab === "categories" ? "var(--mint)" : "var(--adm-muted)",
            border: 0,
            borderRadius: 0,
            minHeight: "36px",
          }}
        >
          Categories ({categories.length})
        </Link>
        <Link
          href="/admin/blogs?tab=authors"
          className="adm-btn"
          style={{
            background: tab === "authors" ? "rgb(112 227 199 / 14%)" : "transparent",
            color: tab === "authors" ? "var(--mint)" : "var(--adm-muted)",
            border: 0,
            borderRadius: 0,
            minHeight: "36px",
          }}
        >
          Authors ({authors.length})
        </Link>
      </div>

      {/* TAB 1: BLOGS */}
      {tab === "blogs" && (
        <>
          {blogs.length === 0 ? (
            <div className="adm-empty">
              <p>No blog posts found in the database.</p>
              <Link href="/admin/blogs/new" className="adm-btn adm-btn--primary">
                Write the first post
              </Link>
            </div>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th style={{ width: "60px" }}>Cover</th>
                    <th>Title & Excerpt</th>
                    <th>Category</th>
                    <th>Author</th>
                    <th>Status</th>
                    <th>Featured</th>
                    <th>Updated</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div
                          style={{
                            width: "56px",
                            height: "36px",
                            borderRadius: "4px",
                            overflow: "hidden",
                            background: `hsl(${b.category?.hue ?? 160}, 55%, 15%)`,
                            border: "1px solid var(--adm-line-strong)",
                            display: "grid",
                            placeItems: "center",
                          }}
                        >
                          {b.coverImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={b.coverImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <span style={{ fontSize: "10px", color: "var(--mint)", fontFamily: "var(--mono)" }}>ART</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <strong>{b.title}</strong>
                        <span className="adm-muted adm-block" style={{ fontSize: "12px", maxWidth: "420px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {b.excerpt}
                        </span>
                      </td>
                      <td>
                        <span className="adm-badge" style={{ borderColor: `hsl(${b.category?.hue ?? 160}, 60%, 40%)` }}>
                          {b.category?.name}
                        </span>
                      </td>
                      <td className="adm-muted">
                        <div>{b.author?.name}</div>
                        <small style={{ fontSize: "11px" }}>{b.author?.roleTitle}</small>
                      </td>
                      <td>
                        <span className={`adm-badge ${b.status === "published" ? "adm-badge--upcoming" : ""}`}>
                          {b.status === "published" ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td>
                        {b.isFeatured ? (
                          <span style={{ color: "#ffd700", fontWeight: "bold" }}>★ Featured</span>
                        ) : (
                          <ActionButton action={toggleFeaturedAction.bind(null, b.id, true)}>
                            Make Featured
                          </ActionButton>
                        )}
                      </td>
                      <td className="adm-muted">{formatDate(b.updatedAt)}</td>
                      <td className="adm-table__actions">
                        <Link href={`/admin/blogs/${b.id}/edit`} className="adm-btn adm-btn--ghost adm-btn--sm">
                          Edit
                        </Link>
                        <ActionButton action={togglePublishedAction.bind(null, b.id, b.status !== "published")}>
                          {b.status === "published" ? "Unpublish" : "Publish"}
                        </ActionButton>
                        <ActionButton
                          variant="danger"
                          confirmText={`Delete "${b.title}"? This cannot be undone.`}
                          action={deleteBlogAction.bind(null, b.id)}
                        >
                          Delete
                        </ActionButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* TAB 2: CATEGORIES */}
      {tab === "categories" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category Name</th>
                  <th>Slug</th>
                  <th>Cover Hue</th>
                  <th>Swatch</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td className="adm-muted">{c.id}</td>
                    <td><strong>{c.name}</strong></td>
                    <td className="adm-muted" style={{ fontFamily: "var(--mono)" }}>{c.slug}</td>
                    <td className="adm-muted">{c.hue}</td>
                    <td>
                      <div
                        style={{
                          width: "30px",
                          height: "18px",
                          borderRadius: "3px",
                          background: `hsl(${c.hue}, 70%, 50%)`,
                          boxShadow: `0 0 10px hsl(${c.hue}, 70%, 50%, 0.4)`,
                        }}
                      />
                    </td>
                    <td className="adm-table__actions">
                      <ActionButton
                        variant="danger"
                        confirmText={`Delete category "${c.name}"?`}
                        action={deleteCategoryAction.bind(null, c.id)}
                      >
                        Delete
                      </ActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUTHORS */}
      {tab === "authors" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Name</th>
                  <th>Role / Year</th>
                  <th>Bio</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {authors.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          background: "var(--mint)",
                          color: "#03100d",
                          display: "grid",
                          placeItems: "center",
                          fontWeight: 700,
                          fontSize: "12px",
                        }}
                      >
                        {a.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          a.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                    </td>
                    <td><strong>{a.name}</strong></td>
                    <td className="adm-muted">{a.roleTitle}</td>
                    <td className="adm-muted" style={{ fontSize: "12px", maxWidth: "400px" }}>{a.bio}</td>
                    <td className="adm-table__actions">
                      <ActionButton
                        variant="danger"
                        confirmText={`Delete author "${a.name}"?`}
                        action={deleteAuthorAction.bind(null, a.id)}
                      >
                        Delete
                      </ActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
