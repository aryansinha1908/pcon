import { afterAll, beforeEach, vi } from "vitest";
import { loadTestDatabaseUrl } from "./test-env";

// Point the app's Prisma client at the test database before anything imports it.
const testUrl = loadTestDatabaseUrl();
if (testUrl) {
  process.env.DATABASE_URL = testUrl;
  process.env.DIRECT_URL = testUrl;
}
process.env.ALLOWED_EMAIL_DOMAIN = "nitjsr.ac.in";

// Auth.js → our test session store (see session.ts).
vi.mock("@/auth", async () => {
  const { currentSession } = await import("./session");
  return { auth: () => currentSession(), signIn: vi.fn(), signOut: vi.fn(), handlers: { GET: vi.fn(), POST: vi.fn() } };
});

// Next's request-only helpers, which don't work outside a running app.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
vi.mock("next/navigation", async () => {
  const { RedirectSignal } = await import("./helpers");
  return {
    redirect: (url: string) => {
      throw new RedirectSignal(url);
    },
    notFound: () => {
      throw new Error("NEXT_NOT_FOUND");
    },
  };
});

if (testUrl) {
  beforeEach(async () => {
    const { resetDb } = await import("./helpers");
    await resetDb();
  });
  afterAll(async () => {
    const { prisma } = await import("@/lib/prisma");
    await prisma.$disconnect();
  });
}
