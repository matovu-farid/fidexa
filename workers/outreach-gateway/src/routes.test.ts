import { describe, expect, it, vi } from "vitest";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { readFileSync } from "node:fs";
import { authenticateReadRequest, handleReportingRequest } from "./routes";
import { signReadRequest } from "./signatures";
import { cleanupExpiredNonces } from "./retention";
import { recordResendEvent } from "./resend-webhook";
import { syncZohoReplies } from "./zoho";
import type { OutreachEnv } from "./env";

describe("reporting route authorization", () => {
  it("accepts a signed read request only once", async () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const unsigned = new Request("https://outreach.example/reporting/summary");
    const requestId = "read-request-1";
    const requestHeaders = new Headers({ "x-fidexa-read-timestamp": String(timestamp), "x-fidexa-read-request-id": requestId });
    requestHeaders.set("x-fidexa-read-signature", await signReadRequest("read-secret", unsigned, timestamp, requestId));
    const request = new Request(unsigned, { headers: requestHeaders });
    const claimed = new Set<string>();
    const db = {
      prepare() {
        return {
          bind(id: string) {
            return {
              run: async () => {
                const key = `read:${id}`;
                if (claimed.has(key)) return { meta: { changes: 0 } };
                claimed.add(key);
                return { meta: { changes: 1 } };
              },
            };
          },
        };
      },
    } as unknown as D1Database;

    await expect(authenticateReadRequest(request, "read-secret", db)).resolves.toBe(true);
    await expect(authenticateReadRequest(new Request(request), "read-secret", db)).resolves.toBe(false);
    await expect(authenticateReadRequest(new Request(request), "other-secret", db)).resolves.toBe(false);
  });

  it("rejects a read signature when its request id changes", async () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const unsigned = new Request("https://outreach.example/reporting/summary");
    const headers = new Headers({ "x-fidexa-read-timestamp": String(timestamp), "x-fidexa-read-request-id": "read-request-2" });
    headers.set("x-fidexa-read-signature", await signReadRequest("read-secret", unsigned, timestamp, "read-request-1"));
    const db = { prepare: () => ({ bind: () => ({ run: async () => ({ meta: { changes: 1 } }) }) }) } as unknown as D1Database;

    await expect(authenticateReadRequest(new Request(unsigned, { headers }), "read-secret", db)).resolves.toBe(false);
  });

  it("retains a future-dated signed read nonce through its full signature window", async () => {
    const timestamp = Math.floor(Date.now() / 1_000) + 300;
    const unsigned = new Request("https://outreach.example/reporting/summary");
    const requestId = "future-read-request";
    const headers = new Headers({ "x-fidexa-read-timestamp": String(timestamp), "x-fidexa-read-request-id": requestId });
    headers.set("x-fidexa-read-signature", await signReadRequest("read-secret", unsigned, timestamp, requestId));
    let values: unknown[] = [];
    const db = {
      prepare: () => ({
        bind: (...bound: unknown[]) => {
          values = bound;
          return { run: async () => ({ meta: { changes: 1 } }) };
        },
      }),
    } as unknown as D1Database;

    await expect(authenticateReadRequest(new Request(unsigned, { headers }), "read-secret", db)).resolves.toBe(true);
    expect(values[1]).toBe(new Date((timestamp + 301) * 1_000).toISOString());
  });

  it("keeps a future-dated read nonce through the final valid second, rejecting its replay after cleanup", async () => {
    const timestamp = Math.floor(Date.now() / 1_000) + 300;
    const unsigned = new Request("https://outreach.example/reporting/summary");
    const requestId = "future-read-replay";
    const headers = new Headers({ "x-fidexa-read-timestamp": String(timestamp), "x-fidexa-read-request-id": requestId });
    headers.set("x-fidexa-read-signature", await signReadRequest("read-secret", unsigned, timestamp, requestId));
    const entries = new Map<string, string>();
    const db = {
      prepare(sql: string) {
        if (sql.startsWith("INSERT OR IGNORE")) {
          return { bind: (id: string, expiresAt: string) => ({ run: async () => {
            const key = `read:${id}`;
            if (entries.has(key)) return { meta: { changes: 0 } };
            entries.set(key, expiresAt);
            return { meta: { changes: 1 } };
          } }) };
        }
        if (sql.startsWith("SELECT scope, request_id")) {
          return { bind: (now: string) => ({ all: async () => ({ results: [...entries].filter(([, expiresAt]) => expiresAt <= now).map(([key]) => ({ scope: "read", request_id: key.slice("read:".length) })) }) }) };
        }
        return { bind: (scope: string, id: string, now: string) => ({ run: async () => {
          const key = `${scope}:${id}`;
          if ((entries.get(key) ?? "") > now) return { meta: { changes: 0 } };
          return { meta: { changes: entries.delete(key) ? 1 : 0 } };
        } }) };
      },
    } as unknown as D1Database;
    const finalValidSecond = new Date((timestamp + 300) * 1_000).toISOString();

    await expect(authenticateReadRequest(new Request(unsigned, { headers }), "read-secret", db)).resolves.toBe(true);
    await expect(cleanupExpiredNonces(db, finalValidSecond)).resolves.toEqual({ deleted: 0 });
    await expect(authenticateReadRequest(new Request(unsigned, { headers }), "read-secret", db)).resolves.toBe(false);
  });

  it("returns a bounded company drill-down without private object keys or raw event payloads", async () => {
    const timestamp = Math.floor(Date.now() / 1_000);
    const unsigned = new Request("https://outreach.example/reporting/companies/company-1");
    const headers = new Headers({ "x-fidexa-read-timestamp": String(timestamp), "x-fidexa-read-request-id": "company-detail-read" });
    headers.set("x-fidexa-read-signature", await signReadRequest("read-secret", unsigned, timestamp, "company-detail-read"));
    const batches = [[
      { results: [{ id: "company-1", name: "Fidexa prospect" }] },
      { results: [{ id: "contact-1", email: "hello@example.com", verification_method: "public_company_page" }] },
      { results: [{ id: "run-1", state: "completed", started_at: "2026-09-16T10:00:00.000Z" }] },
      { results: [{ id: "finding-1", finding: "Uses a legacy workflow", evidence_ref_id: "evidence-1" }] },
      { results: [{ id: "evidence-1", object_key: "research/company-1/run-1/source-1", source_url: "https://example.com" }] },
      { results: [{ id: "draft-1", state: "in_review", subject: "A factual subject", body: "Plain outreach draft" }] },
      { results: [{ id: "review-2", draft_id: "draft-1", decision: "approved", findings_json: '["recipient verified"]' }, { id: "review-1", draft_id: "draft-1", decision: "needs_changes", findings_json: '["add evidence"]' }] },
      { results: [{ id: "message-1", status: "delivered", subject: "A factual subject" }] },
      { results: [{ id: "event-1", message_id: "message-1", event_type: "delivered", payload_json: '{"provider_secret":"must-not-leak"}' }] },
      { results: [{ id: "follow-up-1", state: "scheduled", note: "Check in next week" }] },
      { results: [{ id: "audit-1", tool_name: "record_finding", metadata_json: '{"token":"must-not-leak"}' }] },
    ]];
    const statements: string[] = [];
    const db = {
      prepare(sql: string) {
        statements.push(sql);
        if (sql.startsWith("INSERT OR IGNORE")) return { bind: () => ({ run: async () => ({ meta: { changes: 1 } }) }) };
        return { bind: () => ({ all: async () => ({ results: [] }) }) };
      },
      batch: async () => batches.shift() ?? [],
    } as unknown as D1Database;

    const env = { OUTREACH_DB: db, FIDEXA_READ_SECRET: "read-secret" } as never;
    const response = await handleReportingRequest(new Request(unsigned, { headers }), env);
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toMatchObject({
      company: { id: "company-1" },
      researchRuns: [{ id: "run-1" }],
      drafts: [{ id: "draft-1", latestReview: { id: "review-2" }, reviews: [{ id: "review-2" }, { id: "review-1" }] }],
      messages: [{ id: "message-1", events: [{ id: "event-1", event_type: "delivered" }] }],
      followUps: [{ id: "follow-up-1" }],
      auditTimeline: [{ id: "audit-1", tool_name: "record_finding" }],
    });
    const serialized = JSON.stringify(payload);
    expect(serialized).not.toContain("object_key");
    expect(serialized).not.toContain("provider_secret");
    expect(serialized).not.toContain("must-not-leak");
    const auditQuery = statements.find((statement) => statement.includes("FROM workflow_events")) ?? "";
    expect(auditQuery).toContain("WHERE company_id = ?");
    expect(auditQuery).not.toContain("workflow_run_id IN");
  });

  it("rejects unauthenticated, mutating, and invalidly paginated reporting requests", async () => {
    const db = { prepare: () => ({ bind: () => ({ run: async () => ({ meta: { changes: 1 } }) }) }) } as unknown as D1Database;
    const env = { OUTREACH_DB: db, FIDEXA_READ_SECRET: "read-secret" } as never;
    await expect(handleReportingRequest(new Request("https://outreach.example/reporting/summary"), env).then((response) => response.status)).resolves.toBe(401);
    await expect(handleReportingRequest(new Request("https://outreach.example/reporting/summary", { method: "POST" }), env).then((response) => response.status)).resolves.toBe(405);
    const timestamp = Math.floor(Date.now() / 1_000);
    const unsigned = new Request("https://outreach.example/reporting/companies?limit=101");
    const headers = new Headers({ "x-fidexa-read-timestamp": String(timestamp), "x-fidexa-read-request-id": "invalid-page" });
    headers.set("x-fidexa-read-signature", await signReadRequest("read-secret", unsigned, timestamp, "invalid-page"));
    await expect(handleReportingRequest(new Request(unsigned, { headers }), env).then((response) => response.status)).resolves.toBe(400);
  });

  it("returns a bounded not-found detail and streams evidence only after a signed read", async () => {
    const timestamp = Math.floor(Date.now() / 1_000);
    const detail = new Request("https://outreach.example/reporting/companies/missing");
    const evidence = new Request("https://outreach.example/reporting/evidence/evidence-1");
    const signed = async (request: Request, requestId: string) => {
      const headers = new Headers({ "x-fidexa-read-timestamp": String(timestamp), "x-fidexa-read-request-id": requestId });
      headers.set("x-fidexa-read-signature", await signReadRequest("read-secret", request, timestamp, requestId));
      return new Request(request, { headers });
    };
    const emptyBatch = Array.from({ length: 11 }, () => ({ results: [] }));
    const db = {
      prepare(sql: string) {
        if (sql.startsWith("INSERT OR IGNORE")) return { bind: () => ({ run: async () => ({ meta: { changes: 1 } }) }) };
        return { bind: () => ({ first: async () => ({ object_key: "research/company-1/run-1/source", content_type: "text/plain", expires_at: "2999-01-01T00:00:00.000Z" }) }) };
      },
      batch: async () => emptyBatch,
    } as unknown as D1Database;
    const env = { OUTREACH_DB: db, OUTREACH_BUCKET: { get: async () => ({ body: new Blob(["captured evidence"]).stream() }) }, FIDEXA_READ_SECRET: "read-secret" } as never;
    const missingResponse = await handleReportingRequest(await signed(detail, "missing-company"), env);
    await expect(missingResponse.json()).resolves.toMatchObject({ company: null, contacts: [], auditTimeline: [] });
    const evidenceResponse = await handleReportingRequest(await signed(evidence, "evidence-read"), env);
    expect(evidenceResponse.status).toBe(200);
    expect(await evidenceResponse.text()).toBe("captured evidence");
  });

  it("does not include another company's events when both companies share a workflow run", async () => {
    const sqlite = new DatabaseSync(":memory:");
    for (const migration of ["0001_outreach_base.sql", "0002_outbound_draft_claim.sql", "0003_request_nonces.sql", "0004_workflow_recovery.sql", "0005_retry_reservations.sql", "0006_workflow_event_company.sql"]) sqlite.exec(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), "utf8"));
    const now = "2026-09-16T08:00:00.000Z";
    sqlite.prepare("INSERT INTO companies (id, schema_version, name, status, created_at, updated_at) VALUES (?, 1, ?, 'researched', ?, ?)").run("company-a", "Company A", now, now);
    sqlite.prepare("INSERT INTO companies (id, schema_version, name, status, created_at, updated_at) VALUES (?, 1, ?, 'researched', ?, ?)").run("company-b", "Company B", now, now);
    sqlite.prepare("INSERT INTO workflow_events (id, schema_version, company_id, entity_type, entity_id, actor_type, tool_name, workflow_run_id, metadata_json, created_at) VALUES (?, 1, ?, 'research_run', ?, 'codex', 'start_research_run', 'same-run', '{}', ?)").run("event-a", "company-a", "run-a", now);
    sqlite.prepare("INSERT INTO workflow_events (id, schema_version, company_id, entity_type, entity_id, actor_type, tool_name, workflow_run_id, metadata_json, created_at) VALUES (?, 1, ?, 'research_run', ?, 'codex', 'start_research_run', 'same-run', '{}', ?)").run("event-b", "company-b", "run-b", now);
    const db = {
      prepare(sql: string) {
        const statement = sqlite.prepare(sql);
        return { bind(...args: unknown[]) { return {
          run: async () => { const result = statement.run(...args as SQLInputValue[]); return { meta: { changes: result.changes } }; },
          first: async <T>() => (statement.get(...args as SQLInputValue[]) as T | undefined) ?? null,
          all: async () => ({ results: statement.all(...args as SQLInputValue[]) }),
        }; } };
      },
      batch: async (statements: Array<{ all: () => Promise<{ results: unknown[] }> }>) => Promise.all(statements.map((statement) => statement.all())),
    } as unknown as D1Database;
    const timestamp = Math.floor(Date.now() / 1_000);
    const unsigned = new Request("https://outreach.example/reporting/companies/company-a");
    const headers = new Headers({ "x-fidexa-read-timestamp": String(timestamp), "x-fidexa-read-request-id": "same-run-isolation" });
    headers.set("x-fidexa-read-signature", await signReadRequest("read-secret", unsigned, timestamp, "same-run-isolation"));
    try {
      const response = await handleReportingRequest(new Request(unsigned, { headers }), { OUTREACH_DB: db, FIDEXA_READ_SECRET: "read-secret" } as never);
      const payload = await response.json() as { auditTimeline: Array<{ id: string }> };
      expect(payload.auditTimeline).toMatchObject([{ id: "event-a" }]);
    } finally { sqlite.close(); }
  });

  it("backfills only deterministically company-associated legacy workflow events", () => {
    const sqlite = new DatabaseSync(":memory:");
    for (const migration of ["0001_outreach_base.sql", "0002_outbound_draft_claim.sql", "0003_request_nonces.sql", "0004_workflow_recovery.sql", "0005_retry_reservations.sql"]) sqlite.exec(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), "utf8"));
    const now = "2026-09-16T08:00:00.000Z";
    sqlite.prepare("INSERT INTO companies (id, schema_version, name, status, created_at, updated_at) VALUES ('company-1', 1, 'Company', 'researched', ?, ?)").run(now, now);
    sqlite.prepare("INSERT INTO contacts (id, schema_version, company_id, email, normalized_email, created_at, updated_at) VALUES ('contact-1', 1, 'company-1', 'contact@example.com', 'contact@example.com', ?, ?)").run(now, now);
    const event = (id: string, entityType: string, entityId: string, metadata = "{}") => sqlite.prepare("INSERT INTO workflow_events (id, schema_version, entity_type, entity_id, actor_type, tool_name, metadata_json, created_at) VALUES (?, 1, ?, ?, 'codex', 'test', ?, ?)").run(id, entityType, entityId, metadata, now);
    event("company-upsert", "company", "attempted-company", '{"result":{"id":"company-1"}}');
    event("contact-upsert", "contact", "attempted-contact", '{"result":{"id":"contact-1"}}');
    event("evidence-composite", "evidence", "company-1/research-1/source.md");
    event("ambiguous", "evidence", "unknown-company/research-1/source.md");
    event("malformed", "contact", "attempted-malformed", "not-json");
    sqlite.exec(readFileSync(new URL("../migrations/0006_workflow_event_company.sql", import.meta.url), "utf8"));
    try {
      const rows = sqlite.prepare("SELECT id, company_id FROM workflow_events ORDER BY id").all() as Array<{ id: string; company_id: string | null }>;
      expect(rows).toEqual([
        { id: "ambiguous", company_id: null },
        { id: "company-upsert", company_id: "company-1" },
        { id: "contact-upsert", company_id: "company-1" },
        { id: "evidence-composite", company_id: "company-1" },
        { id: "malformed", company_id: null },
      ]);
    } finally { sqlite.close(); }
  });

  it("shows Resend webhook and duplicate-safe Zoho import events in the company drill-down", async () => {
    const sqlite = new DatabaseSync(":memory:");
    for (const migration of ["0001_outreach_base.sql", "0002_outbound_draft_claim.sql", "0003_request_nonces.sql", "0004_workflow_recovery.sql", "0005_retry_reservations.sql", "0006_workflow_event_company.sql"]) sqlite.exec(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), "utf8"));
    const now = "2026-09-16T08:00:00.000Z";
    sqlite.exec(`
      INSERT INTO companies (id, schema_version, name, status, created_at, updated_at) VALUES ('company-1', 1, 'Company', 'researched', '${now}', '${now}');
      INSERT INTO evidence_refs (id, schema_version, company_id, workflow_run_id, object_key, content_type, byte_size, sha256, source_url, captured_at, expires_at, created_at, provenance) VALUES ('evidence-1', 1, 'company-1', 'run-1', 'evidence', 'text/plain', 1, 'hash', NULL, '${now}', '2999-01-01T00:00:00.000Z', '${now}', 'untrusted_external');
      INSERT INTO contacts (id, schema_version, company_id, email, normalized_email, verification_method, verified_at, verification_evidence_id, created_at, updated_at) VALUES ('contact-1', 1, 'company-1', 'reply@example.com', 'reply@example.com', 'public_company_page', '${now}', 'evidence-1', '${now}', '${now}');
      INSERT INTO messages (id, schema_version, company_id, contact_id, provider_message_id, direction, status, subject, body, created_at, updated_at) VALUES ('outbound-1', 1, 'company-1', 'contact-1', 'resend-1', 'outbound', 'sent', 'Outbound', 'Body', '${now}', '${now}');
      INSERT INTO zoho_sync_state (id, mailbox, cursor, watermark_received_at, watermark_message_id, updated_at) VALUES ('sync-1', 'hello@fidexa.org', '1', '0', NULL, '${now}');
    `);
    const db = {
      prepare(sql: string) { const statement = sqlite.prepare(sql); return { bind(...args: unknown[]) { return {
        run: async () => { const result = statement.run(...args as SQLInputValue[]); return { meta: { changes: result.changes } }; },
        first: async <T>() => (statement.get(...args as SQLInputValue[]) as T | undefined) ?? null,
        all: async () => ({ results: statement.all(...args as SQLInputValue[]) }),
      }; } }; },
      batch: async (statements: Array<{ all: () => Promise<{ results: unknown[] }> }>) => Promise.all(statements.map((statement) => statement.all())),
    } as unknown as D1Database;
    const env = { OUTREACH_DB: db, ZOHO_MAILBOX: "hello@fidexa.org", ZOHO_FOLDER_ID: "inbox", ZOHO_ACCOUNT_ID: "account", ZOHO_CLIENT_ID: "client", ZOHO_CLIENT_SECRET: "secret", ZOHO_REFRESH_TOKEN: "refresh" } as OutreachEnv;
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "token" }), { status: 200 })).mockResolvedValueOnce(new Response(JSON.stringify({ data: [{ messageId: "zoho-1", fromAddress: "reply@example.com", toAddress: "hello@fidexa.org", receivedtime: "1", subject: "Reply" }] }), { status: 200 }));
    await syncZohoReplies(env, now, fetcher);
    await syncZohoReplies(env, now, fetcher).catch(() => undefined);
    await recordResendEvent(db, { type: "email.delivered", data: { email_id: "resend-1" } }, '{"resend":true}', now, "provider-event-1");
    const timestamp = Math.floor(Date.now() / 1_000);
    const unsigned = new Request("https://outreach.example/reporting/companies/company-1");
    const headers = new Headers({ "x-fidexa-read-timestamp": String(timestamp), "x-fidexa-read-request-id": "message-events-e2e" });
    headers.set("x-fidexa-read-signature", await signReadRequest("read-secret", unsigned, timestamp, "message-events-e2e"));
    try {
      const response = await handleReportingRequest(new Request(unsigned, { headers }), { OUTREACH_DB: db, FIDEXA_READ_SECRET: "read-secret" } as never);
      const payload = await response.json() as { messages: Array<{ id: string; events: Array<{ event_type: string }> }> };
      expect(payload.messages.find((message) => message.id === "outbound-1")?.events).toMatchObject([{ event_type: "email.delivered" }]);
      expect(payload.messages.find((message) => message.id !== "outbound-1")?.events).toMatchObject([{ event_type: "zoho.received" }]);
      expect(sqlite.prepare("SELECT COUNT(*) AS count FROM message_events WHERE message_id IS NOT NULL").get()).toEqual({ count: 2 });
    } finally { sqlite.close(); }
  });

  it("heals an early Resend event on duplicate replay once its message exists", async () => {
    const sqlite = new DatabaseSync(":memory:");
    for (const migration of ["0001_outreach_base.sql", "0002_outbound_draft_claim.sql", "0003_request_nonces.sql", "0004_workflow_recovery.sql", "0005_retry_reservations.sql", "0006_workflow_event_company.sql"]) sqlite.exec(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), "utf8"));
    const now = "2026-09-16T08:00:00.000Z";
    sqlite.prepare("INSERT INTO companies (id, schema_version, name, status, created_at, updated_at) VALUES ('company-1', 1, 'Company', 'researched', ?, ?)").run(now, now);
    const db = {
      prepare(sql: string) { const statement = sqlite.prepare(sql); return { bind(...args: unknown[]) { return {
        run: async () => { const result = statement.run(...args as SQLInputValue[]); return { meta: { changes: result.changes } }; },
        first: async <T>() => (statement.get(...args as SQLInputValue[]) as T | undefined) ?? null,
        all: async () => ({ results: statement.all(...args as SQLInputValue[]) }),
      }; } }; },
      batch: async (statements: Array<{ all: () => Promise<{ results: unknown[] }> }>) => Promise.all(statements.map((statement) => statement.all())),
    } as unknown as D1Database;
    const event = { type: "email.bounced" as const, data: { email_id: "resend-early" } };
    const payload = JSON.stringify(event);
    await recordResendEvent(db, event, payload, now, "provider-event-early");
    sqlite.prepare("INSERT INTO messages (id, schema_version, company_id, provider_message_id, direction, status, subject, body, created_at, updated_at) VALUES ('outbound-early', 1, 'company-1', 'resend-early', 'outbound', 'sent', 'Subject', 'Body', ?, ?)").run(now, now);
    await recordResendEvent(db, event, payload, now, "provider-event-early");
    const timestamp = Math.floor(Date.now() / 1_000);
    const unsigned = new Request("https://outreach.example/reporting/companies/company-1");
    const headers = new Headers({ "x-fidexa-read-timestamp": String(timestamp), "x-fidexa-read-request-id": "late-webhook-heal" });
    headers.set("x-fidexa-read-signature", await signReadRequest("read-secret", unsigned, timestamp, "late-webhook-heal"));
    try {
      const response = await handleReportingRequest(new Request(unsigned, { headers }), { OUTREACH_DB: db, FIDEXA_READ_SECRET: "read-secret" } as never);
      const payload = await response.json() as { messages: Array<{ id: string; status: string; events: Array<{ event_type: string }> }> };
      expect(sqlite.prepare("SELECT message_id FROM message_events WHERE provider_event_id = 'provider-event-early'").get()).toEqual({ message_id: "outbound-early" });
      expect(sqlite.prepare("SELECT status FROM messages WHERE id = 'outbound-early'").get()).toEqual({ status: "bounced" });
      expect(payload.messages).toMatchObject([{ id: "outbound-early", status: "bounced", events: [{ event_type: "email.bounced" }] }]);
    } finally { sqlite.close(); }
  });
});
