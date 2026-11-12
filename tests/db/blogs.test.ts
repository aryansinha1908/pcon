import { describe, expect, it } from "vitest";
import { createBlog, deleteBlog, setBlogPublished, updateBlog } from "@/app/admin/_actions/blogs";
import { prisma } from "@/lib/prisma";
import { createUser, expectRedirect, form, hasTestDb, validBlog } from "./helpers";
import { actingAs } from "./session";

async function blogBy(authorId: string) {
  await expectRedirect(actingAs(authorId, () => createBlog({}, form(validBlog))));
  return prisma.blog.findFirstOrThrow({ where: { authorId } });
}

describe.skipIf(!hasTestDb)("blogs: any admin creates, only the author changes", () => {
  it("doesn't let members create blogs", async () => {
    const member = await createUser("MEMBER");
    expect((await actingAs(member.id, () => createBlog({}, form(validBlog)))).error).toMatch(/permission/i);
    expect(await prisma.blog.count()).toBe(0);
  });

  it("saves an admin's blog as a draft with normalised tags", async () => {
    const admin = await createUser("ADMIN");
    const blog = await blogBy(admin.id);
    expect(blog.published).toBe(false);
    expect(blog.tags).toEqual(["dsa", "dp"]);
  });

  it("stops other admins, and even owners, from editing, publishing or deleting it", async () => {
    const author = await createUser("ADMIN");
    const otherAdmin = await createUser("ADMIN");
    const owner = await createUser("OWNER");
    const blog = await blogBy(author.id);

    for (const user of [otherAdmin, owner]) {
      const edit = await actingAs(user.id, () => updateBlog(blog.id, {}, form({ ...validBlog, title: "Hijacked" })));
      expect(edit.error).toMatch(/only the author/i);
      expect((await actingAs(user.id, () => setBlogPublished(blog.id, true))).error).toMatch(/only the author/i);
      expect((await actingAs(user.id, () => deleteBlog(blog.id))).error).toMatch(/only the author/i);
    }
    const after = await prisma.blog.findUniqueOrThrow({ where: { id: blog.id } });
    expect(after).toMatchObject({ title: validBlog.title, published: false });
  });

  it("lets the author edit, publish and delete", async () => {
    const author = await createUser("ADMIN");
    const blog = await blogBy(author.id);

    await expectRedirect(actingAs(author.id, () => updateBlog(blog.id, {}, form({ ...validBlog, title: "Intro to DP (v2)" }))));
    expect((await actingAs(author.id, () => setBlogPublished(blog.id, true))).ok).toBeTruthy();
    expect(await prisma.blog.findUniqueOrThrow({ where: { id: blog.id } })).toMatchObject({ title: "Intro to DP (v2)", published: true });

    expect((await actingAs(author.id, () => deleteBlog(blog.id))).ok).toBeTruthy();
    expect(await prisma.blog.count()).toBe(0);
  });

  it("keeps an author in control of their blog after they stop being an admin", async () => {
    const author = await createUser("ADMIN");
    const blog = await blogBy(author.id);
    await prisma.user.update({ where: { id: author.id }, data: { role: "MEMBER" } });

    expect((await actingAs(author.id, () => setBlogPublished(blog.id, true))).ok).toBeTruthy();
    expect((await actingAs(author.id, () => createBlog({}, form(validBlog)))).error).toMatch(/permission/i);
  });
});
