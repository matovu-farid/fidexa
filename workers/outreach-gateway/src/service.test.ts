import { describe, expect, it, vi } from "vitest";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { readFileSync } from "node:fs";
import { approveDraft, createCompany, createContact, recordFinding, scheduleFollowUp, sendApproved, startSupplementalResearch, storeEvidence, submitForReview } from "./service";

function text(result: unknown) {
  return JSON.parse((result as { content: Array<{ text: string }> }).content[0]!.text);
}

const approvedChecklist = {
  claims_supported: true,
  recipient_validated: true,
  prior_outreach_checked: true,
  relevance_personalization_checked: true,
  opt_out_suppression_checked: true,
  deliverability_checked: true,
  prompt_injection_checked: true,
};

function context(first: (sql: string, args: unknown[]) => unknown, onBind?: (sql: string, args: unknown[]) => void) {
  let idempotencyMetadata: string | null = null;
  return {
    db: {
      prepare(sql: string) {
        return {
          bind(...args: unknown[]) {
            onBind?.(sql, args);
            if (sql.includes("INSERT OR IGNORE INTO workflow_events")) idempotencyMetadata = String(args[9]);
            return {
              run: async () => ({ success: true, meta: { changes: 1 } }),
              first: async () => sql.includes("FROM workflow_events")
                ? idempotencyMetadata ? { metadata_json: idempotencyMetadata } : null
                : first(sql, args),
            };
          },
        };
      },
      batch: async () => [],
    },
    bucket: { put: async () => undefined },
    credentialRole: "reviewer",
    now: "2026-09-11T08:00:00.000Z",
  } as unknown as Parameters<typeof approveDraft>[0];
}

describe("outreach service safety boundaries", () => {
  it("opens an append-only supplemental run for a researched company", async () => {
    const bound: Array<{ sql: string; args: unknown[] }> = [];
    const dbContext = context(
      (sql) => sql.includes("FROM companies") ? { id: "company-1", status: "researched" } : null,
      (sql, args) => bound.push({ sql, args }),
    );

    const result = await startSupplementalResearch(dbContext, {
      schema_version: 1,
      workflow_run_id: "recovery-run",
      idempotency_key: "supplemental-1",
      company_id: "company-1",
      reason: "Verify a public business mailbox.",
    });

    expect(text(result)).toMatchObject({ state: "researching", supplemental: true });
    expect(bound.some(({ sql, args }) => sql.includes("INSERT INTO research_runs") && args.includes("company-1"))).toBe(true);
    expect(bound.some(({ sql, args }) => sql.includes("UPDATE companies SET status = 'researching'") && args.includes("company-1"))).toBe(true);
    expect(bound.some(({ sql, args }) => sql.includes("UPDATE outreach_drafts SET state = 'drafted'") && args.includes("company-1"))).toBe(true);
  });

  it.each(["discovered", "researching", "drafted", "sent"])("rejects supplemental research for a %s company", async (status) => {
    const dbContext = context((sql) => sql.includes("FROM companies") ? { id: "company-1", status } : null);
    await expect(startSupplementalResearch(dbContext, {
      schema_version: 1,
      workflow_run_id: "recovery-run",
      idempotency_key: `supplemental-${status}`,
      company_id: "company-1",
      reason: "Need a public source.",
    })).rejects.toThrow("Company is not eligible for supplemental research");
  });

  it("submits a drafted outreach message for independent review without recording a negative review decision", async () => {
    const bound: Array<{ sql: string; args: unknown[] }> = [];
    const dbContext = context((sql) => sql.includes("FROM outreach_drafts")
      ? { state: "drafted", company_id: "company-1" }
      : null, (sql, args) => bound.push({ sql, args }));

    await submitForReview(dbContext, {
      schema_version: 1,
      workflow_run_id: "author-run",
      idempotency_key: "submit-for-review-1",
      draft_id: "draft-1",
    });

    expect(bound.some(({ sql }) => sql.includes("INSERT INTO review_runs"))).toBe(false);
    expect(bound.some(({ sql, args }) => sql.includes("UPDATE outreach_drafts SET state = 'in_review'") && args.includes("draft-1"))).toBe(true);
  });

  it.each(["contacts", "messages"])("rejects a cross-company follow-up %s reference", async (table) => {
    const dbContext = context((sql) => {
      if (sql.includes("FROM companies")) return { id: "company-1" };
      if (sql.includes(`FROM ${table}`)) return null;
      return null;
    });
    await expect(scheduleFollowUp(dbContext, { schema_version: 1, workflow_run_id: "run", idempotency_key: `follow-${table}`, company_id: "company-1", due_at: "2026-09-12T08:00:00.000Z", note: "Follow up", ...(table === "contacts" ? { contact_id: "other-contact" } : { message_id: "other-message" }) })).rejects.toThrow("does not belong to company");
  });
  it("rejects approval without every explicit safety checklist item", async () => {
    const dbContext = context((sql) => {
      if (sql.includes("FROM outreach_drafts")) return { state: "in_review", workflow_run_id: "author-run" };
      return null;
    });

    await expect(approveDraft(dbContext, {
      schema_version: 1,
      workflow_run_id: "reviewer-run",
      idempotency_key: "approval-checklist-missing",
      draft_id: "draft-1",
      decision: "approved",
      reviewer_run_id: "independent-reviewer-run",
      policy_version: "v1",
      findings: ["reviewed"],
    })).rejects.toThrow();
  });

  it("rejects approval when the reviewer is the draft's persisted workflow author despite a spoofed author_run_id", async () => {
    const dbContext = context((sql) => {
      if (sql.includes("FROM outreach_drafts")) return { state: "in_review", workflow_run_id: "author-run" };
      return null;
    });

    await expect(approveDraft(dbContext, {
      schema_version: 1,
      workflow_run_id: "reviewer-run",
      idempotency_key: "approval-1",
      draft_id: "draft-1",
      decision: "approved",
      reviewer_run_id: "author-run",
      author_run_id: "spoofed-other-run",
      policy_version: "v1",
      findings: ["reviewed"],
      checklist: approvedChecklist,
    })).rejects.toThrow("Reviewer run must differ from draft author run");
  });

  it("persists the all-true approval checklist with the review run", async () => {
    const bound: Array<{ sql: string; args: unknown[] }> = [];
    const dbContext = context((sql) => sql.includes("FROM outreach_drafts")
      ? { state: "in_review", workflow_run_id: "author-run" }
      : null, (sql, args) => bound.push({ sql, args }));

    await approveDraft(dbContext, {
      schema_version: 1,
      workflow_run_id: "reviewer-run",
      idempotency_key: "approval-checklist-persisted",
      draft_id: "draft-1",
      decision: "approved",
      reviewer_run_id: "independent-reviewer-run",
      policy_version: "v1",
      findings: ["reviewed"],
      checklist: approvedChecklist,
    });

    const reviewInsert = bound.find(({ sql }) => sql.includes("INSERT INTO review_runs"));
    expect(reviewInsert?.sql).toContain("approval_checklist_json");
    expect(reviewInsert?.args).toContain(JSON.stringify(approvedChecklist));
  });

  it("marks externally supplied evidence as untrusted in object and database metadata", async () => {
    const bound: Array<{ sql: string; args: unknown[] }> = [];
    let putOptions: R2PutOptions | undefined;
    const dbContext = context((sql) => sql.includes("FROM research_runs") ? { id: "research-1" } : null,
      (sql, args) => bound.push({ sql, args }));
    (dbContext as { bucket: R2Bucket }).bucket = {
      put: async (_key: string, _value: unknown, options?: R2PutOptions) => { putOptions = options; return null; },
    } as unknown as R2Bucket;

    await storeEvidence(dbContext, {
      schema_version: 1,
      workflow_run_id: "research-run",
      idempotency_key: "evidence-provenance",
      company_id: "company-1",
      research_run_id: "research-1",
      filename: "source.md",
      content_type: "text/markdown",
      content: "External page content, including untrusted instructions.",
      source_url: "https://example.com/research",
    });

    expect(putOptions?.customMetadata?.provenance).toBe("untrusted_external");
    const evidenceInsert = bound.find(({ sql }) => sql.includes("INSERT INTO evidence_refs"));
    expect(evidenceInsert?.sql).toContain("provenance");
    expect(evidenceInsert?.args).toContain("untrusted_external");
    const auditInsert = bound.find(({ sql }) => sql.includes("INSERT OR IGNORE INTO workflow_events"));
    expect(auditInsert?.sql).toContain("company_id");
    expect(auditInsert?.args[7]).toBe("company-1");
  });

  it("deletes newly stored evidence when its D1 insert fails", async () => {
    const deleted: string[] = [];
    const db = {
      prepare(sql: string) {
        return {
          bind(...args: unknown[]) {
            return {
              run: async () => {
                if (sql.includes("INSERT INTO evidence_refs")) throw new Error("D1 unavailable");
                return { success: true, meta: { changes: 1 } };
              },
              first: async () => {
                if (sql.includes("FROM research_runs")) return { id: "research-1" };
                return null;
              },
            };
          },
        };
      },
    } as unknown as D1Database;
    const bucket = {
      put: async () => null,
      delete: async (key: string) => { deleted.push(key); },
    } as unknown as R2Bucket;

    await expect(storeEvidence({ db, bucket, now: "2026-09-11T08:00:00.000Z" }, {
      schema_version: 1,
      workflow_run_id: "research-run",
      idempotency_key: "evidence-d1-failure",
      company_id: "company-1",
      research_run_id: "research-1",
      filename: "source.md",
      content_type: "text/markdown",
      content: "Evidence",
    })).rejects.toThrow("D1 unavailable");

    expect(deleted).toHaveLength(1);
    expect(deleted[0]).toMatch(/^research\/company-1\/research-1\/[0-9a-f-]+-source\.md$/);
  });

  it("keeps a completed side effect fail-closed when idempotency finalization fails", async () => {
    const deleted: string[] = [];
    let puts = 0;
    let aborts = 0;
    let claimed = false;
    let metadata: string | null = null;
    const db = {
      prepare(sql: string) {
        return {
          bind(...args: unknown[]) {
            if (sql.includes("INSERT OR IGNORE INTO workflow_events")) metadata = String(args[9]);
            return {
              run: async () => {
                if (sql.includes("UPDATE workflow_events")) throw new Error("completion unavailable");
                if (sql.includes("DELETE FROM workflow_events")) aborts += 1;
                if (sql.includes("INSERT OR IGNORE INTO workflow_events")) {
                  if (claimed) return { meta: { changes: 0 } };
                  claimed = true;
                }
                return { meta: { changes: 1 } };
              },
              first: async () => {
                if (sql.includes("FROM workflow_events")) return metadata ? { metadata_json: metadata } : null;
                if (sql.includes("FROM research_runs")) return { id: "research-1" };
                return null;
              },
            };
          },
        };
      },
    } as unknown as D1Database;
    const bucket = {
      put: async () => { puts += 1; return null; },
      delete: async (key: string) => { deleted.push(key); },
    } as unknown as R2Bucket;

    let finalizationError: unknown;
    try {
      await storeEvidence({ db, bucket, now: "2026-09-11T08:00:00.000Z" }, {
        schema_version: 1,
        workflow_run_id: "research-run",
        idempotency_key: "evidence-completion-failure",
        company_id: "company-1",
        research_run_id: "research-1",
        filename: "source.md",
        content_type: "text/markdown",
        content: "Evidence",
      });
    } catch (error) {
      finalizationError = error;
    }
    expect(finalizationError).toMatchObject({
      message: "mutation outcome committed; idempotency finalization failed; do not retry with a new key / inspect state",
      cause: { message: "completion unavailable" },
    });

    expect(deleted).toHaveLength(1);
    expect(deleted[0]).toMatch(/^research\/company-1\/research-1\/[0-9a-f-]+-source\.md$/);
    expect(aborts).toBe(0);

    await expect(storeEvidence({ db, bucket, now: "2026-09-11T08:00:01.000Z" }, {
      schema_version: 1,
      workflow_run_id: "research-run",
      idempotency_key: "evidence-completion-failure",
      company_id: "company-1",
      research_run_id: "research-1",
      filename: "source.md",
      content_type: "text/markdown",
      content: "Evidence",
    })).rejects.toThrow("already in progress");
    expect(puts).toBe(1);
  });

  it("retains the evidence reference when R2 compensation after finalization failure cannot delete the object", async () => {
    const statements: string[] = [];
    let metadata: string | null = null;
    const db = {
      prepare(sql: string) {
        statements.push(sql);
        return {
          bind(...args: unknown[]) {
            if (sql.includes("INSERT OR IGNORE INTO workflow_events")) metadata = String(args[9]);
            return {
              run: async () => {
                if (sql.includes("UPDATE workflow_events")) throw new Error("completion unavailable");
                return { meta: { changes: 1 } };
              },
              first: async () => {
                if (sql.includes("FROM workflow_events")) return metadata ? { metadata_json: metadata } : null;
                if (sql.includes("FROM research_runs")) return { id: "research-1" };
                return null;
              },
            };
          },
        };
      },
    } as unknown as D1Database;
    const bucket = {
      put: async () => null,
      delete: async () => { throw new Error("R2 unavailable"); },
    } as unknown as R2Bucket;

    await expect(storeEvidence({ db, bucket, now: "2026-09-11T08:00:00.000Z" }, {
      schema_version: 1,
      workflow_run_id: "research-run",
      idempotency_key: "evidence-r2-compensation-failure",
      company_id: "company-1",
      research_run_id: "research-1",
      filename: "source.md",
      content_type: "text/markdown",
      content: "Evidence",
    })).rejects.toThrow("mutation outcome committed; idempotency finalization failed");

    expect(statements.some((sql) => sql.includes("DELETE FROM evidence_refs"))).toBe(false);
    expect(statements.some((sql) => sql.includes("evidence_cleanup_failed"))).toBe(true);
  });

  it("releases a failed non-send claim so the same payload can succeed on retry", async () => {
    const sqlite = new DatabaseSync(":memory:");
    for (const migration of ["0001_outreach_base.sql", "0002_outbound_draft_claim.sql", "0003_request_nonces.sql", "0004_workflow_recovery.sql", "0005_retry_reservations.sql", "0006_workflow_event_company.sql"]) {
      sqlite.exec(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), "utf8"));
    }
    let failCompanyInsert = true;
    const db = {
      prepare(sql: string) {
        const statement = sqlite.prepare(sql);
        return { bind(...args: unknown[]) { return {
          run: async () => { const result = statement.run(...args as SQLInputValue[]); return { meta: { changes: result.changes } }; },
          first: async <T>() => {
            if (sql.includes("INSERT INTO companies") && failCompanyInsert) {
              failCompanyInsert = false;
              throw new Error("transient D1 failure");
            }
            return (statement.get(...args as SQLInputValue[]) as T | undefined) ?? null;
          },
        }; } };
      },
    } as unknown as D1Database;
    const input = { schema_version: 1 as const, workflow_run_id: "run-retry", idempotency_key: "company-retry", name: "Retry Ltd", website_url: "https://retry.example" };

    await expect(createCompany({ db, bucket: {} as R2Bucket, now: "2026-09-11T08:00:00.000Z" }, input)).rejects.toThrow("transient D1 failure");
    await expect(createCompany({ db, bucket: {} as R2Bucket, now: "2026-09-11T08:00:01.000Z" }, input)).resolves.toSatisfy((result) => text(result).state === "discovered");
    expect(sqlite.prepare("SELECT COUNT(*) AS count FROM workflow_events WHERE entity_type = 'company'").get()).toEqual({ count: 1 });
    sqlite.close();
  });

  it("rejects a contact whose company does not exist", async () => {
    const dbContext = context((sql) => {
      if (sql.includes("FROM companies")) return null;
      return null;
    });

    await expect(createContact(dbContext, {
      schema_version: 1,
      workflow_run_id: "research-run",
      idempotency_key: "contact-1",
      company_id: "missing-company",
      email: "contact@example.com",
      verification_method: "administrator_verified",
      verified_at: "2026-09-11T08:00:00.000Z",
      verification_evidence_id: "evidence-1",
    })).rejects.toThrow("Company not found");
  });

  it("rejects an email upsert that would move an existing contact to another company", async () => {
    const dbContext = context((sql) => {
      if (sql.includes("FROM companies")) return { id: "company-1", status: "researched" };
      if (sql.includes("FROM evidence_refs")) return { id: "evidence-1" };
      if (sql.includes("FROM contacts")) return { id: "contact-existing", company_id: "other-company" };
      if (sql.includes("INSERT INTO contacts")) return { id: "contact-existing", company_id: "company-1" };
      return null;
    });

    await expect(createContact(dbContext, {
      schema_version: 1,
      workflow_run_id: "research-run",
      idempotency_key: "contact-1",
      company_id: "company-1",
      email: "contact@example.com",
      verification_method: "administrator_verified",
      verified_at: "2026-09-11T08:00:00.000Z",
      verification_evidence_id: "evidence-1",
    })).rejects.toThrow("Existing contact belongs to a different company");
  });

  it("rejects a finding when its research run belongs to another company", async () => {
    const dbContext = context((sql) => {
      if (sql.includes("FROM research_runs")) return null;
      return null;
    });

    await expect(recordFinding(dbContext, {
      schema_version: 1,
      workflow_run_id: "research-run",
      idempotency_key: "finding-1",
      company_id: "company-1",
      research_run_id: "run-1",
      category: "fit",
      finding: "A sourced finding",
      confidence: "high",
      source_url: "https://example.com/source",
    })).rejects.toThrow("Research run does not belong to company and workflow run");
  });

  it("fails closed when the configured daily send limit is invalid", async () => {
    const result = await sendApproved(context(() => null), {
      schema_version: 1,
      workflow_run_id: "operator-run",
      idempotency_key: "send-1",
      draft_id: "draft-1",
    }, true, Number.NaN, 0, undefined);

    expect(text(result)).toEqual({ state: "paused", reason: "daily_limit_invalid" });
  });

  it("rejects a reused send idempotency key when it names a different draft", async () => {
    const dbContext = context((sql) => sql.includes("send_idempotency_key")
      ? { id: "message-1", draft_id: "other-draft", status: "sent", provider_message_id: "provider-1" }
      : null);

    await expect(sendApproved(dbContext, {
      schema_version: 1,
      workflow_run_id: "operator-run",
      idempotency_key: "send-1",
      draft_id: "draft-1",
    }, true, 25, 0, "secret")).rejects.toThrow("Send idempotency key already used for a different draft");
  });

  it("rejects a migrated approval whose persisted checklist is incomplete before claiming a send", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ id: "provider-1" }), { status: 200 }));
    const db = {
      prepare(sql: string) {
        return {
          bind() {
            return {
              run: async () => ({ success: true, meta: { changes: 1 } }),
              first: async () => {
                if (sql.startsWith("SELECT id, draft_id, status, provider_message_id FROM messages")) return null;
                if (sql.includes("FROM outreach_drafts")) return {
                  state: "approved", workflow_run_id: "author-run", company_id: "company-1", contact_id: "contact-1",
                  email: "contact@example.com", verification_method: "administrator_verified", verified_at: "2026-09-11T07:00:00.000Z",
                  verification_evidence_id: "evidence-1", verification_evidence_present: 1, recipient_suppressed: 0, send_idempotency_used: 0,
                  reviewer_run_id: "reviewer-run", reviewed_at: "2026-09-11T07:00:00.000Z", approval_checklist_json: "{}", subject: "Subject", body: "Body",
                };
                return null;
              },
            };
          },
        };
      },
      batch: async () => [],
    } as unknown as D1Database;

    try {
      const result = await sendApproved({ db, bucket: {} as R2Bucket, now: "2026-09-11T08:00:00.000Z" }, {
        schema_version: 1, workflow_run_id: "operator-run", idempotency_key: "send-migrated-approval", draft_id: "draft-1",
      }, true, 25, 0, "secret");
      expect(text(result)).toEqual({ state: "rejected", reason: "send_gate_failed" });
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it("does not call the provider when the atomic draft claim is already held", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const db = {
      prepare(sql: string) {
        return {
          bind() {
            return {
              run: async () => sql.startsWith("INSERT OR IGNORE INTO messages")
                ? { success: true, meta: { changes: 0 } }
                : { success: true, meta: { changes: 1 } },
              first: async () => {
                if (sql.startsWith("SELECT id, draft_id, status, provider_message_id FROM messages")) return null;
                if (sql.includes("FROM outreach_drafts")) return {
                  id: "draft-1", state: "approved", workflow_run_id: "author-run", company_id: "company-1", contact_id: "contact-1",
                  email: "contact@example.com", verification_method: "administrator_verified", verified_at: "2026-09-11T07:00:00.000Z",
                  verification_evidence_id: "evidence-1", verification_evidence_present: 1, recipient_suppressed: 0, send_idempotency_used: 0,
                  reviewer_run_id: "reviewer-run", reviewed_at: "2026-09-11T07:00:00.000Z", approval_checklist_json: JSON.stringify(approvedChecklist), subject: "Subject", body: "Body",
                };
                return null;
              },
            };
          },
        };
      },
    } as unknown as D1Database;
    const result = await sendApproved({ db, bucket: {} as R2Bucket, now: "2026-09-11T08:00:00.000Z" }, {
      schema_version: 1,
      workflow_run_id: "operator-run",
      idempotency_key: "send-1",
      draft_id: "draft-1",
    }, true, 25, 0, "secret");

    expect(text(result)).toEqual({ state: "rejected", reason: "draft_already_claimed" });
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("marks a claimed message failed and records a bounded retry event when Resend throws", async () => {
    const writes: Array<{ sql: string; args: unknown[] }> = [];
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network socket refused with sensitive details"));
    const db = {
      prepare(sql: string) {
        return {
          bind(...args: unknown[]) {
            return {
              run: async () => {
                writes.push({ sql, args });
                return { success: true, meta: { changes: 1 } };
              },
              first: async () => {
                if (sql.startsWith("SELECT id, draft_id, status, provider_message_id FROM messages")) return null;
                if (sql.includes("FROM outreach_drafts")) return {
                  state: "approved", workflow_run_id: "author-run", company_id: "company-1", contact_id: "contact-1",
                  email: "contact@example.com", verification_method: "administrator_verified", verified_at: "2026-09-11T07:00:00.000Z",
                  verification_evidence_id: "evidence-1", verification_evidence_present: 1, recipient_suppressed: 0, send_idempotency_used: 0,
                  reviewer_run_id: "reviewer-run", reviewed_at: "2026-09-11T07:00:00.000Z", approval_checklist_json: JSON.stringify(approvedChecklist), subject: "Subject", body: "Body",
                };
                return null;
              },
            };
          },
        };
      },
      batch: async (statements: unknown[]) => {
        for (const statement of statements as Array<{ run: () => Promise<unknown> }>) await statement.run();
        return [];
      },
    } as unknown as D1Database;

    await expect(sendApproved({ db, bucket: {} as R2Bucket, now: "2026-09-11T08:00:00.000Z" }, {
      schema_version: 1,
      workflow_run_id: "operator-run",
      idempotency_key: "send-network-failure",
      draft_id: "draft-1",
    }, true, 25, 0, "secret")).resolves.toMatchObject({ content: [{ type: "text" }] });

    expect(writes.some(({ sql }) => sql.startsWith("UPDATE messages SET status = 'failed'"))).toBe(true);
    const failureEvent = writes.find(({ sql }) => sql.includes("INSERT INTO workflow_events") && sql.includes("resend_send_failed"));
    expect(failureEvent?.args.some((value) => typeof value === "string" && value.includes("network socket refused"))).toBe(true);
    fetchSpy.mockRestore();
  });

  it.each([
    ["a non-JSON provider failure", new Response("upstream unavailable", { status: 502 })],
    ["a null provider failure body", new Response("null", { status: 400, headers: { "content-type": "application/json" } })],
    ["a success response without a provider id", new Response("{}", { status: 200, headers: { "content-type": "application/json" } })],
  ])("marks a claimed message failed when Resend returns %s", async (_label, response) => {
    const writes: string[] = [];
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(response);
    const db = {
      prepare(sql: string) {
        return {
          bind() {
            return {
              run: async () => { writes.push(sql); return { success: true, meta: { changes: 1 } }; },
              first: async () => {
                if (sql.startsWith("SELECT id, draft_id, status, provider_message_id FROM messages")) return null;
                if (sql.includes("FROM outreach_drafts")) return {
                  state: "approved", workflow_run_id: "author-run", company_id: "company-1", contact_id: "contact-1",
                  email: "contact@example.com", verification_method: "administrator_verified", verified_at: "2026-09-11T07:00:00.000Z",
                  verification_evidence_id: "evidence-1", verification_evidence_present: 1, recipient_suppressed: 0, send_idempotency_used: 0,
                  reviewer_run_id: "reviewer-run", reviewed_at: "2026-09-11T07:00:00.000Z", approval_checklist_json: JSON.stringify(approvedChecklist), subject: "Subject", body: "Body",
                };
                return null;
              },
            };
          },
        };
      },
      batch: async (statements: unknown[]) => {
        for (const statement of statements as Array<{ run: () => Promise<unknown> }>) await statement.run();
        return [];
      },
    } as unknown as D1Database;

    try {
      const result = await sendApproved({ db, bucket: {} as R2Bucket, now: "2026-09-11T08:00:00.000Z" }, {
        schema_version: 1,
        workflow_run_id: "operator-run",
        idempotency_key: `send-invalid-response-${_label}`,
        draft_id: "draft-1",
      }, true, 25, 0, "secret");

      expect(text(result).state).toBe("failed");
      expect(writes.some((sql) => sql.startsWith("UPDATE messages SET status = 'failed'"))).toBe(true);
      expect(writes.some((sql) => sql.includes("workflow_events") && sql.includes("resend_send_failed"))).toBe(true);
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it("records a definitive Resend 4xx as non-retryable", async () => {
    const bound: unknown[][] = [];
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ message: "invalid recipient" }), { status: 400 }));
    const db = {
      prepare(sql: string) {
        return {
          bind(...args: unknown[]) {
            bound.push(args);
            return {
              run: async () => ({ success: true, meta: { changes: 1 } }),
              first: async () => {
                if (sql.startsWith("SELECT id, draft_id, status, provider_message_id")) return null;
                if (sql.includes("FROM outreach_drafts")) return { state: "approved", workflow_run_id: "author-run", company_id: "company-1", contact_id: "contact-1", email: "contact@example.com", verification_method: "administrator_verified", verified_at: "2026-09-11T07:00:00.000Z", verification_evidence_id: "evidence-1", verification_evidence_present: 1, recipient_suppressed: 0, send_idempotency_used: 0, reviewer_run_id: "reviewer-run", reviewed_at: "2026-09-11T07:00:00.000Z", approval_checklist_json: JSON.stringify(approvedChecklist), subject: "Subject", body: "Body" };
                return null;
              },
            };
          },
        };
      },
      batch: async (statements: Array<{ run: () => Promise<unknown> }>) => { for (const statement of statements) await statement.run(); return []; },
    } as unknown as D1Database;
    try {
      await sendApproved({ db, bucket: {} as R2Bucket, now: "2026-09-11T08:00:00.000Z" }, { schema_version: 1, workflow_run_id: "operator-run", idempotency_key: "send-definitive-4xx", draft_id: "draft-1" }, true, 25, 0, "secret");
      expect(bound.some((args) => args.includes("resend_definitive_4xx"))).toBe(true);
    } finally { fetchSpy.mockRestore(); }
  });

  it("retries a transient failed message within the bounded attempt window", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ id: "provider-retry" }), { status: 200 }));
    const writes: string[] = [];
    const db = {
      prepare(sql: string) { return { bind() { return { run: async () => { writes.push(sql); return { success: true, meta: { changes: 1 } }; }, first: async () => {
        if (sql.startsWith("SELECT id, draft_id, status, provider_message_id")) return { id: "message-1", draft_id: "draft-1", status: "failed", provider_message_id: null, failure_code: "resend_network_error", send_attempts: 1, created_at: "2026-09-11T07:00:00.000Z" };
        if (sql.includes("FROM outreach_drafts")) return { state: "approved", workflow_run_id: "author-run", company_id: "company-1", contact_id: "contact-1", email: "contact@example.com", verification_method: "administrator_verified", verified_at: "2026-09-11T07:00:00.000Z", verification_evidence_id: "evidence-1", verification_evidence_present: 1, recipient_suppressed: 0, send_idempotency_used: 1, reviewer_run_id: "reviewer-run", reviewed_at: "2026-09-11T07:00:00.000Z", approval_checklist_json: JSON.stringify(approvedChecklist), subject: "Subject", body: "Body" };
        return null;
      } }; } }; },
    } as unknown as D1Database;
    try {
      await expect(sendApproved({ db, bucket: {} as R2Bucket, now: "2026-09-11T08:00:00.000Z" }, { schema_version: 1, workflow_run_id: "operator-run", idempotency_key: "send-retry", draft_id: "draft-1" }, true, 25, 0, "secret")).resolves.toSatisfy((result) => text(result).state === "sent");
      expect(writes.some((sql) => sql.startsWith("UPDATE messages SET status = 'pending'"))).toBe(true);
      expect(writes.some((sql) => sql.includes("send_attempts < 3") && sql.includes("COUNT(*) FROM messages"))).toBe(true);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    } finally { fetchSpy.mockRestore(); }
  });

  it("does not retry after the bounded attempt limit", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const db = { prepare: () => ({ bind: () => ({ first: async () => ({ id: "message-1", draft_id: "draft-1", status: "failed", provider_message_id: null, failure_code: "resend_network_error", send_attempts: 3, created_at: "2026-09-11T07:00:00.000Z" }) }) }) } as unknown as D1Database;
    try {
      const result = await sendApproved({ db, bucket: {} as R2Bucket, now: "2026-09-11T08:00:00.000Z" }, { schema_version: 1, workflow_run_id: "operator-run", idempotency_key: "send-retry-exhausted", draft_id: "draft-1" }, true, 25, 0, "secret");
      expect(text(result)).toMatchObject({ id: "message-1", state: "failed", idempotent_replay: true });
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally { fetchSpy.mockRestore(); }
  });

  it("records two consecutive transient failures under the migrated unique workflow-event constraint", async () => {
    const sqlite = new DatabaseSync(":memory:");
    for (const migration of ["0001_outreach_base.sql", "0002_outbound_draft_claim.sql", "0003_request_nonces.sql", "0004_workflow_recovery.sql", "0006_workflow_event_company.sql"]) sqlite.exec(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), "utf8"));
    sqlite.exec(`
      INSERT INTO companies VALUES ('company-1', 1, 'Company', 'example.com', 'https://example.com', 'researched', NULL, NULL, '2026-09-11T07:00:00.000Z', '2026-09-11T07:00:00.000Z');
      INSERT INTO evidence_refs (id, schema_version, company_id, workflow_run_id, object_key, content_type, byte_size, sha256, source_url, captured_at, expires_at, created_at, provenance) VALUES ('evidence-1', 1, 'company-1', 'run', 'e', 'text/plain', 1, 'hash', NULL, '2026-09-11T07:00:00.000Z', '2026-09-12T07:00:00.000Z', '2026-09-11T07:00:00.000Z', 'untrusted_external');
      INSERT INTO contacts VALUES ('contact-1', 1, 'company-1', 'contact@example.com', 'contact@example.com', NULL, NULL, 'administrator_verified', '2026-09-11T07:00:00.000Z', 'evidence-1', 0, '2026-09-11T07:00:00.000Z', '2026-09-11T07:00:00.000Z');
      INSERT INTO outreach_drafts VALUES ('draft-1', 1, 'company-1', 'contact-1', 'author-run', 'draft-key', 'approved', 'Subject', 'Body', '["evidence-1"]', '["https://example.com"]', '2026-09-11T07:00:00.000Z', '2026-09-11T07:00:00.000Z');
      INSERT INTO review_runs (id, schema_version, draft_id, reviewer_run_id, decision, policy_version, findings_json, reviewed_at, created_at, approval_checklist_json) VALUES ('review-1', 1, 'draft-1', 'reviewer-run', 'approved', 'v1', '["ok"]', '2026-09-11T07:00:00.000Z', '2026-09-11T07:00:00.000Z', '${JSON.stringify(approvedChecklist)}');
      INSERT INTO messages (id, schema_version, draft_id, company_id, contact_id, send_idempotency_key, direction, status, subject, body, created_at, updated_at, send_attempts, failure_code) VALUES ('message-1', 1, 'draft-1', 'company-1', 'contact-1', 'retry-key', 'outbound', 'failed', 'Subject', 'Body', '2026-09-11T07:00:00.000Z', '2026-09-11T07:00:00.000Z', 1, 'resend_network_error');
    `);
    const db = {
      prepare(sql: string) { const statement = sqlite.prepare(sql); return { bind(...args: unknown[]) { return { run: async () => { const result = statement.run(...args as SQLInputValue[]); return { meta: { changes: result.changes } }; }, first: async <T>() => (statement.get(...args as SQLInputValue[]) as T | undefined) ?? null }; } }; },
      batch: async (statements: Array<{ run: () => Promise<unknown> }>) => { sqlite.exec("BEGIN"); try { for (const statement of statements) await statement.run(); sqlite.exec("COMMIT"); return []; } catch (error) { sqlite.exec("ROLLBACK"); throw error; } },
    } as unknown as D1Database;
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network"));
    try {
      await sendApproved({ db, bucket: {} as R2Bucket, now: "2026-09-11T08:00:00.000Z" }, { schema_version: 1, workflow_run_id: "operator-run", idempotency_key: "retry-key", draft_id: "draft-1" }, true, 25, 0, "secret");
      await sendApproved({ db, bucket: {} as R2Bucket, now: "2026-09-11T08:01:00.000Z" }, { schema_version: 1, workflow_run_id: "operator-run", idempotency_key: "retry-key", draft_id: "draft-1" }, true, 25, 0, "secret");
      expect(sqlite.prepare("SELECT COUNT(*) AS count FROM workflow_events WHERE tool_name = 'resend_send_failed'").get()).toEqual({ count: 2 });
      expect(sqlite.prepare("SELECT status, send_attempts FROM messages WHERE id = 'message-1'").get()).toEqual({ status: "failed", send_attempts: 3 });
    } finally { fetchSpy.mockRestore(); sqlite.close(); }
  });

  it("atomically reserves the final current-day retry slot for only one yesterday-failed message", async () => {
    const sqlite = new DatabaseSync(":memory:");
    for (const migration of ["0001_outreach_base.sql", "0002_outbound_draft_claim.sql", "0003_request_nonces.sql", "0004_workflow_recovery.sql", "0005_retry_reservations.sql"]) sqlite.exec(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), "utf8"));
    const yesterday = "2026-09-10T23:59:00.000Z";
    const today = "2026-09-11T00:01:00.000Z";
    for (let index = 0; index < 24; index += 1) sqlite.prepare("INSERT INTO messages (id, schema_version, direction, status, subject, body, created_at, updated_at, last_attempt_at) VALUES (?, 1, 'outbound', 'sent', 's', 'b', ?, ?, ?)").run(`today-${index}`, today, today, today);
    for (const id of ["retry-a", "retry-b"]) sqlite.prepare("INSERT INTO messages (id, schema_version, direction, status, subject, body, created_at, updated_at, send_attempts, failure_code, last_attempt_at) VALUES (?, 1, 'outbound', 'failed', 's', 'b', ?, ?, 1, 'resend_network_error', ?)").run(id, yesterday, yesterday, yesterday);
    const reserve = async (id: string) => sqlite.prepare("UPDATE messages SET status = 'pending', send_attempts = send_attempts + 1, last_attempt_at = ? WHERE id = ? AND status = 'failed' AND send_attempts < 3 AND created_at >= ? AND (SELECT COUNT(*) FROM messages WHERE direction = 'outbound' AND status IN ('pending', 'sent', 'delivered') AND last_attempt_at >= ?) < ?").run(today, id, "2026-09-10T00:01:00.000Z", "2026-09-11T00:00:00.000Z", 25).changes;

    const reservations = await Promise.all([reserve("retry-a"), reserve("retry-b")]);

    expect(reservations.sort()).toEqual([0, 1]);
    expect(sqlite.prepare("SELECT COUNT(*) AS count FROM messages WHERE status = 'pending' AND last_attempt_at = ?").get(today)).toEqual({ count: 1 });
    expect(sqlite.prepare("SELECT COUNT(*) AS count FROM messages WHERE status = 'failed' AND id IN ('retry-a', 'retry-b')").get()).toEqual({ count: 1 });
    sqlite.close();
  });

  it("atomically admits only one concurrent draft when both race for the final daily allowance", async () => {
    const queries: string[] = [];
    let claims = 0;
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ id: "provider-1" }), { status: 200 }));
    const db = {
      prepare(sql: string) {
        queries.push(sql);
        return {
          bind() {
            return {
              run: async () => sql.startsWith("INSERT OR IGNORE INTO messages")
                ? { success: true, meta: { changes: ++claims === 1 ? 1 : 0 } }
                : { success: true, meta: { changes: 1 } },
              first: async () => {
                if (sql.startsWith("SELECT id, draft_id, status, provider_message_id FROM messages")) return null;
                if (sql.includes("COUNT(*) AS count FROM messages")) return { count: 25 };
                if (sql.includes("FROM outreach_drafts")) return {
                  state: "approved", workflow_run_id: "author-run", company_id: "company-1", contact_id: "contact-1",
                  email: "contact@example.com", verification_method: "administrator_verified", verified_at: "2026-09-11T07:00:00.000Z",
                  verification_evidence_id: "evidence-1", verification_evidence_present: 1, recipient_suppressed: 0, send_idempotency_used: 0,
                  reviewer_run_id: "reviewer-run", reviewed_at: "2026-09-11T07:00:00.000Z", approval_checklist_json: JSON.stringify(approvedChecklist), subject: "Subject", body: "Body",
                };
                return null;
              },
            };
          },
        };
      },
    } as unknown as D1Database;
    const baseContext = { db, bucket: {} as R2Bucket, now: "2026-09-11T08:00:00.000Z" };

    const results = await Promise.all([
      sendApproved(baseContext, { schema_version: 1, workflow_run_id: "operator-run", idempotency_key: "send-1", draft_id: "draft-1" }, true, 25, 24, "secret"),
      sendApproved(baseContext, { schema_version: 1, workflow_run_id: "operator-run", idempotency_key: "send-2", draft_id: "draft-2" }, true, 25, 24, "secret"),
    ]);

    expect(results.map(text).map((result) => result.state).sort()).toEqual(["paused", "sent"]);
    expect(results.map(text)).toContainEqual({ state: "paused", reason: "daily_limit_reached" });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect((fetchSpy.mock.calls[0]?.[1] as RequestInit).headers).toMatchObject({ "Idempotency-Key": expect.any(String) });
    expect(queries.find((sql) => sql.startsWith("INSERT OR IGNORE INTO messages"))).toContain("SELECT");
    fetchSpy.mockRestore();
  });

  it.each(["missing", "expired"])("rejects a draft whose %s contact verification evidence is unavailable", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const db = {
      prepare(sql: string) {
        return {
          bind() {
            return {
              run: async () => ({ success: true, meta: { changes: 1 } }),
              first: async () => {
                if (sql.startsWith("SELECT id, draft_id, status, provider_message_id FROM messages")) return null;
                if (sql.includes("FROM outreach_drafts")) return {
                  state: "approved", workflow_run_id: "author-run", company_id: "company-1", contact_id: "contact-1",
                  email: "contact@example.com", verification_method: "administrator_verified", verified_at: "2026-09-11T07:00:00.000Z",
                  verification_evidence_id: "evidence-1", verification_evidence_present: 0, recipient_suppressed: 0, send_idempotency_used: 0,
                  reviewer_run_id: "reviewer-run", reviewed_at: "2026-09-11T07:00:00.000Z", approval_checklist_json: JSON.stringify(approvedChecklist), subject: "Subject", body: "Body",
                };
                return null;
              },
            };
          },
        };
      },
    } as unknown as D1Database;

    const result = await sendApproved({ db, bucket: {} as R2Bucket, now: "2026-09-11T08:00:00.000Z" }, {
      schema_version: 1,
      workflow_run_id: "operator-run",
      idempotency_key: `send-${Date.now()}`,
      draft_id: "draft-1",
    }, true, 25, 0, "secret");

    expect(text(result)).toEqual({ state: "rejected", reason: "send_gate_failed" });
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
