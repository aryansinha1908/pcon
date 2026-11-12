/**
 * Database tests wipe every table, so they only ever run against a database
 * set in TEST_DATABASE_URL — never DATABASE_URL — and its name must contain "test".
 */
export function loadTestDatabaseUrl(): string | undefined {
  try {
    process.loadEnvFile(".env");
  } catch {
    // no .env file: fine in CI, where variables come from the environment
  }
  const url = process.env.TEST_DATABASE_URL;
  if (!url) return undefined;

  const dbName = new URL(url).pathname.replace(/^\//, "");
  if (!/test/i.test(dbName)) {
    throw new Error(`TEST_DATABASE_URL must point at a database whose name contains "test" (got "${dbName}"). The tests delete all data in it.`);
  }
  if (url === process.env.DATABASE_URL) {
    throw new Error("TEST_DATABASE_URL must be different from DATABASE_URL. The tests delete all data in it.");
  }
  return url;
}
