import { execSync } from "node:child_process";
import { loadTestDatabaseUrl } from "./test-env";

/** Runs once before the database tests: recreates the test database from prisma/schema.prisma. */
export default function setup() {
  const url = loadTestDatabaseUrl();
  if (!url) {
    console.warn("\n[db tests] TEST_DATABASE_URL is not set, so database tests are skipped. See README → Tests.\n");
    return;
  }
  if (process.env.SKIP_DB_PUSH === "1") return; // tables already created some other way

  execSync("npx prisma db push --force-reset --skip-generate --accept-data-loss", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url, DIRECT_URL: url },
  });
}
