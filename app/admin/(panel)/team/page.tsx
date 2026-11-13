import { requirePageRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roles";
import { PageHeader } from "../../_components/page-header";
import { TeamManagementPanel, type TeamRowData } from "../../_components/team-forms";

export const metadata = { title: "Team Management" };

export default async function TeamAdminPage() {
  await requirePageRole("ADMIN");

  const members = await prisma.teamMember.findMany({
    orderBy: [{ displayOrder: "asc" }, { batch: "desc" }, { createdAt: "asc" }],
    include: {
      user: { select: { name: true, email: true, role: true } },
      specializations: { select: { name: true }, orderBy: { createdAt: "asc" } },
    },
  });

  const rows: TeamRowData[] = members.map((m) => ({
    id: m.id,
    name: m.name || m.user?.name || "Unnamed",
    studentId: m.studentId,
    email: m.email || m.user?.email || null,
    photo: m.photo,
    designation: m.designation,
    domain: m.domain,
    specializations: m.specializations.map((s) => s.name),
    batch: m.batch,
    displayOrder: m.displayOrder,
    github: m.github,
    linkedin: m.linkedin,
    portfolio: m.portfolio,
    isActive: m.isActive,
    isAdmin: m.user ? hasRole(m.user.role, "ADMIN") : false,
  }));

  return (
    <>
      <PageHeader eyebrow="04 / TEAM" title="Team Management" />
      <p className="adm-rule">
        Manage PCON&apos;s <strong>Current Team (Batch 2027)</strong> and <strong>Inductees (Batches 2026 &amp; 2025)</strong> separately by batch.
        Active members appear under their respective batch year on the public <code>/team</code> page.
      </p>

      <TeamManagementPanel members={rows} />
    </>
  );
}
