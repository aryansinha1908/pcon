
import { requirePageRole } from "@/lib/auth-guards";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roles";
import { PageHeader } from "../../_components/page-header";
import { RoleSelect } from "../../_components/role-select";

export const metadata = { title: "Users & roles" };

export default async function UsersPage() {
  const me = await requirePageRole("OWNER");

  const users = await prisma.user.findMany({
    orderBy: [{ role: "desc" }, { name: "asc" }, { email: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      teamMember: { select: { isActive: true, designation: true } },
      _count: { select: { accounts: true } },
    },
  });

  const toReview = users.filter(
    (u) => hasRole(u.role, "ADMIN") && u.id !== me.id && !u.teamMember?.isActive
  );

  return (
    <>
      <PageHeader eyebrow="05 / ACCESS" title="Users & roles" />

      <p className="adm-rule">
        Only owners can change roles. You can&apos;t change your own role, and the last owner can&apos;t be demoted. At
        handover: make the new president an owner, then they remove your owner role.
      </p>

      {toReview.length > 0 && (
        <div className="adm-notice adm-notice--warn" role="status">
          <strong>
            {toReview.length}{" "}
            {toReview.length === 1
              ? "person with admin access is"
              : "people with admin access are"}{" "}
            not on the current team.
          </strong>{" "}
          If they&apos;ve graduated or left, set them back to Member:{" "}
          {toReview.map((u) => u.name ?? u.email).join(", ")}.
        </div>
      )}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Team</th>
              <th>Joined</th>
              <th>Role</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td data-col="User">
                  <strong>{u.name ?? "—"}</strong>
                  <span className="adm-muted adm-block">{u.email}</span>
                  {u._count.accounts === 0 && (
                    <span className="adm-badge adm-badge--hidden">
                      Not signed in yet
                    </span>
                  )}
                </td>

                <td data-col="Team" className="adm-muted">
                  {u.teamMember
                    ? `${u.teamMember.designation ?? "Team member"}${u.teamMember.isActive ? "" : " (alumni)"}`
                    : "—"}
                </td>

                <td data-col="Joined" className="adm-muted">
                  {formatDate(u.createdAt)}
                </td>

                <td data-col="Role">
                  {u.id === me.id ? (
                    <span className="adm-badge">You · Owner</span>
                  ) : (
                    <RoleSelect userId={u.id} role={u.role} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
