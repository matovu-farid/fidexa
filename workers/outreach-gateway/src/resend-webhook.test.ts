import { describe, expect, it } from "vitest";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { readFileSync } from "node:fs";
import { recordResendEvent, verifyAndParseResendWebhook } from "./resend-webhook";

describe("Resend webhook boundary", () => {
  it("verifies the raw Svix payload before parsing", async () => {
    const payload = JSON.stringify({ type: "email.delivered", data: { email_id: "re_1" } });
    const secret = "whsec_" + btoa("webhook-secret");
    const timestamp = Math.floor(Date.now() / 1000);
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode("webhook-secret"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signatureBytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`evt_1.${timestamp}.${payload}`));
    const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));
    const headers = new Headers({ "svix-id": "evt_1", "svix-timestamp": String(timestamp), "svix-signature": `v1,${signature}` });
    await expect(verifyAndParseResendWebhook(payload, headers, secret)).resolves.toMatchObject({ type: "email.delivered" });
    await expect(verifyAndParseResendWebhook(payload + " ", headers, secret)).rejects.toThrow();
  });

  it("keeps provider delivery state monotonic while retaining each unique event", async () => {
    const sqlite = new DatabaseSync(":memory:");
    for (const migration of ["0001_outreach_base.sql", "0002_outbound_draft_claim.sql", "0003_request_nonces.sql", "0004_workflow_recovery.sql", "0005_retry_reservations.sql", "0006_workflow_event_company.sql"]) sqlite.exec(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), "utf8"));
    const now = "2026-09-16T08:00:00.000Z";
    sqlite.exec(`
      INSERT INTO companies (id, schema_version, name, status, created_at, updated_at) VALUES ('company-1', 1, 'Company', 'researched', '${now}', '${now}');
      INSERT INTO messages (id, schema_version, company_id, provider_message_id, direction, status, subject, body, created_at, updated_at) VALUES ('message-1', 1, 'company-1', 'provider-1', 'outbound', 'pending', 'Subject', 'Body', '${now}', '${now}');
      INSERT INTO messages (id, schema_version, company_id, provider_message_id, direction, status, subject, body, created_at, updated_at) VALUES ('message-2', 1, 'company-1', 'provider-2', 'outbound', 'pending', 'Subject', 'Body', '${now}', '${now}');
    `);
    const db = { prepare(sql: string) { const statement = sqlite.prepare(sql); return { bind(...args: unknown[]) { return { run: async () => { const result = statement.run(...args as SQLInputValue[]); return { meta: { changes: result.changes } }; }, first: async <T>() => (statement.get(...args as SQLInputValue[]) as T | undefined) ?? null }; } }; } } as unknown as D1Database;
    const record = (type: "email.sent" | "email.delivered" | "email.bounced" | "email.complained", provider: string, eventId: string) => {
      const event = { type, data: { email_id: provider } };
      return recordResendEvent(db, event, JSON.stringify(event), now, eventId);
    };
    try {
      await record("email.delivered", "provider-1", "event-1");
      await record("email.sent", "provider-1", "event-2");
      await record("email.bounced", "provider-1", "event-3");
      await record("email.delivered", "provider-1", "event-4");
      await record("email.complained", "provider-2", "event-5");
      await record("email.delivered", "provider-2", "event-6");
      await record("email.delivered", "provider-2", "event-6");
      expect(sqlite.prepare("SELECT id, status FROM messages ORDER BY id").all()).toEqual([{ id: "message-1", status: "bounced" }, { id: "message-2", status: "complained" }]);
      expect(sqlite.prepare("SELECT COUNT(*) AS count FROM message_events").get()).toEqual({ count: 6 });
    } finally { sqlite.close(); }
  });

  it("heals an early webhook link and status from the immutable original event", async () => {
    const sqlite = new DatabaseSync(":memory:");
    for (const migration of ["0001_outreach_base.sql", "0002_outbound_draft_claim.sql", "0003_request_nonces.sql", "0004_workflow_recovery.sql", "0005_retry_reservations.sql", "0006_workflow_event_company.sql"]) sqlite.exec(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), "utf8"));
    const now = "2026-09-16T08:00:00.000Z";
    sqlite.exec(`INSERT INTO companies (id, schema_version, name, status, created_at, updated_at) VALUES ('company-1', 1, 'Company', 'researched', '${now}', '${now}');`);
    const db = { prepare(sql: string) { const statement = sqlite.prepare(sql); return { bind(...args: unknown[]) { return { run: async () => { const result = statement.run(...args as SQLInputValue[]); return { meta: { changes: result.changes } }; }, first: async <T>() => (statement.get(...args as SQLInputValue[]) as T | undefined) ?? null }; } }; } } as unknown as D1Database;
    const payload = JSON.stringify({ type: "email.delivered", data: { email_id: "provider-early" } });
    try {
      await recordResendEvent(db, { type: "email.delivered", data: { email_id: "provider-early" } }, payload, now, "event-early");
      sqlite.exec(`INSERT INTO messages (id, schema_version, company_id, provider_message_id, direction, status, subject, body, created_at, updated_at) VALUES ('message-early', 1, 'company-1', 'provider-early', 'outbound', 'pending', 'Subject', 'Body', '${now}', '${now}');`);

      await expect(recordResendEvent(db, { type: "email.delivered", data: { email_id: "provider-early" } }, payload, now, "event-early")).resolves.toEqual({ duplicate: true });
      expect(sqlite.prepare("SELECT message_id, event_type FROM message_events WHERE provider_event_id = 'event-early'").get()).toEqual({ message_id: "message-early", event_type: "email.delivered" });
      expect(sqlite.prepare("SELECT status FROM messages WHERE id = 'message-early'").get()).toEqual({ status: "delivered" });
    } finally { sqlite.close(); }
  });

  it.each([
    { label: "type", event: { type: "email.bounced" as const, data: { email_id: "provider-1", to: ["victim@example.com"] } } },
    { label: "email identity", event: { type: "email.delivered" as const, data: { email_id: "provider-2" } } },
  ])("rejects a duplicate provider event ID with changed $label without mutating state", async ({ event }) => {
    const sqlite = new DatabaseSync(":memory:");
    for (const migration of ["0001_outreach_base.sql", "0002_outbound_draft_claim.sql", "0003_request_nonces.sql", "0004_workflow_recovery.sql", "0005_retry_reservations.sql", "0006_workflow_event_company.sql"]) sqlite.exec(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), "utf8"));
    const now = "2026-09-16T08:00:00.000Z";
    sqlite.exec(`
      INSERT INTO companies (id, schema_version, name, status, created_at, updated_at) VALUES ('company-1', 1, 'Company', 'researched', '${now}', '${now}');
      INSERT INTO messages (id, schema_version, company_id, provider_message_id, direction, status, subject, body, created_at, updated_at) VALUES ('message-1', 1, 'company-1', 'provider-1', 'outbound', 'pending', 'Subject', 'Body', '${now}', '${now}');
      INSERT INTO messages (id, schema_version, company_id, provider_message_id, direction, status, subject, body, created_at, updated_at) VALUES ('message-2', 1, 'company-1', 'provider-2', 'outbound', 'pending', 'Subject', 'Body', '${now}', '${now}');
    `);
    const db = { prepare(sql: string) { const statement = sqlite.prepare(sql); return { bind(...args: unknown[]) { return { run: async () => { const result = statement.run(...args as SQLInputValue[]); return { meta: { changes: result.changes } }; }, first: async <T>() => (statement.get(...args as SQLInputValue[]) as T | undefined) ?? null }; } }; } } as unknown as D1Database;
    const original = { type: "email.delivered" as const, data: { email_id: "provider-1" } };
    try {
      await recordResendEvent(db, original, JSON.stringify(original), now, "immutable-event");
      await expect(recordResendEvent(db, event, JSON.stringify(event), now, "immutable-event")).rejects.toThrow("Provider event ID conflicts with the stored event identity");
      expect(sqlite.prepare("SELECT id, status FROM messages ORDER BY id").all()).toEqual([{ id: "message-1", status: "delivered" }, { id: "message-2", status: "pending" }]);
      expect(sqlite.prepare("SELECT COUNT(*) AS count FROM suppressions").get()).toEqual({ count: 0 });
      expect(sqlite.prepare("SELECT event_type, message_id FROM message_events WHERE provider_event_id = 'immutable-event'").get()).toEqual({ event_type: "email.delivered", message_id: "message-1" });
    } finally { sqlite.close(); }
  });
});
