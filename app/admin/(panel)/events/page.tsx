import Link from "next/link";
import { requirePageRole } from "@/lib/auth-guards";
import { EVENT_RULE, eventCutoffDate, isHiddenOnSite } from "@/lib/events";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { deleteEvent } from "../../_actions/events";
import { ActionButton } from "../../_components/action-button";
import { PageHeader } from "../../_components/page-header";

export const metadata = { title: "Events" };

export default async function EventsAdminPage() {
  await requirePageRole("ADMIN");

  // Admins always see every event, including ones the public site hides.
  const events = await prisma.event.findMany({
    orderBy: { startDate: "desc" },
    include: { createdBy: { select: { name: true, email: true } } },
  });
  const now = new Date();
  const total = events.length;
  const hiddenCount = events.filter((e) => isHiddenOnSite(e.startDate, total, now)).length;

  return (
    <>
      <PageHeader eyebrow="02 / EVENTS" title="Events">
        <Link href="/admin/events/new" className="adm-btn adm-btn--primary">
          Add event
        </Link>
      </PageHeader>

      <p className="adm-rule">
        <strong>Display rule:</strong> once there are more than {EVENT_RULE.maxBeforeCutoff} events, events that
        started before {formatDate(eventCutoffDate(now))} ({EVENT_RULE.cutoffYears} years ago) are hidden on the public
        site. {total} event{total === 1 ? "" : "s"} in total
        {hiddenCount > 0 ? `, ${hiddenCount} currently hidden.` : ", none hidden."}
      </p>

      {events.length === 0 ? (
        <div className="adm-empty">
          <p>No events yet.</p>
          <Link href="/admin/events/new" className="adm-btn adm-btn--primary">
            Add the first event
          </Link>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>When (IST)</th>
                <th>Status</th>
                <th>Added by</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {events.map((e) => {
                const hidden = isHiddenOnSite(e.startDate, total, now);
                const status = e.endDate < now ? "Past" : e.startDate <= now ? "Ongoing" : "Upcoming";
                return (
                  <tr key={e.id} data-dim={hidden ? "" : undefined}>
                    <td data-col="Event">
                      <strong>{e.title}</strong>
                      {e.location && <span className="adm-muted adm-block">{e.location}</span>}
                    </td>
                    <td data-col="When (IST)">
                      {formatDate(e.startDate, true)}
                      <span className="adm-muted adm-block">to {formatDate(e.endDate, true)}</span>
                    </td>
                    <td data-col="Status">
                      <span className={`adm-badge adm-badge--${status.toLowerCase()}`}>{status}</span>
                      {hidden && <span className="adm-badge adm-badge--hidden" title="Hidden by the display rule">Hidden on site</span>}
                    </td>
                    <td data-col="Added by" className="adm-muted">{e.createdBy?.name ?? e.createdBy?.email ?? "—"}</td>
                    <td className="adm-table__actions">
                      <Link href={`/admin/events/${e.id}/edit`} className="adm-btn adm-btn--ghost adm-btn--sm">
                        Edit
                      </Link>
                      <ActionButton
                        variant="danger"
                        confirmText={`Delete "${e.title}"? This can't be undone.`}
                        action={deleteEvent.bind(null, e.id)}
                      >
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
