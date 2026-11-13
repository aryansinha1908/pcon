import { prisma } from "@/lib/prisma";
import type { TeamMember } from "@/lib/team";

/**
 * Active team members for the public /team page, in the same shape as
 * GET /api/team/members. Rendering them on the server means phones get the grid
 * in the first HTML instead of after hydration plus a client fetch.
 * Admin team actions call revalidatePath("/team"), so edits still show up.
 * Returns undefined on a database error so the page falls back to the client fetch.
 */
export async function getActiveTeamMembers(): Promise<TeamMember[] | undefined> {
  try {
    const members = await prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        studentId: true,
        photo: true,
        batch: true,
        designation: true,
        domain: true,
        github: true,
        linkedin: true,
        portfolio: true,
        email: true,
        displayOrder: true,
        isActive: true,
        specializations: { select: { name: true }, orderBy: { createdAt: "asc" } },
      },
    });
    return members.map((m) => ({
      ...m,
      rollNumber: m.studentId,
      specializations: m.specializations.map((s) => s.name),
    }));
  } catch (error) {
    console.error("Failed to load team members for /team:", error);
    return undefined;
  }
}
