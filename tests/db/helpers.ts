import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Use as `describe.skipIf(!hasTestDb)(...)`: database suites skip cleanly when no test database is configured. */
export const hasTestDb = Boolean(process.env.TEST_DATABASE_URL);

/** What our mocked `redirect()` throws, so tests can assert where an action sends the user. */
export class RedirectSignal extends Error {
  constructor(public readonly url: string) {
    super(`redirect → ${url}`);
  }
}

export async function expectRedirect(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (e) {
    if (e instanceof RedirectSignal) return e.url;
    throw e;
  }
  throw new Error("Expected the action to redirect, but it returned normally.");
}

export function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.append(key, value);
  return fd;
}

export async function resetDb() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE "TeamMember", "blogs", "blog_authors", "blog_categories", "Event", "Session", "Account", "VerificationToken", "User" CASCADE',
  );
}

let n = 0;
export async function createUser(role: Role, name?: string) {
  n += 1;
  return prisma.user.create({
    data: { email: `${role.toLowerCase()}${n}@nitjsr.ac.in`, name: name ?? `${role} ${n}`, role },
  });
}

export const validEvent = {
  title: "Hack Night",
  description: "An evening of building things together.",
  location: "CSE Lab 3",
  startDate: "2026-12-01T18:00",
  endDate: "2026-12-01T22:00",
};

export const validBlog = {
  title: "Intro to DP",
  excerpt: "Dynamic programming breaks a problem down cleanly.",
  content: "Dynamic programming breaks a problem into overlapping subproblems and memoizes state.",
  categoryId: "1",
  authorId: "1",
  status: "draft",
};
