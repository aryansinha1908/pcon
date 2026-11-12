import { requirePageRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roles";
import { PageHeader } from "../../_components/page-header";
import { TeamAddForm, TeamRow, type TeamRowData } from "../../_components/team-forms";

export const metadata = { title: "Team" };

export default async function TeamAdminPage() {
  await requirePageRole("ADMIN");

  const members = await prisma.teamMember.findMany({
    orderBy: [{ displayOrder: "asc" }, { batch: "asc" }, { createdAt: "asc" }],
    include: { user: { select: { name: true, email: true, role: true } } },
  });

  const rows: TeamRowData[] = members.map((m) => ({
    id: m.id,
    name: m.name || m.user?.name || "Unnamed",
    email: m.email || m.user?.email || null,
    photo: m.photo,
    designation: m.designation,
    domain: m.domain,
    batch: m.batch,
    displayOrder: m.displayOrder,
    github: m.github,
    linkedin: m.linkedin,
    portfolio: m.portfolio,
    isActive: m.isActive,
    isAdmin: m.user ? hasRole(m.user.role, "ADMIN") : false,
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
