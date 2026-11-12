import { prisma } from "@/lib/prisma";
import { calculateReadTimeMinutes, slugify } from "@/lib/blog-utils";
import { SEED_CATEGORIES, SEED_AUTHORS, SEED_POSTS } from "@/lib/seed-data";

export type BlogCategoryItem = {
  id: number;
  name: string;
  slug: string;
  hue: number;
  createdAt: Date;
};

export type BlogAuthorItem = {
  id: number;
  memberId: string | null;
  name: string;
  roleTitle: string;
  bio: string;
  avatarUrl: string | null;
  createdAt: Date;
};

export type BlogWithRelations = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  categoryId: number;
  authorId: number;
  status: string;
  isFeatured: boolean;
  readTimeMinutes: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: number;
    name: string;
    slug: string;
    hue: number;
  };
  author: {
    id: number;
    name: string;
    roleTitle: string;
    bio: string;
    avatarUrl: string | null;
  };
};

/**
 * Generate a unique slug for a blog post.
 */
export async function makeUniqueBlogSlug(title: string, currentBlogId?: number): Promise<string> {
  let baseSlug = slugify(title);
  if (!baseSlug) baseSlug = "untitled-post";

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    try {
      const existing = await prisma.blog.findUnique({ where: { slug } });
      if (!existing || existing.id === currentBlogId) {
        return slug;
      }
      counter++;
      slug = `${baseSlug}-${counter}`;
    } catch {
      return baseSlug;
    }
  }
}

const globalForBlogs = globalThis as unknown as {
  inMemoryPosts?: BlogWithRelations[];
  inMemoryCategories?: BlogCategoryItem[];
  inMemoryAuthors?: BlogAuthorItem[];
};

/**
 * Fetch all categories.
 */
export async function getBlogCategories(): Promise<BlogCategoryItem[]> {
  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { name: "asc" },
    });
    if (categories.length > 0) {
      return categories as unknown as BlogCategoryItem[];
    }
  } catch (e) {
    console.warn("getBlogCategories falling back to seed categories:", (e as Error).message);
  }

  if (!globalForBlogs.inMemoryCategories) {
    globalForBlogs.inMemoryCategories = SEED_CATEGORIES.map((c, i) => ({
      id: i + 1,
      name: c.name,
      slug: c.slug,
      hue: c.hue,
      createdAt: new Date(),
    }));
  }
  return globalForBlogs.inMemoryCategories;
}

export function addFallbackCategory(cat: { name: string; slug: string; hue: number }): BlogCategoryItem {
  const categories = globalForBlogs.inMemoryCategories || (globalForBlogs.inMemoryCategories = SEED_CATEGORIES.map((c, i) => ({
    id: i + 1,
    name: c.name,
    slug: c.slug,
    hue: c.hue,
    createdAt: new Date(),
  })));

  const newId = Math.max(...categories.map((c) => c.id), 0) + 1;
  const item: BlogCategoryItem = {
    id: newId,
    name: cat.name,
    slug: cat.slug,
    hue: cat.hue,
    createdAt: new Date(),
  };
  categories.push(item);
  return item;
}

/**
 * Fetch all authors.
 */
export async function getBlogAuthors(): Promise<BlogAuthorItem[]> {
  try {
    const authors = await prisma.blogAuthor.findMany({
      orderBy: { name: "asc" },
    });
    if (authors.length > 0) {
      return authors as unknown as BlogAuthorItem[];
    }
  } catch (e) {
    console.warn("getBlogAuthors falling back to seed authors:", (e as Error).message);
  }

  if (!globalForBlogs.inMemoryAuthors) {
    globalForBlogs.inMemoryAuthors = SEED_AUTHORS.map((a, i) => ({
      id: i + 1,
      memberId: null,
      name: a.name,
      roleTitle: a.roleTitle,
      bio: a.bio,
      avatarUrl: a.avatarUrl,
      createdAt: new Date(),
    }));
  }
  return globalForBlogs.inMemoryAuthors;
}

export function addFallbackAuthor(author: {
  name: string;
  roleTitle: string;
  bio?: string;
  avatarUrl?: string | null;
  memberId?: string | null;
}): BlogAuthorItem {
  const authors = globalForBlogs.inMemoryAuthors || (globalForBlogs.inMemoryAuthors = SEED_AUTHORS.map((a, i) => ({
    id: i + 1,
    memberId: null,
    name: a.name,
    roleTitle: a.roleTitle,
    bio: a.bio,
    avatarUrl: a.avatarUrl,
    createdAt: new Date(),
  })));

  const newId = Math.max(...authors.map((a) => a.id), 0) + 1;
  const item: BlogAuthorItem = {
    id: newId,
    memberId: author.memberId || null,
    name: author.name,
    roleTitle: author.roleTitle,
    bio: author.bio || "",
    avatarUrl: author.avatarUrl || null,
    createdAt: new Date(),
  };
  authors.push(item);
  return item;
}

/**
 * Fallback generator for posts when database is offline during build or initial dev.
 */
export function getFallbackPosts(): BlogWithRelations[] {
  if (!globalForBlogs.inMemoryPosts) {
    globalForBlogs.inMemoryPosts = SEED_POSTS.map((p, i) => {
      const cat = SEED_CATEGORIES.find((c) => c.slug === p.categorySlug) || SEED_CATEGORIES[0];
      const author = SEED_AUTHORS.find((a) => a.name === p.authorName) || SEED_AUTHORS[0];
      return {
        id: i + 1,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        coverImageUrl: null,
        coverImageAlt: null,
        categoryId: i + 1,
        authorId: i + 1,
        status: p.status,
        isFeatured: p.isFeatured,
        readTimeMinutes: calculateReadTimeMinutes(p.content),
        publishedAt: p.publishedAt,
        createdAt: p.publishedAt,
        updatedAt: p.publishedAt,
        category: {
          id: i + 1,
          name: cat.name,
          slug: cat.slug,
          hue: cat.hue,
        },
        author: {
          id: i + 1,
          name: author.name,
          roleTitle: author.roleTitle,
          bio: author.bio,
          avatarUrl: author.avatarUrl,
        },
      };
    });
  }
  return globalForBlogs.inMemoryPosts;
}

/**
 * Fetch published blogs for the public site with optional category filter.
 */
export async function getPublishedBlogs(
  categorySlug?: string,
  limit?: number,
  page: number = 1
): Promise<{
  posts: BlogWithRelations[];
  featuredPost: BlogWithRelations | null;
  total: number;
}> {
  try {
    const whereClause: {
      status: string;
      category?: { slug: string };
    } = {
      status: "published",
    };

    if (categorySlug && categorySlug !== "All" && categorySlug !== "all") {
      whereClause.category = { slug: categorySlug };
    }

    const total = await prisma.blog.count({ where: whereClause });

    const posts = await prisma.blog.findMany({
      where: whereClause,
      include: {
        category: { select: { id: true, name: true, slug: true, hue: true } },
        author: { select: { id: true, name: true, roleTitle: true, bio: true, avatarUrl: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      skip: limit ? (page - 1) * limit : undefined,
      take: limit,
    });

    const featuredPost =
      (!categorySlug || categorySlug === "All" || categorySlug === "all")
        ? posts.find((p) => p.isFeatured) || null
        : null;

    if (posts.length > 0) {
      return {
        posts: posts as unknown as BlogWithRelations[],
        featuredPost: featuredPost as unknown as BlogWithRelations | null,
        total,
      };
    }
  } catch (e) {
    console.warn("getPublishedBlogs falling back to seed posts:", (e as Error).message);
  }

  // Fallback
  let fallback = getFallbackPosts();
  if (categorySlug && categorySlug !== "All" && categorySlug !== "all") {
    fallback = fallback.filter((p) => p.category.slug === categorySlug);
  }
  const featured = fallback.find((p) => p.isFeatured) || null;
  return {
    posts: fallback,
    featuredPost: featured,
    total: fallback.length,
  };
}

/**
 * Fetch a single published post by slug or numeric ID.
 */
export async function getPublishedBlogByIdOrSlug(idOrSlug: string): Promise<BlogWithRelations | null> {
  try {
    const isId = /^\d+$/.test(idOrSlug);
    const where = isId
      ? { id: parseInt(idOrSlug, 10), status: "published" }
      : { slug: idOrSlug, status: "published" };

    const post = await prisma.blog.findFirst({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true, hue: true } },
        author: { select: { id: true, name: true, roleTitle: true, bio: true, avatarUrl: true } },
      },
    });

    if (post) return post as unknown as BlogWithRelations;
  } catch (e) {
    console.warn("getPublishedBlogByIdOrSlug fallback:", (e as Error).message);
  }

  const fallback = getFallbackPosts();
  return (
    fallback.find(
      (p) => p.slug === idOrSlug || String(p.id) === idOrSlug
    ) || null
  );
}

/**
 * Fetch related posts for a blog (same category first).
 */
export async function getRelatedBlogs(currentSlug: string, categoryId: number, limit = 3): Promise<BlogWithRelations[]> {
  try {
    const sameCategory = await prisma.blog.findMany({
      where: {
        status: "published",
        categoryId,
        slug: { not: currentSlug },
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      include: {
        category: { select: { id: true, name: true, slug: true, hue: true } },
        author: { select: { id: true, name: true, roleTitle: true, bio: true, avatarUrl: true } },
      },
    });

    if (sameCategory.length >= limit) {
      return sameCategory as unknown as BlogWithRelations[];
    }

    const needed = limit - sameCategory.length;
    const others = await prisma.blog.findMany({
      where: {
        status: "published",
        categoryId: { not: categoryId },
        slug: { not: currentSlug },
      },
      orderBy: { publishedAt: "desc" },
      take: needed,
      include: {
        category: { select: { id: true, name: true, slug: true, hue: true } },
        author: { select: { id: true, name: true, roleTitle: true, bio: true, avatarUrl: true } },
      },
    });

    return [...sameCategory, ...others] as unknown as BlogWithRelations[];
  } catch (e) {
    console.warn("getRelatedBlogs fallback:", (e as Error).message);
  }

  const fallback = getFallbackPosts().filter((p) => p.slug !== currentSlug);
  const sameCat = fallback.filter((p) => p.categoryId === categoryId);
  const others = fallback.filter((p) => p.categoryId !== categoryId);
  return [...sameCat, ...others].slice(0, limit);
}

/**
 * Create a new blog post.
 */
export async function createBlogPost(data: {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  categoryId: number;
  authorId: number;
  status: "draft" | "published";
  isFeatured?: boolean;
}): Promise<BlogWithRelations> {
  const slug = data.slug || (await makeUniqueBlogSlug(data.title));
  const readTimeMinutes = calculateReadTimeMinutes(data.content);
  const isFeatured = !!data.isFeatured;
  const publishedAt = data.status === "published" ? new Date() : null;

  try {
    if (isFeatured) {
      await prisma.blog.updateMany({
        where: { isFeatured: true },
        data: { isFeatured: false },
      });
    }

    const created = await prisma.blog.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImageUrl: data.coverImageUrl || null,
        coverImageAlt: data.coverImageAlt || null,
        categoryId: data.categoryId,
        authorId: data.authorId,
        status: data.status,
        isFeatured,
        readTimeMinutes,
        publishedAt,
      },
      include: {
        category: true,
        author: true,
      },
    });

    return created as unknown as BlogWithRelations;
  } catch (err) {
    console.warn("createBlogPost database offline, fallback to in-memory store:", (err as Error).message);
    const posts = getFallbackPosts();
    const categories = await getBlogCategories();
    const authors = await getBlogAuthors();
    const cat = categories.find((c: BlogCategoryItem) => Number(c.id) === Number(data.categoryId)) || categories[0] || {
      id: Number(data.categoryId),
      name: "General",
      slug: "general",
      hue: 160,
      createdAt: new Date(),
    };
    const author = authors.find((a: BlogAuthorItem) => Number(a.id) === Number(data.authorId)) || authors[0] || {
      id: Number(data.authorId),
      memberId: null,
      name: "PCON Team",
      roleTitle: "Club Member",
      bio: "",
      avatarUrl: null,
      createdAt: new Date(),
    };
    const newId = posts.length > 0 ? Math.max(...posts.map((p) => p.id)) + 1 : 1;

    if (isFeatured) {
      posts.forEach((p) => {
        p.isFeatured = false;
      });
    }

    const newPost: BlogWithRelations = {
      id: newId,
      slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      coverImageUrl: data.coverImageUrl || null,
      coverImageAlt: data.coverImageAlt || null,
      categoryId: data.categoryId,
      authorId: data.authorId,
      status: data.status,
      isFeatured,
      readTimeMinutes,
      publishedAt,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        hue: cat.hue,
      },
      author: {
        id: author.id,
        name: author.name,
        roleTitle: author.roleTitle,
        bio: author.bio,
        avatarUrl: author.avatarUrl ?? null,
      },
    };

    posts.unshift(newPost);
    return newPost;
  }
}

/**
 * Update an existing blog post.
 */
export async function updateBlogPost(
  id: number,
  data: {
    title: string;
    slug?: string;
    excerpt: string;
    content: string;
    coverImageUrl?: string | null;
    coverImageAlt?: string | null;
    categoryId: number;
    authorId: number;
    status: "draft" | "published";
    isFeatured?: boolean;
  }
): Promise<BlogWithRelations> {
  try {
    const current = await prisma.blog.findUniqueOrThrow({ where: { id } });
    const slug = data.slug && data.slug !== current.slug ? await makeUniqueBlogSlug(data.slug, id) : current.slug;
    const readTimeMinutes = calculateReadTimeMinutes(data.content);
    const isFeatured = !!data.isFeatured;

    if (isFeatured) {
      await prisma.blog.updateMany({
        where: { isFeatured: true, id: { not: id } },
        data: { isFeatured: false },
      });
    }

    let publishedAt = current.publishedAt;
    if (data.status === "published" && !current.publishedAt) {
      publishedAt = new Date();
    } else if (data.status === "draft") {
      // Keep original publishedAt or set to null
    }

    const updated = await prisma.blog.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImageUrl: data.coverImageUrl || null,
        coverImageAlt: data.coverImageAlt || null,
        categoryId: data.categoryId,
        authorId: data.authorId,
        status: data.status,
        isFeatured,
        readTimeMinutes,
        publishedAt,
      },
      include: {
        category: true,
        author: true,
      },
    });

    return updated as unknown as BlogWithRelations;
  } catch (err) {
    console.warn("updateBlogPost database offline, updating in-memory store:", (err as Error).message);
    const posts = getFallbackPosts();
    const idx = posts.findIndex((p) => p.id === id);
    const categories = await getBlogCategories();
    const authors = await getBlogAuthors();
    const cat = categories.find((c: BlogCategoryItem) => Number(c.id) === Number(data.categoryId)) || categories[0] || {
      id: Number(data.categoryId),
      name: "General",
      slug: "general",
      hue: 160,
      createdAt: new Date(),
    };
    const author = authors.find((a: BlogAuthorItem) => Number(a.id) === Number(data.authorId)) || authors[0] || {
      id: Number(data.authorId),
      memberId: null,
      name: "PCON Team",
      roleTitle: "Club Member",
      bio: "",
      avatarUrl: null,
      createdAt: new Date(),
    };

    const isFeatured = !!data.isFeatured;
    if (isFeatured) {
      posts.forEach((p) => {
        if (p.id !== id) p.isFeatured = false;
      });
    }

    const updated: BlogWithRelations = {
      ...(idx >= 0 ? posts[idx] : ({} as BlogWithRelations)),
      id,
      slug: data.slug || `post-${id}`,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      coverImageUrl: data.coverImageUrl || null,
      coverImageAlt: data.coverImageAlt || null,
      categoryId: data.categoryId,
      authorId: data.authorId,
      status: data.status,
      isFeatured,
      readTimeMinutes: calculateReadTimeMinutes(data.content),
      publishedAt: data.status === "published" ? new Date() : null,
      createdAt: idx >= 0 ? posts[idx].createdAt : new Date(),
      updatedAt: new Date(),
      category: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        hue: cat.hue,
      },
      author: {
        id: author.id,
        name: author.name,
        roleTitle: author.roleTitle,
        bio: author.bio,
        avatarUrl: author.avatarUrl ?? null,
      },
    };

    if (idx >= 0) {
      posts[idx] = updated;
    } else {
      posts.unshift(updated);
    }
    return updated;
  }
}

/**
 * Delete a blog post.
 */
export async function deleteBlogPost(id: number): Promise<{ id: number }> {
  try {
    const deleted = await prisma.blog.delete({ where: { id } });
    return { id: deleted.id };
  } catch (err) {
    console.warn("deleteBlogPost database offline, deleting from in-memory store:", (err as Error).message);
    const posts = getFallbackPosts();
    const idx = posts.findIndex((p) => p.id === id);
    if (idx >= 0) {
      posts.splice(idx, 1);
    }
    return { id };
  }
}

/**
 * Fetch all blogs for the admin panel, with database fallback.
 */
export async function getAllBlogsAdmin(): Promise<BlogWithRelations[]> {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        category: { select: { id: true, name: true, slug: true, hue: true } },
        author: { select: { id: true, name: true, roleTitle: true, bio: true, avatarUrl: true } },
      },
    });
    if (blogs && blogs.length > 0) {
      return blogs as unknown as BlogWithRelations[];
    }
  } catch (err) {
    console.warn("getAllBlogsAdmin database offline, fallback to in-memory store:", (err as Error).message);
  }
  return getFallbackPosts();
}

/**
 * Update author avatar in database and in fallback stores.
 */
export async function updateAuthorAvatar(authorId: number, avatarUrl: string): Promise<void> {
  if (!avatarUrl) return;
  try {
    await prisma.blogAuthor.update({
      where: { id: authorId },
      data: { avatarUrl },
    });
  } catch {
    // fallback if DB is offline
  }

  // Update in-memory author list
  if (globalForBlogs.inMemoryAuthors) {
    const author = globalForBlogs.inMemoryAuthors.find((a) => a.id === authorId);
    if (author) author.avatarUrl = avatarUrl;
  }
  // Update in-memory posts with this author
  const posts = getFallbackPosts();
  posts.forEach((p) => {
    if (p.authorId === authorId) {
      p.author.avatarUrl = avatarUrl;
    }
  });
}
