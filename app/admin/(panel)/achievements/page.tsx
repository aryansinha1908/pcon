import Link from "next/link";
import { requirePageRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { deleteAchievement } from "../../_actions/achievements";
import { ActionButton } from "../../_components/action-button";
import { PageHeader } from "../../_components/page-header";

export const metadata = { title: "Achievements" };

export default async function AchievementsAdminPage() {
  await requirePageRole("ADMIN");
  const achievements = await prisma.achievement
    .findMany({ orderBy: [{ featured: "desc" }, { year: "desc" }, { createdAt: "desc" }] })
    .catch(() => []);

  return (
    <>
      <PageHeader eyebrow="06 / ACHIEVEMENTS" title="Achievements">
        <Link href="/admin/achievements/new" className="adm-btn adm-btn--primary">
          Add achievement
        </Link>
      </PageHeader>

      <p className="adm-rule">
        The club&apos;s results at outside competitions, shown on <Link href="/achievements">/achievements</Link>. Winners of
        PCON&apos;s own contests go in the <Link href="/admin/hall-of-fame">Hall of Fame</Link>.
      </p>

      {achievements.length === 0 ? (
        <div className="adm-empty">
          <p>No achievements yet.</p>
          <Link href="/admin/achievements/new" className="adm-btn adm-btn--primary">
            Add the first achievement
          </Link>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th aria-label="Photo" />
                <th>Achievement</th>
                <th>Year</th>
                <th>Result</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {achievements.map((a) => (
                <tr key={a.id}>
                  <td data-col="Photo">
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin-entered image URL */}
                    {a.imageUrl ? <img className="adm-thumb" src={a.imageUrl} alt="" /> : <span className="adm-muted">—</span>}
                  </td>
                  <td data-col="Achievement">
                    <strong>{a.title}</strong>
                    <span className="adm-muted adm-block">{a.organiser} · {a.kind}</span>
                  </td>
                  <td data-col="Year">{a.year}</td>
                  <td data-col="Result">
                    <span className="adm-badge">{a.result}</span>
                    {a.featured && <span className="adm-badge adm-badge--featured">Spotlight</span>}
                  </td>
                  <td className="adm-table__actions">
                    <Link href={`/admin/achievements/${a.id}/edit`} className="adm-btn adm-btn--ghost adm-btn--sm">
                      Edit
                    </Link>
                    <ActionButton variant="danger" confirmText={`Delete "${a.title}"? This can't be undone.`} action={deleteAchievement.bind(null, a.id)}>
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
  );
}
