import { describe, expect, it } from "vitest";
import {
  createBlogAction,
  updateBlogAction,
  deleteBlogAction,
  togglePublishedAction,
} from "@/app/admin/_actions/blogs";
import { prisma } from "@/lib/prisma";
import { createUser, expectRedirect, form, hasTestDb, validBlog } from "./helpers";
import { actingAs } from "./session";

async function ensureSeedData() {
  const cat = await prisma.blogCategory.upsert({
    where: { slug: "algorithms" },
    update: {},
    create: { name: "Algorithms", slug: "algorithms", hue: 162 },
  });
  let author = await prisma.blogAuthor.findFirst();
  if (!author) {
    author = await prisma.blogAuthor.create({
      data: { name: "Aarav Sinha", roleTitle: "Pre-final year, CSE" },
    });
  }
  return { cat, author };
}

describe.skipIf(!hasTestDb)("blogs: admin management and publish flows", () => {
  it("doesn't let members create blogs", async () => {
    const member = await createUser("MEMBER");
    expect((await actingAs(member.id, () => createBlogAction({}, form(validBlog)))).error).toMatch(/permission/i);
    expect(await prisma.blog.count()).toBe(0);
  });

  it("saves an admin's blog as a draft", async () => {
    const admin = await createUser("ADMIN");
    const { cat, author } = await ensureSeedData();
    const payload = {
      ...validBlog,
      categoryId: String(cat.id),
      authorId: String(author.id),
    };

    await expectRedirect(actingAs(admin.id, () => createBlogAction({}, form(payload))));
    const blog = await prisma.blog.findFirstOrThrow({ where: { title: validBlog.title } });
    expect(blog.status).toBe("draft");
    expect(blog.readTimeMinutes).toBeGreaterThanOrEqual(1);
  });

  it("lets an admin edit, publish and delete blogs", async () => {
    const admin = await createUser("ADMIN");
    const { cat, author } = await ensureSeedData();
    const payload = {
      ...validBlog,
      categoryId: String(cat.id),
      authorId: String(author.id),
    };

    await expectRedirect(actingAs(admin.id, () => createBlogAction({}, form(payload))));
    const blog = await prisma.blog.findFirstOrThrow({ where: { title: validBlog.title } });

    await expectRedirect(
      actingAs(admin.id, () =>
        updateBlogAction(blog.id, {}, form({ ...payload, title: "Intro to DP (v2)" }))
      )
    );
    expect((await actingAs(admin.id, () => togglePublishedAction(blog.id, true))).ok).toBeTruthy();

    const afterPublish = await prisma.blog.findUniqueOrThrow({ where: { id: blog.id } });
    expect(afterPublish.title).toBe("Intro to DP (v2)");
    expect(afterPublish.status).toBe("published");

    expect((await actingAs(admin.id, () => deleteBlogAction(blog.id))).ok).toBeTruthy();
    expect(await prisma.blog.count({ where: { id: blog.id } })).toBe(0);
  });
});
