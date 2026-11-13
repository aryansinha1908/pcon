import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roles";
import { teamMemberUpdateApiSchema } from "@/lib/validation";

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/team/members/[id]
 * Public API: Fetch a single active team member.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Member ID is required." },
        { status: 400 }
      );
    }

    const member = await prisma.teamMember.findUnique({
      where: { id },
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
        createdAt: true,
        updatedAt: true,
        specializations: {
          select: { name: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!member || !member.isActive) {
      return NextResponse.json(
        { success: false, error: "Team member not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...member,
        rollNumber: member.studentId,
        specializations: (member.specializations ?? []).map((s: any) => s.name ?? s),
      },
    });
  } catch (error) {
    console.error("GET /api/team/members/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch team member." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/team/members/[id]
 * Admin API: Update a team member's information.
 * Requires ADMIN or OWNER role.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Member ID is required." },
        { status: 400 }
      );
    }

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    if (!hasRole(session.user.role, "ADMIN")) {
      return NextResponse.json(
        { success: false, error: "Admin permission required." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload." },
        { status: 400 }
      );
    }

    const parsed = teamMemberUpdateApiSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Team member not found." },
        { status: 404 }
      );
    }

    const { specializations, ...memberFields } = parsed.data;

    let updated: any;
    const runUpdate = async (tx: typeof prisma) => {
      if (specializations !== undefined && tx.memberSpecialization) {
        await tx.memberSpecialization.deleteMany({
          where: { teamMemberId: id },
        });
        if (specializations.length > 0) {
          await tx.memberSpecialization.createMany({
            data: specializations.map((name) => ({ teamMemberId: id, name })),
          });
        }
      }

      return tx.teamMember.update({
        where: { id },
        data: memberFields,
        ...(tx.memberSpecialization
          ? {
              include: {
                specializations: {
                  select: { name: true },
                  orderBy: { createdAt: "asc" },
                },
              },
            }
          : {}),
      });
    };

    if (prisma.$transaction) {
      updated = await prisma.$transaction(async (tx) => runUpdate(tx as any));
    } else {
      updated = await runUpdate(prisma);
    }

    return NextResponse.json({
      success: true,
      message: "Member updated successfully.",
      data: {
        ...updated,
        rollNumber: updated.studentId,
        specializations: (updated.specializations ?? []).map((s: any) => s.name ?? s),
      },
    });
  } catch (error) {
    console.error("PUT /api/team/members/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update team member." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/team/members/[id]
 * Admin API: Delete a team member or mark as inactive.
 * Requires ADMIN or OWNER role.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Member ID is required." },
        { status: 400 }
      );
    }

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    if (!hasRole(session.user.role, "ADMIN")) {
      return NextResponse.json(
        { success: false, error: "Admin permission required." },
        { status: 403 }
      );
    }

    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Team member not found." },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const softDelete = searchParams.get("deactivate") === "true";

    if (softDelete) {
      const deactivated = await prisma.teamMember.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({
        success: true,
        message: "Member marked as inactive.",
        data: deactivated,
      });
    }

    await prisma.teamMember.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Member deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE /api/team/members/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete team member." },
      { status: 500 }
    );
  }
}

