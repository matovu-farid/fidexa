import { describe, expect, it } from "vitest";
import worker from "./index";
import { buildMcpSignatureHeaders } from "./mcp-transport";
import { limits } from "./limits";

describe("outreach Worker boundary", () => {
  it("rejects MCP requests without signed credentials", async () => {
    const response = await worker.fetch(new Request("https://outreach.example/mcp", { method: "POST", body: "{}" }), {} as Env);
    expect(response.status).toBe(401);
  });

  it("does not expose unknown routes", async () => {
    const response = await worker.fetch(new Request("https://outreach.example/unknown"), {} as Env);
    expect(response.status).toBe(404);
  });

  it("rejects a replayed signed MCP request id", async () => {
    const claimed = new Set<string>();
    const db = {
      prepare() {
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
    const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "test", version: "1" } } });
    const headers = await buildMcpSignatureHeaders("operator-secret", body, Math.floor(Date.now() / 1000), "request-1", "operator");
    const env = { OUTREACH_DB: db, MCP_OPERATOR_SECRET: "operator-secret", MCP_REVIEWER_SECRET: "reviewer-secret" } as Env;
    const makeRequest = () => new Request("https://outreach.example/mcp", { method: "POST", headers, body });

    const first = await worker.fetch(makeRequest(), env);
    const replay = await worker.fetch(makeRequest(), env);

    expect(first.status).not.toBe(401);
    expect(replay.status).toBe(401);
  });

  it("rejects oversized declared bodies for MCP and Resend webhooks before parsing", async () => {
    const headers = { "content-length": String(limits.requestBytes + 1) };

    await expect(worker.fetch(new Request("https://outreach.example/mcp", { method: "POST", headers, body: "x" }), {} as Env)).resolves.toMatchObject({ status: 413 });
    await expect(worker.fetch(new Request("https://outreach.example/webhooks/resend", { method: "POST", headers, body: "x" }), {} as Env)).resolves.toMatchObject({ status: 413 });
  });

  it("rejects oversized chunked bodies for MCP and Resend webhooks before parsing", async () => {
    const oversizedStream = () => new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("x".repeat(limits.requestBytes + 1)));
        controller.close();
      },
    });
    const request = (path: string) => new Request(`https://outreach.example${path}`, {
      method: "POST",
      body: oversizedStream(),
      duplex: "half",
    } as RequestInit);

    await expect(worker.fetch(request("/mcp"), {} as Env)).resolves.toMatchObject({ status: 413 });
    await expect(worker.fetch(request("/webhooks/resend"), {} as Env)).resolves.toMatchObject({ status: 413 });
  });

  it("audits scheduled Zoho failures while retention work continues independently", async () => {
    const queries: string[] = [];
    const db = {
      prepare(sql: string) {
        queries.push(sql);
        return {
          bind() {
            return {
              all: async () => ({ results: [] }),
              run: async () => ({ success: true, meta: { changes: 1 } }),
            };
          },
        };
      },
    } as unknown as D1Database;
    const pending: Promise<unknown>[] = [];
    const ctx = { waitUntil: (promise: Promise<unknown>) => pending.push(promise) } as unknown as ExecutionContext;

    await worker.scheduled({ scheduledTime: Date.parse("2026-09-11T08:00:00.000Z") } as ScheduledController, {
      OUTREACH_DB: db,
      OUTREACH_BUCKET: {} as R2Bucket,
      SYNC_ENABLED: "true",
      ZOHO_MAILBOX: "hello@fidexa.org",
      ZOHO_FOLDER_ID: "inbox",
    } as unknown as Env, ctx);
    await Promise.all(pending);

    expect(queries.some((sql) => sql.includes("request_nonces"))).toBe(true);
    expect(queries.some((sql) => sql.includes("workflow_events") && sql.includes("scheduled_task_failed"))).toBe(true);
  });
});
