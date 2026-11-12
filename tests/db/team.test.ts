import { describe, expect, it } from "vitest";
import { addTeamMember, removeTeamMember, setTeamMemberActive, updateTeamMember } from "@/app/admin/_actions/team";
import { prisma } from "@/lib/prisma";
import { createUser, form, hasTestDb } from "./helpers";
import { actingAs } from "./session";

const member = { position: "CP Lead", batch: "2028" };

describe.skipIf(!hasTestDb)("team management", () => {
  it("is admin-only", async () => {
    const m = await createUser("MEMBER");
    const r = await actingAs(m.id, () => addTeamMember({}, form({ ...member, email: "a@nitjsr.ac.in" })));
    expect(r.error).toMatch(/permission/i);
  });

  it("only accepts college emails", async () => {
    const admin = await createUser("ADMIN");
    const r = await actingAs(admin.id, () => addTeamMember({}, form({ ...member, email: "someone@gmail.com" })));
    expect(r.fieldErrors?.email?.[0]).toMatch(/nitjsr\.ac\.in/);
  });

  it("adds an existing user, matching their email in any case", async () => {
    const admin = await createUser("ADMIN");
    const user = await createUser("MEMBER", "Rahul");
    const r = await actingAs(admin.id, () => addTeamMember({}, form({ ...member, email: ` ${user.email.toUpperCase()} ` })));
    expect(r.ok).toMatch(/Rahul/);
    expect(await prisma.teamMember.findUnique({ where: { userId: user.id } })).toMatchObject({ position: "CP Lead", batch: 2028 });
  });

  it("creates a user for someone who hasn't signed in yet, as a plain member", async () => {
    const admin = await createUser("ADMIN");
    await actingAs(admin.id, () => addTeamMember({}, form({ ...member, email: "newbie@nitjsr.ac.in", name: "New Bie" })));
    const user = await prisma.user.findUniqueOrThrow({ where: { email: "newbie@nitjsr.ac.in" }, include: { teamMember: true } });
    expect(user).toMatchObject({ name: "New Bie", role: "MEMBER" });
    expect(user.teamMember?.isActive).toBe(true);
  });

  it("refuses to add the same person twice", async () => {
    const admin = await createUser("ADMIN");
    await actingAs(admin.id, () => addTeamMember({}, form({ ...member, email: "dup@nitjsr.ac.in" })));
    const r = await actingAs(admin.id, () => addTeamMember({}, form({ ...member, email: "dup@nitjsr.ac.in" })));
    expect(r.error).toMatch(/already on the team/i);
  });

  it("moves people to alumni without touching their role, then removes them from the page only", async () => {
    const admin = await createUser("ADMIN");
    const lead = await createUser("ADMIN", "Old Lead");
    await actingAs(admin.id, () => addTeamMember({}, form({ ...member, email: lead.email })));
    const tm = await prisma.teamMember.findUniqueOrThrow({ where: { userId: lead.id } });

    await actingAs(admin.id, () => updateTeamMember(tm.id, {}, form({ position: "Former Lead", batch: "2026", order: "3" })));
    await actingAs(admin.id, () => setTeamMemberActive(tm.id, false));
    expect(await prisma.teamMember.findUniqueOrThrow({ where: { id: tm.id } })).toMatchObject({
      position: "Former Lead",
      order: 3,
      isActive: false,
    });
    expect((await prisma.user.findUniqueOrThrow({ where: { id: lead.id } })).role).toBe("ADMIN");

    await actingAs(admin.id, () => removeTeamMember(tm.id));
    expect(await prisma.teamMember.count()).toBe(0);
    expect(await prisma.user.findUnique({ where: { id: lead.id } })).not.toBeNull();
  });
});
