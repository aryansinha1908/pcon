import Link from "next/link";
import { requireUser } from "@/lib/auth-guards";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roles";
import { PageHeader } from "../_components/page-header";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireUser();
  const { denied } = await searchParams;
  const isAdmin = hasRole(user.role, "ADMIN");
  const now = new Date();

  const [myBlogs, stats, upcoming] = await Promise.all([
    prisma.blog.findMany({
      where: isAdmin ? {} : { author: { memberId: user.id } },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, updatedAt: true },
    }).catch(() => []),
    isAdmin
      ? Promise.all([
          prisma.blog.count({ where: { status: "published" } }).catch(() => 0),
          prisma.blog.count({ where: { status: "draft" } }).catch(() => 0),
          prisma.event.count({ where: { endDate: { gte: now } } }).catch(() => 0),
          prisma.teamMember.count({ where: { isActive: true } }).catch(() => 0),
        ])
      : null,
    isAdmin
      ? prisma.event
          .findMany({
            where: { endDate: { gte: now } },
            orderBy: { startDate: "asc" },
            take: 5,
            select: { id: true, title: true, startDate: true, location: true },
          })
          .catch(() => [])
      : [],
  ]);

  const firstName = user.name?.split(" ")[0];

  return (
    <>
      <PageHeader eyebrow="01 / OVERVIEW" title={firstName ? `Hi, ${firstName}` : "Dashboard"} />

      {denied && (
        <p className="adm-notice adm-notice--error" role="alert">
          You don&apos;t have access to that page.
        </p>
      )}

      {stats && (
        <section className="adm-stats" aria-label="Site at a glance">
          <Stat label="Published blogs" value={stats[0]} href="/admin/blogs" />
          <Stat label="Drafts" value={stats[1]} href="/admin/blogs" />
          <Stat label="Upcoming events" value={stats[2]} href="/admin/events" />
          <Stat label="Current team" value={stats[3]} href="/admin/team" />
        </section>
      )}

      <div className="adm-grid-2">
        <section className="adm-card">
          <div className="adm-card__head">
            <h2>Your blogs</h2>
            {isAdmin && (
              <Link href="/admin/blogs/new" className="adm-btn adm-btn--primary adm-btn--sm">
                New blog
              </Link>
            )}
          </div>
          {myBlogs.length === 0 ? (
            <p className="adm-muted">You haven&apos;t written anything yet.</p>
          ) : (
            <ul className="adm-list">
              {myBlogs.map((b) => (
                <li key={b.id}>
                  <Link href={`/admin/blogs/${b.id}/edit`}>{b.title}</Link>
                  <span className="adm-muted">
                    {b.status === "published" ? "Published" : "Draft"} · {formatDate(b.updatedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {isAdmin && (
          <section className="adm-card">
            <div className="adm-card__head">
              <h2>Coming up</h2>
              <Link href="/admin/events/new" className="adm-btn adm-btn--ghost adm-btn--sm">
                Add event
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <p className="adm-muted">No upcoming events.</p>
            ) : (
              <ul className="adm-list">
                {upcoming.map((e) => (
                  <li key={e.id}>
                    <Link href={`/admin/events/${e.id}/edit`}>{e.title}</Link>
                    <span className="adm-muted">
                      {formatDate(e.startDate, true)}
                      {e.location ? ` · ${e.location}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="adm-stat">
      <span className="adm-stat__value">{value}</span>
      <span className="adm-stat__label">{label}</span>
    </Link>
  );
}
