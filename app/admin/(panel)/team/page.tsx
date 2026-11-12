import { requirePageRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roles";
import { PageHeader } from "../../_components/page-header";
import { TeamAddForm, TeamRow, type TeamRowData } from "../../_components/team-forms";

export const metadata = { title: "Team" };

export default async function TeamAdminPage() {
  await requirePageRole("ADMIN");

  const members = await prisma.teamMember
    .findMany({
      orderBy: [{ order: "asc" }, { batch: "asc" }, { createdAt: "asc" }],
      include: { user: { select: { name: true, email: true, role: true } } },
    })
    .catch(() => []);

  const rows: TeamRowData[] = members.map((m) => ({
    id: m.id,
    name: m.user.name,
    email: m.user.email,
    position: m.position,
    batch: m.batch,
    order: m.order,
    isActive: m.isActive,
    isAdmin: hasRole(m.user.role, "ADMIN"),
  }));
  const current = rows.filter((r) => r.isActive);
  const alumni = rows.filter((r) => !r.isActive);

  return (
    <>
      <PageHeader eyebrow="04 / TEAM" title="Team" />
      <p className="adm-rule">
        This controls who appears on the members page. It&apos;s separate from admin access: moving someone to alumni keeps
        their profile and blogs, and an owner removes their admin role from Users &amp; roles.
      </p>

      <section className="adm-card">
        <div className="adm-card__head">
          <h2>Add a member</h2>
        </div>
        <TeamAddForm defaultBatch={new Date().getFullYear() + 3} />
      </section>

      <section className="adm-card">
        <div className="adm-card__head">
          <h2>Current team</h2>
          <span className="adm-muted">{current.length}</span>
        </div>
        {current.length > 0 && <p className="adm-team-hint">Edit position · batch · display order (lower shows first)</p>}
        {current.length === 0 ? (
          <p className="adm-muted">No one on the team yet.</p>
        ) : (
          <ul className="adm-team">
            {current.map((m) => (
              <TeamRow key={m.id} member={m} />
            ))}
          </ul>
        )}
      </section>

      <section className="adm-card">
        <div className="adm-card__head">
          <h2>Alumni</h2>
          <span className="adm-muted">{alumni.length}</span>
        </div>
        {alumni.length === 0 ? (
          <p className="adm-muted">No alumni yet.</p>
        ) : (
          <ul className="adm-team">
            {alumni.map((m) => (
              <TeamRow key={m.id} member={m} />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
