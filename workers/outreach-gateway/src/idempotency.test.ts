import { describe, expect, it } from "vitest";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { abortIdempotentMutation, beginIdempotentMutation } from "./idempotency";

function sqliteD1(sqlite: DatabaseSync): D1Database {
  return {
    prepare(sql: string) {
      const statement = sqlite.prepare(sql);
      return { bind(...args: unknown[]) { return {
        run: async () => { const result = statement.run(...args as SQLInputValue[]); return { meta: { changes: result.changes } }; },
        first: async <T>() => (statement.get(...args as SQLInputValue[]) as T | undefined) ?? null,
      }; } };
    },
  } as unknown as D1Database;
}

function idempotencyDatabase() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(`CREATE TABLE workflow_events (
    id TEXT PRIMARY KEY, schema_version INTEGER NOT NULL, entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL, actor_type TEXT NOT NULL, credential_role TEXT,
    tool_name TEXT NOT NULL, workflow_run_id TEXT, company_id TEXT,
    idempotency_key TEXT, previous_state TEXT, next_state TEXT,
    metadata_json TEXT NOT NULL, created_at TEXT NOT NULL
  ); CREATE UNIQUE INDEX workflow_events_idempotency_unique
    ON workflow_events(entity_type, idempotency_key) WHERE idempotency_key IS NOT NULL;`);
  return { sqlite, db: sqliteD1(sqlite) };
}

describe("workflow idempotency", () => {
  it("reserves a key with a parameterized workflow event", async () => {
    const calls: string[] = [];
    const bindings: unknown[][] = [];
    const db = {
      prepare(sql: string) {
        calls.push(sql);
        return {
          bind(...args: unknown[]) {
            bindings.push(args);
            return {
              run: async () => ({ success: true }),
              first: async () => ({ metadata_json: JSON.stringify({ request_hash: "wrong", status: "started" }) }),
            };
          },
        };
      },
    } as unknown as D1Database;

    await expect(beginIdempotentMutation({ db, entityType: "company", entityId: "c1", actorType: "codex", credentialRole: "operator", toolName: "create_company", workflowRunId: "run-1", companyId: "company-1", idempotencyKey: "key-1", input: { name: "Example" }, now: "2026-09-11T08:00:00.000Z" })).rejects.toThrow("different payload");
    expect(calls[0]).toContain("INSERT OR IGNORE");
    expect(calls[0]).toContain("company_id");
    expect(bindings[0]?.[7]).toBe("company-1");
  });

  it("allows exactly one concurrent owner for a non-send idempotency key", async () => {
    const { sqlite, db } = idempotencyDatabase();
    const input = { db, entityType: "company", entityId: "c1", actorType: "codex", credentialRole: "operator", toolName: "create_company", workflowRunId: "run-1", idempotencyKey: "same-key", input: { name: "Example" }, now: "2026-09-11T08:00:00.000Z" };
    const results = await Promise.allSettled([beginIdempotentMutation(input), beginIdempotentMutation(input)]);
    expect(results.filter((result) => result.status === "fulfilled" && result.value.status === "new")).toHaveLength(1);
    expect(results.filter((result) => result.status === "rejected" && String(result.reason).includes("already in progress"))).toHaveLength(1);
    expect(sqlite.prepare("SELECT COUNT(*) AS count FROM workflow_events").get()).toEqual({ count: 1 });
    sqlite.close();
  });

  it("releases only the winning owner's failed claim so an identical retry can proceed", async () => {
    const { sqlite, db } = idempotencyDatabase();
    const input = { db, entityType: "company", entityId: "c1", actorType: "codex", credentialRole: "operator", toolName: "create_company", workflowRunId: "run-1", idempotencyKey: "retry-key", input: { name: "Example" }, now: "2026-09-11T08:00:00.000Z" };

    const first = await beginIdempotentMutation(input);
    if (first.status !== "new") throw new Error("Expected initial owner");
    await abortIdempotentMutation(db, "company", "retry-key", first.ownerToken);
    const retry = await beginIdempotentMutation(input);

    expect(retry.status).toBe("new");
    sqlite.close();
  });
});
