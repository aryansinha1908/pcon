import { PrismaClient, type Role } from "@prisma/client";
import { calculateReadTimeMinutes } from "../lib/blog-utils";
import { SEED_ACHIEVEMENTS, SEED_AUTHORS, SEED_CATEGORIES, SEED_EVENTS, SEED_HALL_OF_FAME, SEED_POSTS } from "../lib/seed-data";

const prisma = new PrismaClient();
const RANK: Record<Role, number> = { MEMBER: 0, ADMIN: 1, OWNER: 2 };

function emailsFrom(name: string): string[] {
  return (process.env[name] ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

async function seedUsers(emails: string[], role: Role) {
  for (const email of emails) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      await prisma.user.create({ data: { email, role } });
      console.log(`created ${email} as ${role}`);
    } else if (RANK[existing.role] < RANK[role]) {
      await prisma.user.update({ where: { email }, data: { role } });
      console.log(`promoted ${email} from ${existing.role} to ${role}`);
    } else {
      console.log(`${email} is already ${existing.role}, left unchanged`);
    }
  }
}

export async function seedBlogData() {
  console.log("Seeding blog categories...");
  const catMap = new Map<string, number>();
  for (const cat of SEED_CATEGORIES) {
    const created = await prisma.blogCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, hue: cat.hue },
      create: cat,
    });
    catMap.set(cat.slug, created.id);
  }

  console.log("Seeding blog authors...");
  const authorMap = new Map<string, number>();
  for (const author of SEED_AUTHORS) {
    let existing = await prisma.blogAuthor.findFirst({ where: { name: author.name } });
    if (!existing) {
      existing = await prisma.blogAuthor.create({ data: author });
    }
    authorMap.set(author.name, existing.id);
  }

  console.log("Seeding blog posts...");
  for (const post of SEED_POSTS) {
    const categoryId = catMap.get(post.categorySlug);
    const authorId = authorMap.get(post.authorName);
    if (!categoryId || !authorId) continue;

    const readTimeMinutes = calculateReadTimeMinutes(post.content);

    await prisma.blog.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        categoryId,
        authorId,
        status: post.status,
        isFeatured: post.isFeatured,
        readTimeMinutes,
        publishedAt: post.publishedAt,
      },
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        categoryId,
        authorId,
        status: post.status,
        isFeatured: post.isFeatured,
        readTimeMinutes,
        publishedAt: post.publishedAt,
      },
    });
  }
}

export async function seedEvents() {
  console.log("Seeding events...");
  for (const { id, ...event } of SEED_EVENTS) {
    await prisma.event.upsert({ where: { id }, update: event, create: { id, ...event } });
  }
}

/**
 * Achievements and hall of fame: create-only. Rows whose slug already exists are
 * left alone, so re-running the seed never overwrites admin-panel edits.
 */
export async function seedAchievements() {
  console.log("Seeding achievements...");
  for (const a of SEED_ACHIEVEMENTS) {
    if (await prisma.achievement.findUnique({ where: { slug: a.slug } })) continue;
    await prisma.achievement.create({ data: a });
  }

  console.log("Seeding hall of fame...");
  for (const entry of SEED_HALL_OF_FAME) {
    if (await prisma.hallOfFameEntry.findUnique({ where: { slug: entry.slug } })) continue;
    await prisma.hallOfFameEntry.create({
      data: {
        slug: entry.slug,
        event: entry.event,
        date: new Date(`${entry.date}T00:00:00Z`),
        kind: entry.kind,
        summary: entry.summary,
        link: entry.link,
        placements: {
          create: [
            ...entry.podium.map((p) => ({ rank: p.rank, name: p.name, roll: p.roll, team: p.team ?? [] })),
            ...(entry.mentions ?? []).map((m, order) => ({ rank: null, name: m.name, roll: m.roll, award: m.award, order })),
          ],
        },
      },
    });
  }
}

async function main() {
  const admins = emailsFrom("SEED_ADMIN_EMAILS");
  const owners = emailsFrom("SEED_OWNER_EMAILS");
  if (admins.length + owners.length > 0) {
    await seedUsers(admins, "ADMIN");
    await seedUsers(owners, "OWNER");
  }

  try {
    await seedBlogData();
    console.log("Blog data seeded successfully.");
  } catch (err) {
    console.warn("Could not seed database directly (database might be offline):", (err as Error).message);
  }

  try {
    await seedEvents();
    console.log("Events seeded successfully.");
  } catch (err) {
    console.warn("Could not seed events (database might be offline):", (err as Error).message);
  }

  try {
    await seedAchievements();
    console.log("Achievements and hall of fame seeded successfully.");
  } catch (err) {
    console.warn("Could not seed achievements (database might be offline):", (err as Error).message);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
