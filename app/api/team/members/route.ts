import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roles";
import { teamMemberInputSchema } from "@/lib/validation";

/**
 * GET /api/team/members
 * Public API: Fetch active team members sorted by displayOrder.
 * Supports query filter: ?batch=2027
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchParam = searchParams.get("batch");
    const includeInactive = searchParams.get("includeInactive") === "true";

    // If caller requests inactive members, ensure they are an admin
    let onlyActive = true;
    if (includeInactive) {
      const session = await auth();
      if (session?.user && hasRole(session.user.role, "ADMIN")) {
        onlyActive = false;
      }
    }

    const whereClause: {
      isActive?: boolean;
      batch?: number;
    } = {};

    if (onlyActive) {
      whereClause.isActive = true;
    }

    if (batchParam) {
      const parsedBatch = parseInt(batchParam, 10);
      if (!isNaN(parsedBatch)) {
        whereClause.batch = parsedBatch;
      }
    }

    const members = await prisma.teamMember.findMany({
      where: whereClause,
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
        createdAt: true,
        updatedAt: true,
        specializations: {
          select: { name: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    const formattedMembers = members.map((m) => ({
      ...m,
      rollNumber: m.studentId,
      specializations: (m.specializations ?? []).map((s: any) => s.name ?? s),
    }));

    return NextResponse.json({
      success: true,
      count: formattedMembers.length,
      members: formattedMembers,
      data: formattedMembers,
    });
  } catch (error) {
    console.error("GET /api/team/members error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch team members." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/team/members
 * Admin API: Create a new team member.
 * Requires ADMIN or OWNER role.
 */
export async function POST(request: NextRequest) {
  try {
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

    const parsed = teamMemberInputSchema.safeParse(body);
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

    const member = await prisma.teamMember.create({
      data: {
        name: parsed.data.name,
        studentId: parsed.data.studentId,
        photo: parsed.data.photo,
        batch: parsed.data.batch,
        designation: parsed.data.designation,
        domain: parsed.data.domain,
        github: parsed.data.github,
        linkedin: parsed.data.linkedin,
        portfolio: parsed.data.portfolio,
        email: parsed.data.email,
        displayOrder: parsed.data.displayOrder,
        isActive: parsed.data.isActive,
        ...(parsed.data.specializations && parsed.data.specializations.length > 0
          ? {
              specializations: {
                create: parsed.data.specializations.map((name) => ({ name })),
              },
            }
          : {}),
      },
      include: {
        specializations: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Member created successfully.",
        data: {
          ...member,
          rollNumber: member.studentId,
          specializations: (member.specializations ?? []).map((s: any) => s.name ?? s),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/team/members error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create team member." },
      { status: 500 }
    );
  }
}

