import { describe, expect, it } from "vitest";
import { createEvent } from "@/app/admin/_actions/events";
import { changeUserRole } from "@/app/admin/_actions/users";
import { prisma } from "@/lib/prisma";
import { createUser, form, hasTestDb, validEvent } from "./helpers";
import { actingAs } from "./session";

const roleOf = async (id: string) => (await prisma.user.findUniqueOrThrow({ where: { id } })).role;

describe.skipIf(!hasTestDb)("roles: owner-only, and the club is never locked out", () => {
  it("doesn't let admins or members change roles", async () => {
    const admin = await createUser("ADMIN");
    const member = await createUser("MEMBER");
    expect((await actingAs(admin.id, () => changeUserRole(member.id, "ADMIN"))).error).toMatch(/permission/i);
    expect((await actingAs(member.id, () => changeUserRole(member.id, "OWNER"))).error).toMatch(/permission/i);
    expect(await roleOf(member.id)).toBe("MEMBER");
  });

  it("doesn't let an owner change their own role", async () => {
    const owner = await createUser("OWNER");
    expect((await actingAs(owner.id, () => changeUserRole(owner.id, "MEMBER"))).error).toMatch(/own role/i);
  });

  it("rejects made-up roles", async () => {
    const owner = await createUser("OWNER");
    const member = await createUser("MEMBER");
    expect((await actingAs(owner.id, () => changeUserRole(member.id, "pcon:Owner"))).error).toMatch(/unknown role/i);
  });

  it("supports the yearly handover: promote the successor, who then demotes the old owner", async () => {
    const outgoing = await createUser("OWNER", "Outgoing President");
    const incoming = await createUser("ADMIN", "New President");

    expect((await actingAs(outgoing.id, () => changeUserRole(incoming.id, "OWNER"))).ok).toBeTruthy();
    expect((await actingAs(incoming.id, () => changeUserRole(outgoing.id, "MEMBER"))).ok).toBeTruthy();
    expect([await roleOf(outgoing.id), await roleOf(incoming.id)]).toEqual(["MEMBER", "OWNER"]);
  });

  it("never ends with zero owners when two owners demote each other at the same moment", async () => {
    const a = await createUser("OWNER");
    const b = await createUser("OWNER");
    await Promise.all([
      actingAs(a.id, () => changeUserRole(b.id, "ADMIN")),
      actingAs(b.id, () => changeUserRole(a.id, "ADMIN")),
    ]);
    expect(await prisma.user.count({ where: { role: "OWNER" } })).toBe(1);
  });

  it("refuses an owner whose role was removed after their request started", async () => {
    const stale = await createUser("ADMIN"); // the database says ADMIN…
    const target = await createUser("MEMBER");
    // …but their request was authorised while they were still an owner.
    const r = await actingAs(stale.id, () => changeUserRole(target.id, "ADMIN"), { staleRole: "OWNER" });
    expect(r.error).toMatch(/no longer an owner/i);
    expect(await roleOf(target.id)).toBe("MEMBER");
  });

  it("applies a demotion to the very next request", async () => {
    const owner = await createUser("OWNER");
    const admin = await createUser("ADMIN");
    await actingAs(owner.id, () => changeUserRole(admin.id, "MEMBER"));
    expect((await actingAs(admin.id, () => createEvent({}, form(validEvent)))).error).toMatch(/permission/i);
  });
});
