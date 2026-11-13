import { describe, expect, it } from "vitest";
import { createAchievement, deleteAchievement, updateAchievement } from "@/app/admin/_actions/achievements";
import { createFameEntry, deleteFameEntry, updateFameEntry } from "@/app/admin/_actions/hall-of-fame";
import { getAchievements } from "@/lib/club-achievements";
import { getHallOfFame, podiumBoard } from "@/lib/hall-of-fame";
import { prisma } from "@/lib/prisma";
import { createUser, expectRedirect, form, hasTestDb, validAchievement, validFameEntry } from "./helpers";
import { actingAs } from "./session";

describe.skipIf(!hasTestDb)("achievements: only admins manage them", () => {
  it("refuses members and signed-out requests", async () => {
    const member = await createUser("MEMBER");
    expect((await actingAs(member.id, () => createAchievement({}, form(validAchievement)))).error).toMatch(/permission/i);
    expect((await actingAs(null, () => createAchievement({}, form(validAchievement)))).error).toMatch(/sign in/i);
    expect(await prisma.achievement.count()).toBe(0);
  });

  it("lets an admin create one with a slug from the title, then edit and delete it", async () => {
    const admin = await createUser("ADMIN");
    expect(await expectRedirect(actingAs(admin.id, () => createAchievement({}, form(validAchievement))))).toBe("/admin/achievements");
    const created = await prisma.achievement.findFirstOrThrow();
    expect(created).toMatchObject({ slug: "icpc-asia-kanpur-regional-2025", year: 2025, tier: "rank", featured: false });

    await expectRedirect(actingAs(admin.id, () => updateAchievement(created.id, {}, form({ ...validAchievement, result: "Rank 50" }))));
    expect((await prisma.achievement.findUniqueOrThrow({ where: { id: created.id } })).result).toBe("Rank 50");

    expect((await actingAs(admin.id, () => deleteAchievement(created.id))).ok).toBeTruthy();
    expect(await prisma.achievement.count()).toBe(0);
  });

  it("gives duplicate titles distinct slugs", async () => {
    const admin = await createUser("ADMIN");
    await expectRedirect(actingAs(admin.id, () => createAchievement({}, form(validAchievement))));
    await expectRedirect(actingAs(admin.id, () => createAchievement({}, form(validAchievement))));
    const slugs = (await prisma.achievement.findMany({ orderBy: { createdAt: "asc" } })).map((a) => a.slug);
    expect(slugs).toEqual(["icpc-asia-kanpur-regional-2025", "icpc-asia-kanpur-regional-2025-2"]);
  });

  it("returns field errors instead of saving bad input", async () => {
    const admin = await createUser("ADMIN");
    const r = await actingAs(admin.id, () =>
      createAchievement({}, form({ ...validAchievement, year: "2010", tier: "platinum", imageUrl: "javascript:alert(1)" })),
    );
    expect(r.fieldErrors?.year).toBeDefined();
    expect(r.fieldErrors?.tier).toBeDefined();
    expect(r.fieldErrors?.imageUrl).toBeDefined();
    expect(await prisma.achievement.count()).toBe(0);
  });

  it("keeps a single spotlight: featuring one un-features the rest", async () => {
    const admin = await createUser("ADMIN");
    await expectRedirect(actingAs(admin.id, () => createAchievement({}, form({ ...validAchievement, featured: "on" }))));
    await expectRedirect(actingAs(admin.id, () => createAchievement({}, form({ ...validAchievement, title: "Adobe GenSolve 2024", featured: "on" }))));
    const featured = await prisma.achievement.findMany({ where: { featured: true } });
    expect(featured.map((a) => a.title)).toEqual(["Adobe GenSolve 2024"]);

    const first = await prisma.achievement.findFirstOrThrow({ where: { featured: false } });
    await expectRedirect(actingAs(admin.id, () => updateAchievement(first.id, {}, form({ ...validAchievement, featured: "on" }))));
    expect((await prisma.achievement.findMany({ where: { featured: true } })).map((a) => a.id)).toEqual([first.id]);
    // The page lists the spotlight first.
    expect((await getAchievements())[0].id).toBe(first.id);
  });

  it("reports a missing row instead of creating one on update", async () => {
    const admin = await createUser("ADMIN");
    const r = await actingAs(admin.id, () => updateAchievement("missing", {}, form({ ...validAchievement, featured: "on" })));
    expect(r.error).toMatch(/no longer exists/i);
    expect(await prisma.achievement.count()).toBe(0);
  });
});

describe.skipIf(!hasTestDb)("hall of fame: only admins manage it", () => {
  it("refuses members", async () => {
    const member = await createUser("MEMBER");
    expect((await actingAs(member.id, () => createFameEntry({}, form(validFameEntry)))).error).toMatch(/permission/i);
    expect(await prisma.hallOfFameEntry.count()).toBe(0);
  });

  it("stores the podium, roll numbers (uppercased), teams and mentions, and reads them back in order", async () => {
    const admin = await createUser("ADMIN");
    expect(await expectRedirect(actingAs(admin.id, () => createFameEntry({}, form(validFameEntry))))).toBe("/admin/hall-of-fame");

    const [entry] = await getHallOfFame();
    expect(entry).toMatchObject({ slug: "hacksphere26", event: "HACKSPHERE'26", date: "2026-07-03", kind: "Hackathon" });
    expect(entry.podium).toEqual([
      { rank: 1, name: "Lakshya Kumar Sudhera", roll: "2025UGCS055", team: undefined },
      { rank: 2, name: "Raunak Shrivastava", roll: undefined, team: undefined },
      { rank: 3, name: "Team Byte", roll: undefined, team: ["Asha", "Ravi", "Meera"] },
    ]);
    expect(entry.mentions).toEqual([
      { name: "Raushan Kumar", roll: "2025UGMM037", award: "Best UI/UX" },
      { name: "Sujal Bhatu", roll: undefined, award: undefined },
    ]);
  });

  it("points each bad field at its input, and saves nothing", async () => {
    const admin = await createUser("ADMIN");
    const r = await actingAs(admin.id, () =>
      createFameEntry({}, form({ ...validFameEntry, place1_name: "", place2_roll: "20 25!", date: "", mentions: "ok name\nX | 2025UGCS010" })),
    );
    expect(r.fieldErrors?.place1_name).toBeDefined();
    expect(r.fieldErrors?.place2_roll).toBeDefined();
    expect(r.fieldErrors?.date).toBeDefined();
    expect(r.fieldErrors?.mentions?.[0]).toMatch(/^Line 2:/);
    expect(await prisma.hallOfFameEntry.count()).toBe(0);
  });

  it("replaces the placements on edit, and deletes them with the entry", async () => {
    const admin = await createUser("ADMIN");
    await expectRedirect(actingAs(admin.id, () => createFameEntry({}, form(validFameEntry))));
    const { id } = await prisma.hallOfFameEntry.findFirstOrThrow();

    await expectRedirect(
      actingAs(admin.id, () => updateFameEntry(id, {}, form({ event: "HACKSPHERE'26", date: "2026-07-03", kind: "Hackathon", place1_name: "Satyam Sagar" }))),
    );
    const placements = await prisma.hallOfFamePlacement.findMany({ where: { entryId: id } });
    expect(placements.map((p) => [p.rank, p.name])).toEqual([[1, "Satyam Sagar"]]);

    expect((await actingAs(admin.id, () => deleteFameEntry(id))).ok).toBeTruthy();
    expect(await prisma.hallOfFamePlacement.count()).toBe(0);
  });

  it("counts repeat winners by roll number across entries", async () => {
    const admin = await createUser("ADMIN");
    await expectRedirect(actingAs(admin.id, () => createFameEntry({}, form({ event: "Contest A", date: "2026-01-01", kind: "Contest", place1_name: "Satyam Sagar", place1_roll: "2025UGCS010" }))));
    await expectRedirect(actingAs(admin.id, () => createFameEntry({}, form({ event: "Contest B", date: "2026-02-01", kind: "Contest", place1_name: "Someone", place3_name: "Satyam S.", place3_roll: "2025UGCS010" }))));
    const [top] = podiumBoard(await getHallOfFame());
    expect(top).toMatchObject({ roll: "2025UGCS010", total: 2, golds: 1 });
  });
});
