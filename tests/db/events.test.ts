import { describe, expect, it } from "vitest";
import { createEvent, deleteEvent, updateEvent } from "@/app/admin/_actions/events";
import { getPublicEvents } from "@/lib/events";
import { prisma } from "@/lib/prisma";
import { createUser, expectRedirect, form, hasTestDb, validEvent } from "./helpers";
import { actingAs } from "./session";

describe.skipIf(!hasTestDb)("events: only admins manage events", () => {
  it("refuses members and signed-out requests", async () => {
    const member = await createUser("MEMBER");
    const r = await actingAs(member.id, () => createEvent({}, form(validEvent)));
    expect(r.error).toMatch(/permission/i);
    expect(await actingAs(null, () => createEvent({}, form(validEvent)))).toMatchObject({ error: expect.stringMatching(/sign in/i) });
    expect(await prisma.event.count()).toBe(0);
  });

  it("lets an admin create an event, stored in IST and credited to them", async () => {
    const admin = await createUser("ADMIN");
    const url = await expectRedirect(actingAs(admin.id, () => createEvent({}, form(validEvent))));
    expect(url).toBe("/admin/events");
    const event = await prisma.event.findFirstOrThrow();
    expect(event.startDate.toISOString()).toBe("2026-12-01T12:30:00.000Z"); // 18:00 IST
    expect(event.createdById).toBe(admin.id);
  });

  it("returns field errors instead of saving bad input", async () => {
    const admin = await createUser("ADMIN");
    const r = await actingAs(admin.id, () =>
      createEvent({}, form({ ...validEvent, endDate: "2026-12-01T17:00", posterUrl: "javascript:alert(1)" })),
    );
    expect(r.fieldErrors?.endDate).toBeDefined();
    expect(r.fieldErrors?.posterUrl).toBeDefined();
    expect(await prisma.event.count()).toBe(0);
  });

  it("lets any admin edit or delete any event, and nobody else", async () => {
    const [a1, a2, member] = [await createUser("ADMIN"), await createUser("ADMIN"), await createUser("MEMBER")];
    await expectRedirect(actingAs(a1.id, () => createEvent({}, form(validEvent))));
    const { id } = await prisma.event.findFirstOrThrow();

    expect((await actingAs(member.id, () => deleteEvent(id))).error).toMatch(/permission/i);
    await expectRedirect(actingAs(a2.id, () => updateEvent(id, {}, form({ ...validEvent, title: "Hack Night 2.0" }))));
    expect((await prisma.event.findUniqueOrThrow({ where: { id } })).title).toBe("Hack Night 2.0");
    expect((await actingAs(a2.id, () => deleteEvent(id))).ok).toBeTruthy();
    expect(await prisma.event.count()).toBe(0);
  });
});

describe.skipIf(!hasTestDb)("getPublicEvents applies the display rule", () => {
  const now = new Date("2026-11-12T12:00:00Z");
  const monthsAgo = (m: number) => new Date(now.getTime() - m * 30 * 86_400_000);
  const seed = async (recent: number, old: number) => {
    const rows = [
      ...Array.from({ length: recent }, (_, i) => ({ title: `Recent ${i}`, startDate: monthsAgo(i + 1) })),
      ...Array.from({ length: old }, (_, i) => ({ title: `Old ${i}`, startDate: monthsAgo(60 + i * 12) })),
    ];
    await prisma.event.createMany({
      data: rows.map((r) => ({ ...r, description: "d", endDate: new Date(r.startDate.getTime() + 3_600_000) })),
    });
  };

  it("shows everything when there are 10 or fewer events", async () => {
    await seed(7, 3);
    const events = await getPublicEvents(now);
    expect(events).toHaveLength(10);
  });

  it("drops events older than 4 years once there are more than 10, newest first", async () => {
    await seed(9, 3);
    const events = await getPublicEvents(now);
    expect(events).toHaveLength(9);
    expect(events.some((e) => e.title.startsWith("Old"))).toBe(false);
    expect(events[0].title).toBe("Recent 0");
  });
});
