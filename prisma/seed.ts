import { PrismaClient, type Role } from "@prisma/client";
import { calculateReadTimeMinutes } from "../lib/blog-utils";
import { SEED_CATEGORIES, SEED_AUTHORS, SEED_POSTS } from "../lib/seed-data";

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
