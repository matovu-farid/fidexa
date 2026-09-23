import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import postgres from "postgres";

const migrationUrl = new URL("../drizzle/0001_api_rate_limit.sql", import.meta.url);
const MISSING_DATABASE_URL = "DATABASE_URL is required for deployment builds that prepare api_rate_limit";

export type SetupEnvironment = {
  CI?: string;
  VERCEL?: string;
  VERCEL_ENV?: string;
  DATABASE_URL?: string;
};

export function requiresRateLimitSetup(env: SetupEnvironment): boolean {
  const isCiBuild = env.CI === "1" || env.CI?.toLowerCase() === "true";
  const isVercelProductionOrPreview = env.VERCEL === "1"
    && (env.VERCEL_ENV === "production" || env.VERCEL_ENV === "preview");
  return isCiBuild || isVercelProductionOrPreview;
}

export function getIdempotentRateLimitStatements(migration: string): string[] {
  const statements = migration
    .split(/-->\s*statement-breakpoint\s*/i)
    .map((statement) => statement.trim())
    .filter(Boolean);

  const [createTable, createIndex] = statements;
  const expectedTable = /^CREATE TABLE\s+"api_rate_limit"\s*\(/i;
  const expectedIndex = /^CREATE UNIQUE INDEX\s+"api_rate_limit_key_route_window_idx"\s+ON\s+"api_rate_limit"\s+USING\s+btree\s*\("key_hash",\s*"route",\s*"window_started_at"\)/i;

  if (
    statements.length !== 2
    || !expectedTable.test(createTable ?? "")
    || !expectedIndex.test(createIndex ?? "")
  ) {
    throw new Error("The api_rate_limit migration does not match the expected table and index DDL");
  }

  return [
    createTable.replace(/^CREATE TABLE\s+/i, "CREATE TABLE IF NOT EXISTS "),
    createIndex.replace(/^CREATE UNIQUE INDEX\s+/i, "CREATE UNIQUE INDEX IF NOT EXISTS "),
  ];
}

type ApplyStatements = (databaseUrl: string, statements: string[]) => Promise<void>;

export async function ensureApiRateLimitSetup(
  env: SetupEnvironment,
  applyStatements: ApplyStatements,
): Promise<"skipped" | "ready"> {
  if (!requiresRateLimitSetup(env)) return "skipped";
  if (!env.DATABASE_URL) throw new Error(MISSING_DATABASE_URL);

  const migration = await readFile(migrationUrl, "utf8");
  const statements = getIdempotentRateLimitStatements(migration);
  await applyStatements(env.DATABASE_URL, statements);
  return "ready";
}

async function applyToPostgres(databaseUrl: string, statements: string[]): Promise<void> {
  const db = postgres(databaseUrl, {
    max: 1,
    prepare: false,
    connect_timeout: 10,
    idle_timeout: 5,
  });

  try {
    await db.begin(async (transaction) => {
      for (const statement of statements) await transaction.unsafe(statement);
    });

    await db.unsafe("SELECT key_hash, route, window_started_at, hits FROM api_rate_limit LIMIT 0");
    const indexes = await db.unsafe(
      "SELECT indexdef FROM pg_indexes WHERE schemaname = current_schema() AND tablename = 'api_rate_limit' AND indexname = 'api_rate_limit_key_route_window_idx'",
    ) as Array<{ indexdef: string }>;
    const indexDefinition = indexes[0]?.indexdef?.replaceAll('"', "").replace(/\s+/g, " ").toLowerCase();
    if (!indexDefinition || !/^create unique index api_rate_limit_key_route_window_idx on (?:[a-z0-9_]+\.)?api_rate_limit using btree \(key_hash, route, window_started_at\)$/.test(indexDefinition)) {
      throw new Error("The api_rate_limit unique index is missing or incompatible");
    }
  } finally {
    await db.end({ timeout: 5 });
  }
}

function isMainModule(): boolean {
  const entry = process.argv[1];
  return Boolean(entry && import.meta.url === pathToFileURL(resolve(entry)).href);
}

function sanitizedFailure(error: unknown): string {
  if (error instanceof Error && error.message === MISSING_DATABASE_URL) return error.message;
  if (error instanceof Error && error.message.startsWith("The api_rate_limit")) return error.message;
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string" && /^[0-9A-Z]{5}$/.test(code)) return `Postgres setup failed (SQLSTATE ${code})`;
  }
  return "Postgres setup failed; database details were withheld";
}

if (isMainModule()) {
  ensureApiRateLimitSetup(process.env as SetupEnvironment, applyToPostgres)
    .then((result) => {
      if (result === "ready") console.log("api_rate_limit schema is ready");
    })
    .catch((error: unknown) => {
      console.error(`[rate-limit-setup] ${sanitizedFailure(error)}`);
      process.exitCode = 1;
    });
}
