import { describe, expect, it } from "vitest";
import { authenticateMcpRequest, buildMcpSignatureHeaders, claimMcpRequestId, parseMcpRole } from "./mcp-transport";
import { cleanupExpiredNonces } from "./retention";

describe("MCP transport authentication", () => {
  it("accepts only explicit operator and reviewer roles", () => {
    expect(parseMcpRole("operator")).toBe("operator");
    expect(parseMcpRole("reviewer")).toBe("reviewer");
    expect(parseMcpRole("admin")).toBeNull();
    expect(parseMcpRole(null)).toBeNull();
  });

  it("creates a signed header set with a request id", async () => {
    const headers = await buildMcpSignatureHeaders("secret", "{}", 1_757_584_000, "request-1", "operator");
    expect(headers.get("x-mcp-role")).toBe("operator");
    expect(headers.get("x-mcp-request-id")).toBe("request-1");
    expect(headers.get("x-mcp-signature")).toMatch(/^[a-f0-9]{64}$/);
  });

  it("infers the operator role from a standard bearer token", async () => {
    const request = new Request("https://outreach.example/mcp", {
      method: "POST",
      headers: { authorization: "Bearer operator-secret" },
      body: JSON.stringify({ method: "initialize" }),
    });

    await expect(authenticateMcpRequest(request, { operator: "operator-secret", reviewer: "reviewer-secret" }, "{}"))
      .resolves.toMatchObject({ role: "operator", kind: "bearer" });
  });

  it("infers the reviewer role from a standard bearer token", async () => {
    const request = new Request("https://outreach.example/mcp", {
      method: "POST",
      headers: { authorization: "Bearer reviewer-secret" },
      body: JSON.stringify({ method: "initialize" }),
    });

    await expect(authenticateMcpRequest(request, { operator: "operator-secret", reviewer: "reviewer-secret" }, "{}"))
      .resolves.toMatchObject({ role: "reviewer", kind: "bearer" });
  });

  it("rejects an invalid bearer token", async () => {
    const request = new Request("https://outreach.example/mcp", {
      method: "POST",
      headers: { authorization: "Bearer wrong-secret" },
      body: JSON.stringify({ method: "initialize" }),
    });

    await expect(authenticateMcpRequest(request, { operator: "operator-secret", reviewer: "reviewer-secret" }, "{}"))
      .resolves.toBeNull();
  });

  it("claims a signed request id once per role", async () => {
    const claimed = new Set<string>();
    const db = {
      prepare(sql: string) {
        expect(sql).toContain("INSERT OR IGNORE INTO request_nonces");
        return {
          bind(scope: string, requestId: string) {
            return {
              run: async () => {
                const key = `${scope}:${requestId}`;
                if (claimed.has(key)) return { meta: { changes: 0 } };
                claimed.add(key);
                return { meta: { changes: 1 } };
              },
            };
          },
        };
      },
    } as unknown as D1Database;

    await expect(claimMcpRequestId(db, "operator", "request-1", "2026-09-16T07:00:00.000Z")).resolves.toBe(true);
    await expect(claimMcpRequestId(db, "operator", "request-1", "2026-09-16T07:00:00.000Z")).resolves.toBe(false);
    await expect(claimMcpRequestId(db, "reviewer", "request-1", "2026-09-16T07:00:00.000Z")).resolves.toBe(true);
  });

  it("retains a future-dated signed MCP nonce through its full signature window", async () => {
    let values: unknown[] = [];
    const db = {
      prepare: () => ({
        bind: (...bound: unknown[]) => {
          values = bound;
          return { run: async () => ({ meta: { changes: 1 } }) };
        },
      }),
    } as unknown as D1Database;
    const signedTimestamp = Date.parse("2026-09-16T07:05:00.000Z") / 1_000;

    await claimMcpRequestId(db, "operator", "future-request", "2026-09-16T07:00:00.000Z", signedTimestamp);

    expect(values[2]).toBe("2026-09-16T07:10:01.000Z");
  });

  it("keeps a future-dated MCP nonce through the final valid second, rejecting its replay after cleanup", async () => {
    const entries = new Map<string, { scope: string; requestId: string; expiresAt: string }>();
    const keyFor = (scope: string, requestId: string) => `${scope}\u0000${requestId}`;
    const db = {
      prepare(sql: string) {
        if (sql.startsWith("INSERT OR IGNORE")) {
          return { bind: (scope: string, requestId: string, expiresAt: string) => ({ run: async () => {
            const key = keyFor(scope, requestId);
            if (entries.has(key)) return { meta: { changes: 0 } };
            entries.set(key, { scope, requestId, expiresAt });
            return { meta: { changes: 1 } };
          } }) };
        }
        if (sql.startsWith("SELECT scope, request_id")) {
          return { bind: (now: string) => ({ all: async () => ({ results: [...entries.values()]
            .filter(({ expiresAt }) => expiresAt <= now)
            .map(({ scope, requestId }) => ({ scope, request_id: requestId })) }) }) };
        }
        return { bind: (scope: string, requestId: string, now: string) => ({ run: async () => {
          const key = keyFor(scope, requestId);
          if ((entries.get(key)?.expiresAt ?? "") > now) return { meta: { changes: 0 } };
          return { meta: { changes: entries.delete(key) ? 1 : 0 } };
        } }) };
      },
    } as unknown as D1Database;
    const signedTimestamp = Date.parse("2026-09-16T07:05:00.000Z") / 1_000;

    await expect(claimMcpRequestId(db, "operator", "future-request", "2026-09-16T07:00:00.000Z", signedTimestamp)).resolves.toBe(true);
    await expect(cleanupExpiredNonces(db, "2026-09-16T07:10:00.000Z")).resolves.toEqual({ deleted: 0 });
    await expect(claimMcpRequestId(db, "operator", "future-request", "2026-09-16T07:10:00.000Z", signedTimestamp)).resolves.toBe(false);
    await expect(cleanupExpiredNonces(db, "2026-09-16T07:10:01.000Z")).resolves.toEqual({ deleted: 1 });
  });

  it("binds a signed request id to its signature", async () => {
    const body = JSON.stringify({ method: "initialize" });
    const headers = await buildMcpSignatureHeaders("operator-secret", body, Math.floor(Date.now() / 1000), "request-1", "operator");
    headers.set("x-mcp-request-id", "request-2");
    const request = new Request("https://outreach.example/mcp", { method: "POST", headers, body });

    await expect(authenticateMcpRequest(request, { operator: "operator-secret", reviewer: "reviewer-secret" }, body)).resolves.toBeNull();
  });

  it("rejects a signed header outside the timestamp window", async () => {
    const body = JSON.stringify({ method: "initialize" });
    const headers = await buildMcpSignatureHeaders("operator-secret", body, Math.floor(Date.now() / 1000) - 301, "request-1", "operator");
    const request = new Request("https://outreach.example/mcp", { method: "POST", headers, body });

    await expect(authenticateMcpRequest(request, { operator: "operator-secret", reviewer: "reviewer-secret" }, body)).resolves.toBeNull();
  });
});
