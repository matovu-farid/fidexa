import { describe, expect, it } from "vitest";
import { cleanupExpiredEvidence, cleanupExpiredNonces } from "./retention";
import type { OutreachEnv } from "./env";

describe("evidence retention", () => {
  it("deletes the object before its D1 reference", async () => {
    const order: string[] = [];
    const db = {
      prepare(sql: string) {
        return {
          bind() {
            return {
              all: async () => ({ results: [{ id: "e1", object_key: "research/c/r/e.md" }] }),
              run: async () => { order.push("d1"); return { success: true }; },
            };
          },
        };
      },
      batch: async (statements: Array<{ run: () => Promise<unknown> }>) => {
        for (const statement of statements) await statement.run();
        return [];
      },
    } as unknown as D1Database;
    const bucket = { delete: async () => { order.push("r2"); } } as unknown as R2Bucket;
    await cleanupExpiredEvidence({ OUTREACH_DB: db, OUTREACH_BUCKET: bucket } as OutreachEnv, "2026-09-11T08:00:00.000Z", 1);
    expect(order.slice(0, 2)).toEqual(["r2", "d1"]);
  });

  it("only deletes expired request nonces in bounded batches", async () => {
    const deleted: Array<{ scope: string; requestId: string; now: string }> = [];
    const db = {
      prepare(sql: string) {
        if (sql.startsWith("SELECT scope, request_id FROM request_nonces")) {
          return { bind: () => ({ all: async () => ({ results: [{ scope: "mcp:operator", request_id: "old-request" }] }) }) };
        }
        expect(sql).toContain("DELETE FROM request_nonces WHERE scope = ? AND request_id = ? AND expires_at <= ?");
        return {
          bind(scope: string, requestId: string, now: string) {
            return { run: async () => { deleted.push({ scope, requestId, now }); return { success: true, meta: { changes: 1 } }; } };
          },
        };
      },
    } as unknown as D1Database;

    await expect(cleanupExpiredNonces(db, "2026-09-16T07:00:00.000Z", 1)).resolves.toEqual({ deleted: 1 });
    expect(deleted).toEqual([{ scope: "mcp:operator", requestId: "old-request", now: "2026-09-16T07:00:00.000Z" }]);
  });

  it("audits retention object failures even when no expired evidence can be deleted", async () => {
    const queries: string[] = [];
    const db = {
      prepare(sql: string) {
        queries.push(sql);
        return {
          bind() {
            return {
              all: async () => ({ results: [{ id: "e1", object_key: "research/c/r/e.md" }] }),
              run: async () => ({ success: true, meta: { changes: 1 } }),
            };
          },
        };
      },
    } as unknown as D1Database;
    const bucket = { delete: async () => { throw new Error("R2 unavailable"); } } as unknown as R2Bucket;

    await expect(cleanupExpiredEvidence({ OUTREACH_DB: db, OUTREACH_BUCKET: bucket } as OutreachEnv, "2026-09-11T08:00:00.000Z", 1))
      .resolves.toEqual({ deleted: 0, failed: 1 });

    expect(queries.some((sql) => sql.includes("workflow_events") && sql.includes("retention_cleanup"))).toBe(true);
  });

  it("commits each D1 evidence deletion together with its count-only audit", async () => {
    const batches: unknown[][] = [];
    const db = {
      prepare(sql: string) {
        return {
          bind() {
            return {
              all: async () => ({ results: [{ id: "e1", object_key: "research/c/r/e.md" }] }),
              run: async () => ({ success: true, meta: { changes: 1 } }),
              sql,
            };
          },
        };
      },
      batch: async (statements: unknown[]) => { batches.push(statements); return []; },
    } as unknown as D1Database;
    const bucket = { delete: async () => undefined } as unknown as R2Bucket;

    await cleanupExpiredEvidence({ OUTREACH_DB: db, OUTREACH_BUCKET: bucket } as OutreachEnv, "2026-09-11T08:00:00.000Z", 1);

    expect(batches).toHaveLength(1);
    expect(batches[0]).toHaveLength(2);
  });

  it("reports only failed rows in the final mixed-result retention audit", async () => {
    const auditPayloads: string[] = [];
    const db = {
      prepare(sql: string) { return { bind(...args: unknown[]) { return { all: async () => ({ results: [{ id: "good", object_key: "good" }, { id: "bad", object_key: "bad" }] }), run: async () => { if (sql.includes("workflow_events")) auditPayloads.push(String(args.at(-2))); return { success: true, meta: { changes: 1 } }; } }; } }; },
      batch: async () => [],
    } as unknown as D1Database;
    const bucket = { delete: async (key: string) => { if (key === "bad") throw new Error("missing"); } } as unknown as R2Bucket;
    await expect(cleanupExpiredEvidence({ OUTREACH_DB: db, OUTREACH_BUCKET: bucket } as OutreachEnv, "2026-09-11T08:00:00.000Z", 2)).resolves.toEqual({ deleted: 1, failed: 1 });
    expect(auditPayloads).toContain(JSON.stringify({ failed: 1 }));
    expect(auditPayloads).not.toContain(JSON.stringify({ deleted: 1, failed: 1 }));
  });
});
