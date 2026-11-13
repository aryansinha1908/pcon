import Link from "next/link";
import { requirePageRole } from "@/lib/auth-guards";
import { formatAchievementDate } from "@/lib/hall-of-fame";
import { prisma } from "@/lib/prisma";
import { deleteFameEntry } from "../../_actions/hall-of-fame";
import { ActionButton } from "../../_components/action-button";
import { PageHeader } from "../../_components/page-header";

export const metadata = { title: "Hall of Fame" };

export default async function HallOfFameAdminPage() {
  await requirePageRole("ADMIN");
  const entries = await prisma.hallOfFameEntry
    .findMany({
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      include: { placements: { orderBy: [{ rank: "asc" }, { order: "asc" }] } },
    })
    .catch(() => []);

  return (
    <>
      <PageHeader eyebrow="07 / HALL OF FAME" title="Hall of Fame">
        <Link href="/admin/hall-of-fame/new" className="adm-btn adm-btn--primary">
          Add results
        </Link>
      </PageHeader>

      <p className="adm-rule">
        Winners of events the club ran, shown on <Link href="/hall-of-fame">/hall-of-fame</Link>. The newest entry gets the big
        podium at the top.
      </p>

      {entries.length === 0 ? (
        <div className="adm-empty">
          <p>No results yet.</p>
          <Link href="/admin/hall-of-fame/new" className="adm-btn adm-btn--primary">
            Add the first results
          </Link>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Held on</th>
                <th>Winner</th>
                <th>Places</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const winner = e.placements.find((p) => p.rank === 1);
                const podium = e.placements.filter((p) => p.rank !== null).length;
                const mentions = e.placements.length - podium;
                return (
                  <tr key={e.id}>
                    <td data-col="Event">
                      <strong>{e.event}</strong>
                      <span className="adm-muted adm-block">{e.kind}</span>
                    </td>
                    <td data-col="Held on">{formatAchievementDate(e.date.toISOString().slice(0, 10))}</td>
                    <td data-col="Winner">
                      {winner?.name ?? "—"}
                      {winner?.roll && <span className="adm-muted adm-block">{winner.roll}</span>}
                    </td>
                    <td data-col="Places" className="adm-muted">
                      {podium} on podium{mentions ? `, ${mentions} mention${mentions === 1 ? "" : "s"}` : ""}
                    </td>
                    <td className="adm-table__actions">
                      <Link href={`/admin/hall-of-fame/${e.id}/edit`} className="adm-btn adm-btn--ghost adm-btn--sm">
                        Edit
                      </Link>
                      <ActionButton variant="danger" confirmText={`Delete the results for "${e.event}"? This can't be undone.`} action={deleteFameEntry.bind(null, e.id)}>
                        Delete
                      </ActionButton>
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
