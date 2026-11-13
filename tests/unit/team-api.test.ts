import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET as getMembers, POST as createMember } from "@/app/api/team/members/route";
import {
  DELETE as deleteMember,
  GET as getMemberById,
  PUT as updateMember,
} from "@/app/api/team/members/[id]/route";
import { POST as uploadFile } from "@/app/api/upload/route";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    teamMember: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();
  return {
    ...actual,
    mkdir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
  };
});

describe("Team APIs", () => {
  const mockAdminSession = {
    user: { id: "admin-1", email: "admin@nitjsr.ac.in", role: "ADMIN" },
  };
  const mockMemberSession = {
    user: { id: "user-1", email: "student@nitjsr.ac.in", role: "MEMBER" },
  };

  const sampleMember = {
    id: "mem-1",
    name: "Aarav Sharma",
    studentId: null as string | null,
    photo: "https://example.com/aarav.jpg",
    batch: 2026,
    position: "App Development Lead" as string | null,
    designation: "App Development Lead",
    domain: "App Development",
    github: "https://github.com/aarav",
    linkedin: "https://linkedin.com/in/aarav",
    portfolio: "https://aarav.dev",
    email: "aarav@nitjsr.ac.in",
    order: 1,
    displayOrder: 1,
    isActive: true,
    userId: null as string | null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/team/members", () => {
    it("1. fetches all active team members sorted by displayOrder", async () => {
      vi.mocked(prisma.teamMember.findMany).mockResolvedValueOnce([sampleMember]);

      const req = new NextRequest("http://localhost:3000/api/team/members");
      const res = await getMembers(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.count).toBe(1);
      expect(json.members).toHaveLength(1);
      expect(json.members[0].name).toBe("Aarav Sharma");
      expect(prisma.teamMember.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
          orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
        })
      );
    });

    it("2. filters members by batch parameter", async () => {
      vi.mocked(prisma.teamMember.findMany).mockResolvedValueOnce([sampleMember]);

      const req = new NextRequest("http://localhost:3000/api/team/members?batch=2026");
      const res = await getMembers(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(prisma.teamMember.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true, batch: 2026 },
        })
      );
    });

    it("excludes inactive members from public view", async () => {
      vi.mocked(prisma.teamMember.findMany).mockResolvedValueOnce([]);

      const req = new NextRequest("http://localhost:3000/api/team/members?includeInactive=true");
      // unauthenticated or non-admin should still only query active
      vi.mocked(auth).mockResolvedValueOnce(null as any);
      await getMembers(req);

      expect(prisma.teamMember.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
        })
      );
    });
  });

  describe("GET /api/team/members/[id]", () => {
    it("3. fetches an active member by ID", async () => {
      vi.mocked(prisma.teamMember.findUnique).mockResolvedValueOnce(sampleMember);

      const req = new NextRequest("http://localhost:3000/api/team/members/mem-1");
      const res = await getMemberById(req, { params: Promise.resolve({ id: "mem-1" }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.id).toBe("mem-1");
    });

    it("returns 404 if member is not found or inactive", async () => {
      vi.mocked(prisma.teamMember.findUnique).mockResolvedValueOnce({
        ...sampleMember,
        isActive: false,
      });

      const req = new NextRequest("http://localhost:3000/api/team/members/mem-1");
      const res = await getMemberById(req, { params: Promise.resolve({ id: "mem-1" }) });
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.success).toBe(false);
    });
  });

  describe("POST /api/team/members", () => {
    it("4. creates a valid team member when authenticated as ADMIN", async () => {
      vi.mocked(auth).mockResolvedValueOnce(mockAdminSession as any);
      vi.mocked(prisma.teamMember.create).mockResolvedValueOnce(sampleMember);

      const payload = {
        name: "Aarav Sharma",
        batch: 2026,
        designation: "App Development Lead",
        domain: "App Development",
        photo: "https://example.com/photo.jpg",
        github: "https://github.com/aarav",
        linkedin: "https://linkedin.com/in/aarav",
        portfolio: "https://aarav.dev",
        displayOrder: 1,
      };

      const req = new NextRequest("http://localhost:3000/api/team/members", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await createMember(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(prisma.teamMember.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: "Aarav Sharma", batch: 2026 }),
        })
      );
    });

    it("7. rejects invalid input validation (invalid URLs, invalid batch)", async () => {
      vi.mocked(auth).mockResolvedValueOnce(mockAdminSession as any);

      const req = new NextRequest("http://localhost:3000/api/team/members", {
        method: "POST",
        body: JSON.stringify({
          name: "A", // too short
          batch: 1800, // out of range
          github: "invalid-url",
        }),
      });

      const res = await createMember(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe("Validation failed.");
    });

    it("8. rejects unauthorized (401) and non-admin (403) requests", async () => {
      // 401 when no session
      vi.mocked(auth).mockResolvedValueOnce(null as any);
      const req1 = new NextRequest("http://localhost:3000/api/team/members", {
        method: "POST",
        body: JSON.stringify({ name: "Test" }),
      });
      const res1 = await createMember(req1);
      expect(res1.status).toBe(401);

      // 403 when MEMBER role
      vi.mocked(auth).mockResolvedValueOnce(mockMemberSession as any);
      const req2 = new NextRequest("http://localhost:3000/api/team/members", {
        method: "POST",
        body: JSON.stringify({ name: "Test" }),
      });
      const res2 = await createMember(req2);
      expect(res2.status).toBe(403);
    });
  });

  describe("PUT /api/team/members/[id]", () => {
    it("5. updates an existing member", async () => {
      vi.mocked(auth).mockResolvedValueOnce(mockAdminSession as any);
      vi.mocked(prisma.teamMember.findUnique).mockResolvedValueOnce(sampleMember);
      vi.mocked(prisma.teamMember.update).mockResolvedValueOnce({
        ...sampleMember,
        designation: "Club President",
      });

      const req = new NextRequest("http://localhost:3000/api/team/members/mem-1", {
        method: "PUT",
        body: JSON.stringify({ designation: "Club President" }),
      });

      const res = await updateMember(req, { params: Promise.resolve({ id: "mem-1" }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.designation).toBe("Club President");
    });

    it("rejects unauthorized update requests", async () => {
      vi.mocked(auth).mockResolvedValueOnce(null as any);

      const req = new NextRequest("http://localhost:3000/api/team/members/mem-1", {
        method: "PUT",
        body: JSON.stringify({ designation: "Club President" }),
      });

      const res = await updateMember(req, { params: Promise.resolve({ id: "mem-1" }) });
      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /api/team/members/[id]", () => {
    it("6. deletes a member by ID", async () => {
      vi.mocked(auth).mockResolvedValueOnce(mockAdminSession as any);
      vi.mocked(prisma.teamMember.findUnique).mockResolvedValueOnce(sampleMember);
      vi.mocked(prisma.teamMember.delete).mockResolvedValueOnce(sampleMember);

      const req = new NextRequest("http://localhost:3000/api/team/members/mem-1", {
        method: "DELETE",
      });

      const res = await deleteMember(req, { params: Promise.resolve({ id: "mem-1" }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(prisma.teamMember.delete).toHaveBeenCalledWith({ where: { id: "mem-1" } });
    });

    it("supports soft-deactivation when ?deactivate=true", async () => {
      vi.mocked(auth).mockResolvedValueOnce(mockAdminSession as any);
      vi.mocked(prisma.teamMember.findUnique).mockResolvedValueOnce(sampleMember);
      vi.mocked(prisma.teamMember.update).mockResolvedValueOnce({
        ...sampleMember,
        isActive: false,
      });

      const req = new NextRequest("http://localhost:3000/api/team/members/mem-1?deactivate=true", {
        method: "DELETE",
      });

      const res = await deleteMember(req, { params: Promise.resolve({ id: "mem-1" }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.isActive).toBe(false);
      expect(prisma.teamMember.update).toHaveBeenCalledWith({
        where: { id: "mem-1" },
        data: { isActive: false },
      });
    });
  });

  describe("POST /api/upload", () => {
    it("9. validates file type (MIME type rejection)", async () => {
      vi.mocked(auth).mockResolvedValueOnce(mockAdminSession as any);

      const formData = new FormData();
      const fakeFile = new File(["fake text content"], "notes.txt", { type: "text/plain" });
      formData.append("file", fakeFile);

      const req = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      const res = await uploadFile(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain("Invalid file type");
    });

    it("rejects files exceeding 5MB limit", async () => {
      vi.mocked(auth).mockResolvedValueOnce(mockAdminSession as any);

      // Create a mock large file
      const largeContent = new Uint8Array(6 * 1024 * 1024);
      const fakeFile = new File([largeContent], "huge.png", { type: "image/png" });
      const formData = new FormData();
      formData.append("file", fakeFile);

      const req = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      const res = await uploadFile(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain("5MB limit");
    });
  });
});
