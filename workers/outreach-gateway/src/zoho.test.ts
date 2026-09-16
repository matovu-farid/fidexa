import { describe, expect, it, vi } from "vitest";
import { syncZohoReplies } from "./zoho";

describe("Zoho reply adapter", () => {
  it("fails closed when unattended OAuth configuration is incomplete", async () => {
    const fetcher = vi.fn();
    await expect(syncZohoReplies({ ZOHO_MAILBOX: "hello@fidexa.org", ZOHO_FOLDER_ID: "inbox" } as OutreachEnv, "2026-09-11T08:00:00.000Z", fetcher)).rejects.toThrow("ZOHO_ACCOUNT_ID");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("advances by the raw provider page count and attaches only a verified matching sender contact", async () => {
    const bindings: Array<{ sql: string; args: unknown[] }> = [];
    const db = {
      prepare(sql: string) {
        return {
          bind(...args: unknown[]) {
            bindings.push({ sql, args });
            return {
              first: async () => {
                if (sql.includes("FROM zoho_sync_state")) return { cursor: "4", watermark_received_at: "0", watermark_message_id: null };
                if (sql.includes("FROM contacts")) return { id: "contact-1", company_id: "company-1" };
                return null;
              },
              run: async () => ({ success: true, meta: { changes: 1 } }),
            };
          },
        };
      },
    } as unknown as D1Database;
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "token" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [
        { messageId: "message-1", sender: { address: "verified@example.com" }, toAddress: "hello@fidexa.org", subject: "Reply", content: "Thanks" },
        { messageId: "message-2", sender: { address: "verified@example.com" }, toAddress: "hello@fidexa.org", subject: "Second reply", content: "Thanks again" },
        { messageId: "message-1", sender: { address: "verified@example.com" }, toAddress: "hello@fidexa.org", subject: "Duplicate", content: "Again" },
      ] }), { status: 200 }));
    const env = {
      OUTREACH_DB: db,
      ZOHO_MAILBOX: "hello@fidexa.org",
      ZOHO_FOLDER_ID: "inbox",
      ZOHO_ACCOUNT_ID: "account",
      ZOHO_CLIENT_ID: "client",
      ZOHO_CLIENT_SECRET: "secret",
      ZOHO_REFRESH_TOKEN: "refresh",
    } as OutreachEnv;

    await expect(syncZohoReplies(env, "2026-09-11T08:00:00.000Z", fetcher)).resolves.toEqual({ imported: 3, cursor: "7" });

    expect(bindings.some(({ sql }) => sql.includes("FROM contacts") && sql.includes("normalized_email"))).toBe(true);
    const inboundInsert = bindings.find(({ sql }) => sql.includes("INSERT OR IGNORE INTO messages"));
    expect(inboundInsert?.sql).toContain("company_id, contact_id");
    expect(inboundInsert?.args).toContain("company-1");
    expect(inboundInsert?.args).toContain("contact-1");
    const cursorWrite = bindings.find(({ sql }) => sql.includes("INSERT INTO zoho_sync_state"));
    expect(cursorWrite?.args).toContain("7");
  });

  it("skips an unmatched sender without creating message or audit content and still advances the cursor", async () => {
    const writes: Array<{ sql: string; args: unknown[] }> = [];
    const db = { prepare(sql: string) { return { bind(...args: unknown[]) { return { first: async () => {
      if (sql.includes("zoho_sync_state")) return { cursor: "1", watermark_received_at: "0", watermark_message_id: null, continuation_upper_bound: null, continuation_start: null, continuation_candidate_watermark: null, continuation_candidate_message_id: null };
      return null;
    }, run: async () => { writes.push({ sql, args }); return { success: true, meta: { changes: 1 } }; } }; } }; } } as unknown as D1Database;
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "token" }), { status: 200 })).mockResolvedValueOnce(new Response(JSON.stringify({ data: [{ messageId: "unmatched-1", fromAddress: "unknown@example.com", toAddress: "hello@fidexa.org", receivedtime: "1", subject: "Do not store" }] }), { status: 200 }));
    const env = { OUTREACH_DB: db, ZOHO_MAILBOX: "hello@fidexa.org", ZOHO_FOLDER_ID: "inbox", ZOHO_ACCOUNT_ID: "account", ZOHO_CLIENT_ID: "client", ZOHO_CLIENT_SECRET: "secret", ZOHO_REFRESH_TOKEN: "refresh" } as OutreachEnv;
    await expect(syncZohoReplies(env, "2026-09-11T08:00:00.000Z", fetcher)).resolves.toMatchObject({ imported: 0, cursor: "2" });
    expect(writes.some(({ sql }) => sql.includes("INSERT OR IGNORE INTO messages"))).toBe(false);
    const quarantine = writes.find(({ sql }) => sql.includes("zoho_quarantine"));
    expect(quarantine?.args).toContain(JSON.stringify({ reason: "unmatched_verified_sender", retryable: false }));
    expect(writes.some(({ sql }) => sql.includes("message_events"))).toBe(false);
    expect(writes.some(({ sql }) => sql.includes("INSERT INTO zoho_sync_state"))).toBe(true);
  });

  it("requests explicit recipient data and refuses partial recipient matches", async () => {
    const writes: string[] = [];
    const db = {
      prepare(sql: string) {
        return {
          bind() {
            return {
              first: async () => sql.includes("zoho_sync_state") ? { cursor: "1", watermark_received_at: "0", watermark_message_id: null } : null,
              run: async () => { writes.push(sql); return { success: true, meta: { changes: 1 } }; },
            };
          },
        };
      },
    } as unknown as D1Database;
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "token" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [{ messageId: "message-1", fromAddress: "sender@example.com", toAddress: "not-hello@fidexa.org" }] }), { status: 200 }));
    const env = { OUTREACH_DB: db, ZOHO_MAILBOX: "hello@fidexa.org", ZOHO_FOLDER_ID: "inbox", ZOHO_ACCOUNT_ID: "account", ZOHO_CLIENT_ID: "client", ZOHO_CLIENT_SECRET: "secret", ZOHO_REFRESH_TOKEN: "refresh" } as OutreachEnv;

    await expect(syncZohoReplies(env, "2026-09-11T08:00:00.000Z", fetcher)).resolves.toEqual({ imported: 0, cursor: "2" });

    expect(new URL(String(fetcher.mock.calls[1]?.[0])).searchParams.get("includeto")).toBe("true");
    expect(writes.some((sql) => sql.includes("INSERT OR IGNORE INTO messages"))).toBe(false);
  });

  it("quarantines malformed provider items without advancing the cursor", async () => {
    const writes: string[] = [];
    const db = {
      prepare(sql: string) {
        return {
          bind() {
            return {
              first: async () => sql.includes("zoho_sync_state") ? { cursor: "1" } : null,
              run: async () => { writes.push(sql); return { success: true, meta: { changes: 1 } }; },
            };
          },
        };
      },
    } as unknown as D1Database;
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "token" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [{ malformed: true }] }), { status: 200 }));
    const env = { OUTREACH_DB: db, ZOHO_MAILBOX: "hello@fidexa.org", ZOHO_FOLDER_ID: "inbox", ZOHO_ACCOUNT_ID: "account", ZOHO_CLIENT_ID: "client", ZOHO_CLIENT_SECRET: "secret", ZOHO_REFRESH_TOKEN: "refresh" } as OutreachEnv;

    await expect(syncZohoReplies(env, "2026-09-11T08:00:00.000Z", fetcher)).rejects.toThrow("Zoho message envelope contained malformed item");

    expect(writes.some((sql) => sql.includes("workflow_events") && sql.includes("zoho_quarantine"))).toBe(true);
    expect(writes.some((sql) => sql.includes("INSERT INTO zoho_sync_state"))).toBe(false);
  });

  it("sets an initial watermark, then imports a new arrival once despite duplicate provider entries", async () => {
    const inserted = new Set<string>();
    const stateWrites: unknown[][] = [];
    let stateReads = 0;
    let storedMessageLookups = 0;
    const db = {
      prepare(sql: string) { return { bind(...args: unknown[]) { return { first: async () => {
        if (sql.includes("zoho_sync_state")) return stateReads++ === 0 ? null : { cursor: "1", watermark_received_at: String(Date.parse("2026-09-11T08:00:00.000Z")), watermark_message_id: null };
        if (sql.includes("FROM contacts")) return { id: "contact-1", company_id: "company-1" };
        if (sql.includes("SELECT id FROM messages WHERE external_message_id")) { storedMessageLookups += 1; return { id: "inbound-1" }; }
        return null;
      }, run: async () => {
        if (sql.includes("INSERT OR IGNORE INTO messages")) { const id = String(args[3]); const changes = inserted.has(id) ? 0 : 1; inserted.add(id); return { success: true, meta: { changes } }; }
        if (sql.includes("INSERT INTO zoho_sync_state")) stateWrites.push(args);
        return { success: true, meta: { changes: 1 } };
      } }; } }; },
    } as unknown as D1Database;
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "token" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "token" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [
        { messageId: "arrival-1", fromAddress: "sender@example.com", toAddress: "hello@fidexa.org", receivedTime: String(Date.parse("2026-09-11T08:01:00.000Z")) },
        { messageId: "arrival-1", fromAddress: "sender@example.com", toAddress: "hello@fidexa.org", receivedTime: String(Date.parse("2026-09-11T08:01:00.000Z")) },
      ] }), { status: 200 }));
    const env = { OUTREACH_DB: db, ZOHO_MAILBOX: "hello@fidexa.org", ZOHO_FOLDER_ID: "inbox", ZOHO_ACCOUNT_ID: "account", ZOHO_CLIENT_ID: "client", ZOHO_CLIENT_SECRET: "secret", ZOHO_REFRESH_TOKEN: "refresh" } as OutreachEnv;

    await expect(syncZohoReplies(env, "2026-09-11T08:00:00.000Z", fetcher)).resolves.toMatchObject({ imported: 0 });
    await expect(syncZohoReplies(env, "2026-09-11T08:02:00.000Z", fetcher)).resolves.toMatchObject({ imported: 1 });

    expect(stateWrites[0]).toContain(String(Date.parse("2026-09-11T08:00:00.000Z") - 120_000));
    expect(new URL(String(fetcher.mock.calls[3]?.[0])).searchParams.get("receivedTime")).toBe(String(Date.parse("2026-09-11T08:02:00.000Z") - 120_000));
    expect(storedMessageLookups).toBe(2);
  });

  it("persists and resumes a four-page continuation without advancing the final watermark", async () => {
    const stateWrites: unknown[][] = [];
    let read = 0;
    const db = { prepare(sql: string) { return { bind(...args: unknown[]) { return { first: async () => sql.includes("zoho_sync_state") ? read++ === 0
      ? { cursor: "1", watermark_received_at: "100", watermark_message_id: "old", continuation_upper_bound: null, continuation_start: null, continuation_candidate_watermark: null }
      : { cursor: "101", watermark_received_at: "100", watermark_message_id: "old", continuation_upper_bound: "200", continuation_start: 101, continuation_candidate_watermark: "200" } : null,
      run: async () => { if (sql.includes("INSERT INTO zoho_sync_state")) stateWrites.push(args); return { success: true, meta: { changes: 1 } }; } }; } }; } } as unknown as D1Database;
    const page = (offset: number) => Array.from({ length: 25 }, (_, index) => ({ messageId: `m-${offset + index}`, fromAddress: "reply@example.com", toAddress: "hello@fidexa.org", receivedtime: String(200 - offset - index) }));
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "token" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: page(0) }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: page(25) }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: page(50) }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: page(75) }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "token" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [{ messageId: "m-101", fromAddress: "reply@example.com", toAddress: "hello@fidexa.org", receivedtime: "99" }] }), { status: 200 }));
    const env = { OUTREACH_DB: db, ZOHO_MAILBOX: "hello@fidexa.org", ZOHO_FOLDER_ID: "inbox", ZOHO_ACCOUNT_ID: "account", ZOHO_CLIENT_ID: "client", ZOHO_CLIENT_SECRET: "secret", ZOHO_REFRESH_TOKEN: "refresh" } as OutreachEnv;

    await syncZohoReplies(env, "2026-09-11T08:02:00.000Z", fetcher);
    expect(stateWrites[0]).toContain(101);
    expect(stateWrites[0]).toContain("100");
    await syncZohoReplies(env, "2026-09-11T08:03:00.000Z", fetcher);
    expect(new URL(String(fetcher.mock.calls[6]?.[0])).searchParams.get("start")).toBe("101");
    expect(stateWrites[1]).toContain(null);
  });

  it("uses documented lowercase receivedtime and fromAddress rather than a sender display name", async () => {
    const matched: string[] = [];
    const db = { prepare(sql: string) { return { bind(...args: unknown[]) { return { first: async () => {
      if (sql.includes("zoho_sync_state")) return { cursor: "1", watermark_received_at: "0", watermark_message_id: null, continuation_upper_bound: null, continuation_start: null, continuation_candidate_watermark: null };
      if (sql.includes("FROM contacts")) { matched.push(String(args[1])); return null; }
      return null;
    }, run: async () => ({ success: true, meta: { changes: 1 } }) }; } }; } } as unknown as D1Database;
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "token" }), { status: 200 })).mockResolvedValueOnce(new Response(JSON.stringify({ data: [{ messageId: "m", sender: "Display Name", fromAddress: "actual@example.com", toAddress: "hello@fidexa.org", receivedtime: "1700000000000" }] }), { status: 200 }));
    const env = { OUTREACH_DB: db, ZOHO_MAILBOX: "hello@fidexa.org", ZOHO_FOLDER_ID: "inbox", ZOHO_ACCOUNT_ID: "account", ZOHO_CLIENT_ID: "client", ZOHO_CLIENT_SECRET: "secret", ZOHO_REFRESH_TOKEN: "refresh" } as OutreachEnv;
    await syncZohoReplies(env, "2026-09-11T08:02:00.000Z", fetcher);
    expect(matched).toEqual(["actual@example.com"]);
  });

  it("does not import or revisit mail at or below the persisted watermark", async () => {
    const writes: string[] = [];
    const db = { prepare(sql: string) { return { bind() { return { first: async () => sql.includes("zoho_sync_state") ? { cursor: "1", watermark_received_at: "100", watermark_message_id: "m-100", continuation_upper_bound: null, continuation_start: null, continuation_candidate_watermark: null } : null, run: async () => { writes.push(sql); return { success: true, meta: { changes: 1 } }; } }; } }; } } as unknown as D1Database;
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "token" }), { status: 200 })).mockResolvedValueOnce(new Response(JSON.stringify({ data: [{ messageId: "m-99", fromAddress: "old@example.com", toAddress: "hello@fidexa.org", receivedtime: "99" }] }), { status: 200 }));
    const env = { OUTREACH_DB: db, ZOHO_MAILBOX: "hello@fidexa.org", ZOHO_FOLDER_ID: "inbox", ZOHO_ACCOUNT_ID: "account", ZOHO_CLIENT_ID: "client", ZOHO_CLIENT_SECRET: "secret", ZOHO_REFRESH_TOKEN: "refresh" } as OutreachEnv;
    await expect(syncZohoReplies(env, "2026-09-11T08:00:00.000Z", fetcher)).resolves.toMatchObject({ imported: 0 });
    expect(writes.some((sql) => sql.includes("INSERT OR IGNORE INTO messages"))).toBe(false);
  });
});

import type { OutreachEnv } from "./env";
