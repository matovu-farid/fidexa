import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { ensureApiRateLimitSetup, getIdempotentRateLimitStatements } from "../../scripts/ensure-api-rate-limit";

describe("Vercel rate limit schema setup", () => {
  it("runs before Next.js build so a missing schema cannot ship to preview or production", async () => {
    const packageJson = JSON.parse(await readFile(new URL("../../package.json", import.meta.url), "utf8"));

    expect(packageJson.scripts.prebuild).toBe("node --import tsx scripts/ensure-api-rate-limit.ts");
  });

  it("turns only the checked-in limiter table and unique index DDL into idempotent statements", async () => {
    const migration = await readFile(new URL("../../drizzle/0001_api_rate_limit.sql", import.meta.url), "utf8");

    const statements = getIdempotentRateLimitStatements(migration);

    expect(statements).toHaveLength(2);
    expect(statements[0]).toMatch(/^CREATE TABLE IF NOT EXISTS "api_rate_limit"/);
    expect(statements[1]).toMatch(/^CREATE UNIQUE INDEX IF NOT EXISTS "api_rate_limit_key_route_window_idx" ON "api_rate_limit"/);
    expect(statements.join("\n")).not.toMatch(/admin_auth|CREATE TABLE .*user/i);
  });

  it.each(["preview", "production"]) ("fails closed on Vercel %s when DATABASE_URL is missing", async (vercelEnv) => {
    const apply = async () => { throw new Error("must not connect"); };

    await expect(ensureApiRateLimitSetup({ VERCEL: "1", VERCEL_ENV: vercelEnv }, apply))
      .rejects.toThrow("DATABASE_URL is required");
  });

  it("fails closed in CI when Vercel system environment variables are hidden", async () => {
    const apply = async () => { throw new Error("must not connect"); };

    await expect(ensureApiRateLimitSetup({ CI: "1" }, apply)).rejects.toThrow("DATABASE_URL is required");
  });

  it("skips local builds without DATABASE_URL", async () => {
    let applyCalls = 0;

    const result = await ensureApiRateLimitSetup({}, async () => { applyCalls += 1; });

    expect(result).toBe("skipped");
    expect(applyCalls).toBe(0);
  });

  it("applies only the limiter DDL to the configured database and propagates setup errors", async () => {
    const databaseUrl = "postgres://preview-db/secret-not-for-logs";
    const applied: { url: string; statements: string[] }[] = [];
    const result = await ensureApiRateLimitSetup(
      { VERCEL: "1", VERCEL_ENV: "preview", DATABASE_URL: databaseUrl },
      async (url, statements) => { applied.push({ url, statements }); },
    );

    expect(result).toBe("ready");
    expect(applied).toHaveLength(1);
    expect(applied[0].url).toBe(databaseUrl);
    expect(applied[0].statements).toHaveLength(2);
    expect(applied[0].statements.join("\n")).toContain("api_rate_limit");

    await expect(ensureApiRateLimitSetup(
      { VERCEL: "1", VERCEL_ENV: "preview", DATABASE_URL: databaseUrl },
      async () => { throw new Error("database unavailable"); },
    )).rejects.toThrow("database unavailable");
  });
});
