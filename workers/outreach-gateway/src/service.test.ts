import { describe, expect, it, vi } from "vitest";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { readFileSync } from "node:fs";
import { createCompany, createContact, createDraft, holdQualification, lookupCompanyIdentity, preparePreReviewPacket, readPreReviewPacket, recordCompanyAlias, recordFinding, reopenQualification, reviewPreReviewPacket, scheduleFollowUp, sendApproved, startSupplementalResearch, completeResearch, storeEvidence } from "./service";

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
  decision_maker_verified: true,
  company_specific_evidence_checked: true,
  devils_advocate_objections_addressed: true,
  timely_trigger_checked: true,
  fit_score_checked: true,
  person_workflow_authority_checked: true,
  booking_link_checked: true,
  email_link_checked: true,
  website_link_checked: true,
  signature_checked: true,
  opt_out_language_checked: true,
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
              all: async () => ({ results: [] }),
            };
          },
        };
      },
      batch: async () => [],
    },
    bucket: { put: async () => undefined },
    credentialRole: "reviewer",
    now: "2026-09-11T08:00:00.000Z",
  } as unknown as Parameters<typeof createDraft>[0];
}

describe("outreach service safety boundaries", () => {
  it("keeps a hold visible through supplemental research and reopens only on post-hold evidence", async () => {
    const sqlite = new DatabaseSync(":memory:");
    for (const migration of ["0001_outreach_base.sql", "0002_outbound_draft_claim.sql", "0003_request_nonces.sql", "0004_workflow_recovery.sql", "0006_workflow_event_company.sql", "0009_company_name_dedup.sql", "0010_qualification_history.sql"]) {
      sqlite.exec(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), "utf8"));
    }
    const d1 = {
      prepare(sql: string) {
        const statement = sqlite.prepare(sql);
        return { bind(...args: unknown[]) { return {
          run: async () => { const result = statement.run(...args as SQLInputValue[]); return { success: true, meta: { changes: result.changes } }; },
          first: async <T>() => (statement.get(...args as SQLInputValue[]) as T | undefined) ?? null,
        }; } };
      },
      batch: async (statements: Array<{ run: () => Promise<unknown> }>) => Promise.all(statements.map((statement) => statement.run())),
    } as unknown as D1Database;
    const now = "2026-10-01T08:00:00.000Z";
    sqlite.prepare("INSERT INTO companies (id, schema_version, name, normalized_domain, website_url, status, fit_score, fit_summary, source_lane, created_at, updated_at) VALUES ('company-1', 1, 'Example Co', 'example.org', 'https://example.org', 'discovered', 80, 'Fit', 'paid_direct_request', ?, ?)").run(now, now);
    sqlite.prepare("INSERT INTO evidence_refs (id, schema_version, company_id, workflow_run_id, object_key, content_type, byte_size, sha256, source_url, provenance, captured_at, expires_at, created_at) VALUES ('hold-evidence', 1, 'company-1', 'wave-1', 'company-1/hold.md', 'text/markdown', 10, 'hold-hash', 'https://example.org/expansion', 'untrusted_external', '2026-10-01T07:30:00.000Z', '2026-12-30T07:30:00.000Z', '2026-10-01T07:30:00.000Z')").run();
    const ctx = { db: d1, bucket: {} as R2Bucket, now } as Parameters<typeof holdQualification>[0];
    const held = text(await holdQualification(ctx, { schema_version: 1, workflow_run_id: "wave-1", idempotency_key: "hold-1", company_id: "company-1", reason_code: "no_current_buyer_need", reason: "The public signal is expansion only; no current buyer request was found.", basis_evidence_ref_id: "hold-evidence" }));
    expect(held.state).toBe("held");
    expect(sqlite.prepare("SELECT status FROM companies WHERE id = 'company-1'").get()).toEqual({ status: "paused" });
    expect(() => sqlite.prepare("UPDATE qualification_history SET reason = 'edited' WHERE id = ?").run(held.id)).toThrow("append-only");

    const supplemental = text(await startSupplementalResearch({ ...ctx, now: "2026-10-01T09:00:00.000Z" }, {
      schema_version: 1, workflow_run_id: "new-evidence-run", idempotency_key: "research-again", company_id: "company-1", reason: "Check for a current operator-issued request." }));
    expect(supplemental.supplemental).toBe(true);
    const researchId = supplemental.id as string;
    sqlite.prepare("INSERT INTO evidence_refs (id, schema_version, company_id, workflow_run_id, object_key, content_type, byte_size, sha256, source_url, provenance, captured_at, expires_at, created_at) VALUES ('new-evidence', 1, 'company-1', 'new-evidence-run', 'company-1/new.md', 'text/markdown', 10, 'abc', 'https://example.org/request', 'untrusted_external', '2026-10-01T09:10:00.000Z', '2026-12-30T09:10:00.000Z', '2026-10-01T09:10:00.000Z')").run();
    sqlite.prepare("INSERT INTO research_findings (id, schema_version, research_run_id, category, finding, confidence, source_url, evidence_ref_id, created_at) VALUES ('new-buyer-need', 1, ?, 'paid_buyer_request', 'The buyer published a current paid implementation request.', 'high', 'https://example.org/request', 'new-evidence', '2026-10-01T09:10:00.000Z')").run(researchId);
    await completeResearch({ ...ctx, now: "2026-10-01T09:20:00.000Z" }, { schema_version: 1, workflow_run_id: "new-evidence-run", idempotency_key: "complete-research", company_id: "company-1", research_run_id: researchId });
    expect(sqlite.prepare("SELECT e.id FROM evidence_refs e JOIN research_runs rr ON rr.company_id = e.company_id AND rr.workflow_run_id = e.workflow_run_id WHERE e.id = ? AND e.company_id = ? AND e.expires_at > ? AND e.captured_at > ? AND rr.state = 'researched' AND rr.completed_at > ? LIMIT 1").get("new-evidence", "company-1", "2026-10-01T09:30:00.000Z", "2026-10-01T08:00:00.000Z", "2026-10-01T08:00:00.000Z")).toBeTruthy();
    await expect(preparePreReviewPacket({ ...ctx, now: "2026-10-01T09:25:00.000Z" }, {
      schema_version: 1, workflow_run_id: "author", idempotency_key: "still-held", company_id: "company-1", contact_id: "contact-1",
      subject: "Question", body: "Message with book a time, email us, and see our work anchors.",
      links: [
        { kind: "booking", anchor_text: "book a time", target: "https://fidexa.zohobookings.com/fidexa" },
        { kind: "email", anchor_text: "email us", target: "mailto:farid@fidexa.org" },
        { kind: "website", anchor_text: "see our work", target: "https://www.fidexa.org" },
      ], claim_evidence_ids: ["new-evidence"], source_urls: ["https://example.org/request"],
    })).rejects.toThrow("qualification hold");
    const reopened = text(await reopenQualification({ ...ctx, now: "2026-10-01T09:30:00.000Z" }, { schema_version: 1, workflow_run_id: "requalification", idempotency_key: "reopen-1", company_id: "company-1", reason: "A new current buyer-issued request was verified.", new_evidence_ref_id: "new-evidence", source_lane: "paid_direct_request" }));
    expect(reopened.state).toBe("reopened_for_requalification");
    expect(sqlite.prepare("SELECT decision, reason_code, basis_evidence_ref_id, new_evidence_ref_id FROM qualification_history ORDER BY created_at DESC LIMIT 1").get()).toEqual({ decision: "reopened", reason_code: "new_material_evidence", basis_evidence_ref_id: "new-evidence", new_evidence_ref_id: "new-evidence" });
    expect(sqlite.prepare("SELECT source_lane FROM companies WHERE id = 'company-1'").get()).toEqual({ source_lane: "paid_direct_request" });
    sqlite.close();
  });

  it("surfaces a same-name company collision instead of silently opening a domainless duplicate", async () => {
    const statements: string[] = [];
    const dbContext = context(
      (sql) => sql.includes("identity_name_key IS NULL")
        ? null
        : sql.includes("WHERE identity_name_key = ?") ? { id: "company-existing", name: "Example Company" } : null,
      (sql) => statements.push(sql),
    );

    const result = text(await createCompany(dbContext, {
      schema_version: 1,
      workflow_run_id: "research-run",
      idempotency_key: "same-name-company",
      name: " example company ",
      source_lane: "unclassified",
    }));

    expect(result).toMatchObject({ state: "possible_duplicate", duplicate: true, needs_resolution: true, existing_company_id: "company-existing" });
    expect(statements.some((sql) => sql.includes("INSERT INTO companies"))).toBe(false);
  });

  it("surfaces an evidenced same-entity alias collision without merging or creating a company", async () => {
    const inserted: string[] = [];
    const dbContext = context(
      (sql) => sql.includes("FROM company_aliases") ? null : null,
      (sql) => inserted.push(sql),
    );
    const aliasRows = [{ company_id: "canonical-1", company_name: "Northstar Holdings", alias: "Northstar Foods", alias_type: "trading_name", relation: "same_entity", evidence_ref_id: "evidence-1" }];
    const originalPrepare = dbContext.db.prepare.bind(dbContext.db);
    dbContext.db.prepare = ((sql: string) => {
      const prepared = originalPrepare(sql);
      if (!sql.includes("FROM company_aliases")) return prepared;
      return { ...prepared, bind: (...args: unknown[]) => ({ ...prepared.bind(...args), all: async () => ({ results: aliasRows }) }) };
    }) as typeof dbContext.db.prepare;

    const result = text(await createCompany(dbContext, {
      schema_version: 1,
      workflow_run_id: "research-run",
      idempotency_key: "alias-duplicate",
      name: "Northstar Foods",
      website_url: "https://northstar-foods.example",
      source_lane: "unclassified",
    }));

    expect(result).toMatchObject({ state: "possible_duplicate", needs_resolution: true, identity_candidates: [{ company_id: "canonical-1", relation: "same_entity" }] });
    expect(inserted.some((sql) => sql.includes("INSERT INTO companies"))).toBe(false);
  });

  it("normalizes and searches exact same-entity and related-entity identity facts without merging", async () => {
    const dbContext = context(
      (sql) => sql.includes("FROM company_aliases") ? null : null,
    );
    const originalPrepare = dbContext.db.prepare.bind(dbContext.db);
    dbContext.db.prepare = ((sql: string) => {
      const prepared = originalPrepare(sql);
      if (!sql.includes("FROM company_aliases")) return prepared;
      return {
        ...prepared,
        bind(...args: unknown[]) {
          expect(args).toContain("northstar foods");
          return { ...prepared.bind(...args), all: async () => ({ results: [
            { company_id: "company-1", company_name: "Northstar Ltd", alias_type: "trading_name", relation: "same_entity", evidence_ref_id: "evidence-1" },
            { company_id: "company-2", company_name: "Northstar Group", alias_type: "subsidiary", relation: "related_entity", evidence_ref_id: "evidence-2" },
          ] }) };
        },
      };
    }) as typeof dbContext.db.prepare;

    const result = text(await lookupCompanyIdentity(dbContext, { schema_version: 1, alias: " NORTHSTAR   FOODS " }));
    expect(result.ambiguous).toBe(true);
    expect(result.candidates.map((candidate: { relation: string }) => candidate.relation)).toContain("related_entity");
  });

  it("refuses CRM draft creation unless an approved exact-message packet already exists", async () => {
    const inserted: string[] = [];
    const dbContext = context((sql) => sql.includes("FROM pre_review_packets") ? null : null,
      (sql) => inserted.push(sql));
    await expect(createDraft(dbContext, {
      schema_version: 1,
      workflow_run_id: "author-run",
      idempotency_key: "draft-before-review",
      pre_review_packet_id: "packet-missing",
    })).rejects.toThrow("independently approved exact-message pre-review packet");
    expect(inserted.some((sql) => sql.includes("INSERT INTO outreach_drafts"))).toBe(false);
  });
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

  it.each(["contacts", "messages"])("rejects a cross-company follow-up %s reference", async (table) => {
    const dbContext = context((sql) => {
      if (sql.includes("FROM companies")) return { id: "company-1" };
      if (sql.includes(`FROM ${table}`)) return null;
      return null;
    });
    await expect(scheduleFollowUp(dbContext, { schema_version: 1, workflow_run_id: "run", idempotency_key: `follow-${table}`, company_id: "company-1", due_at: "2026-09-12T08:00:00.000Z", note: "Follow up", ...(table === "contacts" ? { contact_id: "other-contact" } : { message_id: "other-message" }) })).rejects.toThrow("does not belong to company");
  });
  it("requires an all-true checklist on approved pre-review decisions and preserves actionable findings on failures", async () => {
    const failed = await import("./validation").then(({ preReviewDecisionSchema }) => preReviewDecisionSchema.safeParse({
      schema_version: 1, workflow_run_id: "reviewer", idempotency_key: "review-1", packet_id: "packet-1",
      decision: "approved", policy_version: "v1", findings: ["Reviewed; no issues identified."],
    }));
    const needsChanges = await import("./validation").then(({ preReviewDecisionSchema }) => preReviewDecisionSchema.safeParse({
      schema_version: 1, workflow_run_id: "reviewer", idempotency_key: "review-2", packet_id: "packet-1",
      decision: "needs_changes", policy_version: "v1", findings: ["Verify the person's authority from a primary source."],
    }));
    expect(failed.success).toBe(false);
    expect(needsChanges.success).toBe(true);
  });

  it("keeps failed reviews out of CRM drafts and only creates the fresh-PASS version", async () => {
    const sqlite = new DatabaseSync(":memory:");
    for (const migration of ["0001_outreach_base.sql", "0002_outbound_draft_claim.sql", "0003_request_nonces.sql", "0004_workflow_recovery.sql", "0005_retry_reservations.sql", "0006_workflow_event_company.sql", "0007_decision_maker_qualification.sql", "0008_pre_review_packets.sql", "0009_company_name_dedup.sql", "0010_qualification_history.sql"]) sqlite.exec(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), "utf8"));
    const timestamp = "2026-09-30T08:00:00.000Z";
    const evidence = [
      { id: "company-evidence", key: "company.md", source: "https://example.org/operations", content: "The company publicly describes its operating network." },
      { id: "contact-evidence", key: "contact.md", source: "https://example.org/team", content: "The company identifies Alex as its operations director." },
      { id: "authority-evidence", key: "authority.md", source: "https://example.org/team", content: "Alex owns the logistics operating workflow." },
    ];
    sqlite.prepare("INSERT INTO companies (id, schema_version, name, normalized_domain, website_url, status, fit_score, fit_summary, source_lane, created_at, updated_at) VALUES (?, 1, ?, ?, ?, 'researched', 85, ?, 'paid_direct_request', ?, ?)").run("company-1", "Example Co", "example.org", "https://example.org", "Documented workflow fit", timestamp, timestamp);
    sqlite.prepare("INSERT INTO research_runs (id, schema_version, company_id, workflow_run_id, state, started_at, completed_at, created_at, updated_at) VALUES ('research-1', 1, 'company-1', 'research-run', 'researched', ?, ?, ?, ?)").run(timestamp, timestamp, timestamp, timestamp);
    for (const item of evidence) {
      const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(item.content))), (byte) => byte.toString(16).padStart(2, "0")).join("");
      sqlite.prepare("INSERT INTO evidence_refs (id, schema_version, company_id, workflow_run_id, object_key, content_type, byte_size, sha256, source_url, provenance, captured_at, expires_at, created_at) VALUES (?, 1, 'company-1', 'research-run', ?, 'text/markdown', ?, ?, ?, 'untrusted_external', ?, ?, ?)").run(item.id, item.key, item.content.length, hash, item.source, timestamp, "2026-12-29T08:00:00.000Z", timestamp);
    }
    const categories = ["company_profile", "workflow_system", "timely_trigger", "fidexa_fit", "decision_maker_remit", "decision_maker_authority", "recipient_rationale", "paid_buyer_request"];
    for (const category of categories) sqlite.prepare("INSERT INTO research_findings (id, schema_version, research_run_id, category, finding, confidence, source_url, evidence_ref_id, created_at) VALUES (?, 1, 'research-1', ?, ?, 'high', 'https://example.org/operations', 'company-evidence', ?)").run(`finding-${category}`, category, `${category} verified from public source`, timestamp);
    sqlite.prepare("INSERT INTO contacts (id, schema_version, company_id, email, normalized_email, name, role, verification_method, verified_at, verification_evidence_id, suppressed, created_at, updated_at, is_decision_maker, decision_maker_evidence_id, decision_maker_reason) VALUES ('contact-1', 1, 'company-1', 'alex@example.org', 'alex@example.org', 'Alex Owner', 'Operations Director', 'verified_company_contact_page', ?, 'contact-evidence', 0, ?, ?, 1, 'authority-evidence', 'Publicly documented owner of the relevant operating workflow')").run(timestamp, timestamp, timestamp);
    const adapter = {
      prepare(sql: string) {
        const statement = sqlite.prepare(sql);
        return { bind(...args: unknown[]) { return {
          run: async () => { const result = statement.run(...args as SQLInputValue[]); return { success: true, meta: { changes: result.changes } }; },
          first: async <T>() => (statement.get(...args as SQLInputValue[]) as T | undefined) ?? null,
        }; } };
      },
      batch: async (statements: Array<{ run: () => Promise<unknown> }>) => {
        sqlite.exec("BEGIN");
        try { for (const statement of statements) await statement.run(); sqlite.exec("COMMIT"); return []; }
        catch (error) { sqlite.exec("ROLLBACK"); throw error; }
      },
    } as unknown as D1Database;
    const objects = new Map(evidence.map((item) => [item.key, item.content]));
    const bucket = { get: async (key: string) => {
      const content = objects.get(key);
      return content === undefined ? null : { text: async () => content };
    } } as unknown as R2Bucket;
    const operator = { db: adapter, bucket, credentialRole: "operator", now: timestamp } as unknown as Parameters<typeof preparePreReviewPacket>[0];
    const reviewer = { db: adapter, bucket, credentialRole: "reviewer", now: timestamp } as unknown as Parameters<typeof reviewPreReviewPacket>[0];
    const packetInput = {
      schema_version: 1, workflow_run_id: "author-run", company_id: "company-1", contact_id: "contact-1",
      subject: "A focused operations question", body: "Hello Alex, book a time, email me directly, or see our work.",
      claim_evidence_ids: evidence.map((item) => item.id), source_urls: ["https://example.org/operations", "https://example.org/team"], variant_id: "workflow-a-v1",
      links: [
        { kind: "booking", anchor_text: "book a time", target: "https://fidexa.zohobookings.com/fidexa" },
        { kind: "email", anchor_text: "email me directly", target: "mailto:farid@fidexa.org" },
        { kind: "website", anchor_text: "see our work", target: "https://www.fidexa.org" },
      ],
    };
    try {
      const firstPacket = text(await preparePreReviewPacket(operator, { ...packetInput, idempotency_key: "packet-v1" }));
      expect(firstPacket).toMatchObject({ state: "pending_review", version: 1 });
      expect(sqlite.prepare("SELECT COUNT(*) AS count FROM outreach_drafts").get()).toEqual({ count: 0 });
      await readPreReviewPacket(reviewer, { schema_version: 1, workflow_run_id: "reviewer-v1", packet_id: firstPacket.id });
      await reviewPreReviewPacket(reviewer, { schema_version: 1, workflow_run_id: "reviewer-v1", idempotency_key: "review-v1", packet_id: firstPacket.id, decision: "needs_changes", policy_version: "v1", findings: ["The person-specific workflow authority needs stronger support."] });
      await expect(createDraft(operator, { schema_version: 1, workflow_run_id: "author-run", idempotency_key: "draft-failed-packet", pre_review_packet_id: firstPacket.id })).rejects.toThrow("approved exact-message pre-review packet");
      expect(sqlite.prepare("SELECT COUNT(*) AS count FROM outreach_drafts").get()).toEqual({ count: 0 });

      const repairedPacket = text(await preparePreReviewPacket(operator, { ...packetInput, body: "Hello Alex, book a time, email me directly, or see our work. This is the repaired exact message.", idempotency_key: "packet-v2", supersedes_packet_id: firstPacket.id }));
      expect(repairedPacket).toMatchObject({ state: "pending_review", version: 2, supersedes_packet_id: firstPacket.id });
      await expect(reviewPreReviewPacket(reviewer, { schema_version: 1, workflow_run_id: "reviewer-v2", idempotency_key: "review-v2-before-read", packet_id: repairedPacket.id, decision: "approved", policy_version: "v1", findings: ["Reviewed."], checklist: approvedChecklist })).rejects.toThrow("must read the exact packet");
      expect(() => sqlite.prepare("UPDATE pre_review_packets SET body = 'tampered' WHERE id = ?").run(repairedPacket.id)).toThrow("content is immutable");
      await readPreReviewPacket(reviewer, { schema_version: 1, workflow_run_id: "reviewer-v2", packet_id: repairedPacket.id });
      const { signature_checked: _optionalSignature, ...checklistWithoutSignature } = approvedChecklist;
      const approved = await reviewPreReviewPacket(reviewer, { schema_version: 1, workflow_run_id: "reviewer-v2", idempotency_key: "review-v2", packet_id: repairedPacket.id, decision: "approved", policy_version: "v1", findings: ["The revised authority claim is now supported."], checklist: checklistWithoutSignature });
      expect(text(approved).state).toBe("approved");
      const draft = text(await createDraft(operator, { schema_version: 1, workflow_run_id: "author-run", idempotency_key: "draft-v2", pre_review_packet_id: repairedPacket.id }));
      expect(draft).toMatchObject({ state: "approved", pre_review_packet_id: repairedPacket.id, content_sha256: repairedPacket.content_sha256 });
      expect(sqlite.prepare("SELECT state, subject, body, pre_review_packet_id, reviewed_links_json FROM outreach_drafts").get()).toEqual({ state: "approved", subject: packetInput.subject, body: "Hello Alex, book a time, email me directly, or see our work. This is the repaired exact message.", pre_review_packet_id: repairedPacket.id, reviewed_links_json: JSON.stringify(packetInput.links) });
      expect(sqlite.prepare("SELECT decision, reviewed_content_sha256 FROM pre_review_reviews WHERE packet_id = ?").get(repairedPacket.id)).toEqual({ decision: "approved", reviewed_content_sha256: repairedPacket.content_sha256 });
    } finally { sqlite.close(); }
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
    for (const migration of ["0001_outreach_base.sql", "0002_outbound_draft_claim.sql", "0003_request_nonces.sql", "0004_workflow_recovery.sql", "0005_retry_reservations.sql", "0006_workflow_event_company.sql", "0007_decision_maker_qualification.sql", "0008_pre_review_packets.sql", "0009_company_name_dedup.sql", "0010_qualification_history.sql", "0011_company_alias_registry.sql", "0012_company_identity_resolution.sql"]) {
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
          all: async <T>() => ({ results: statement.all(...args as SQLInputValue[]) as T[] }),
        }; } };
      },
    } as unknown as D1Database;
    const input = { schema_version: 1 as const, workflow_run_id: "run-retry", idempotency_key: "company-retry", name: "Retry Ltd", website_url: "https://retry.example", source_lane: "paid_direct_request" as const };

    await expect(createCompany({ db, bucket: {} as R2Bucket, now: "2026-09-11T08:00:00.000Z" }, input)).rejects.toThrow("transient D1 failure");
    const created = text(await createCompany({ db, bucket: {} as R2Bucket, now: "2026-09-11T08:00:01.000Z" }, input));
    expect(created).toMatchObject({ state: "discovered", duplicate: false });
    const duplicate = text(await createCompany({ db, bucket: {} as R2Bucket, now: "2026-09-11T08:00:02.000Z" }, {
      ...input,
      idempotency_key: "company-same-domain",
      name: "Retry Limited",
      fit_score: 99,
      fit_summary: "Conflicting later facts must not replace the canonical row.",
    }));
    expect(duplicate).toMatchObject({ id: created.id, state: "discovered", duplicate: true, match: "normalized_domain" });
    expect(sqlite.prepare("SELECT name, fit_score, fit_summary FROM companies WHERE id = ?").get(created.id)).toEqual({ name: "Retry Ltd", fit_score: null, fit_summary: null });
    expect(sqlite.prepare("SELECT COUNT(*) AS count FROM companies").get()).toEqual({ count: 1 });
    expect(sqlite.prepare("SELECT COUNT(*) AS count FROM workflow_events WHERE entity_type = 'company'").get()).toEqual({ count: 2 });
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
                  verification_evidence_id: "evidence-1", verification_evidence_present: 1, is_decision_maker: 1, decision_maker_evidence_id: "evidence-1", decision_maker_reason: "Publicly documented owner for this workflow", decision_maker_evidence_present: 1, recipient_suppressed: 0, send_idempotency_used: 0,
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
                  verification_evidence_id: "evidence-1", verification_evidence_present: 1, is_decision_maker: 1, decision_maker_evidence_id: "evidence-1", decision_maker_reason: "Publicly documented owner for this workflow", decision_maker_evidence_present: 1, recipient_suppressed: 0, send_idempotency_used: 0,
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
                  verification_evidence_id: "evidence-1", verification_evidence_present: 1, is_decision_maker: 1, decision_maker_evidence_id: "evidence-1", decision_maker_reason: "Publicly documented owner for this workflow", decision_maker_evidence_present: 1, recipient_suppressed: 0, send_idempotency_used: 0,
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
                  verification_evidence_id: "evidence-1", verification_evidence_present: 1, is_decision_maker: 1, decision_maker_evidence_id: "evidence-1", decision_maker_reason: "Publicly documented owner for this workflow", decision_maker_evidence_present: 1, recipient_suppressed: 0, send_idempotency_used: 0,
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
                if (sql.includes("FROM outreach_drafts")) return { state: "approved", workflow_run_id: "author-run", company_id: "company-1", contact_id: "contact-1", email: "contact@example.com", verification_method: "administrator_verified", verified_at: "2026-09-11T07:00:00.000Z", verification_evidence_id: "evidence-1", verification_evidence_present: 1, is_decision_maker: 1, decision_maker_evidence_id: "evidence-1", decision_maker_reason: "Publicly documented owner for this workflow", decision_maker_evidence_present: 1, recipient_suppressed: 0, send_idempotency_used: 0, reviewer_run_id: "reviewer-run", reviewed_at: "2026-09-11T07:00:00.000Z", approval_checklist_json: JSON.stringify(approvedChecklist), subject: "Subject", body: "Body" };
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
        if (sql.includes("FROM outreach_drafts")) return { state: "approved", workflow_run_id: "author-run", company_id: "company-1", contact_id: "contact-1", email: "contact@example.com", verification_method: "administrator_verified", verified_at: "2026-09-11T07:00:00.000Z", verification_evidence_id: "evidence-1", verification_evidence_present: 1, is_decision_maker: 1, decision_maker_evidence_id: "evidence-1", decision_maker_reason: "Publicly documented owner for this workflow", decision_maker_evidence_present: 1, recipient_suppressed: 0, send_idempotency_used: 1, reviewer_run_id: "reviewer-run", reviewed_at: "2026-09-11T07:00:00.000Z", approval_checklist_json: JSON.stringify(approvedChecklist), subject: "Subject", body: "Body" };
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
    for (const migration of ["0001_outreach_base.sql", "0002_outbound_draft_claim.sql", "0003_request_nonces.sql", "0004_workflow_recovery.sql", "0006_workflow_event_company.sql", "0007_decision_maker_qualification.sql", "0008_pre_review_packets.sql", "0009_company_name_dedup.sql", "0010_qualification_history.sql"]) sqlite.exec(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), "utf8"));
    sqlite.exec(`
      INSERT INTO companies (id, schema_version, name, normalized_domain, website_url, status, fit_score, fit_summary, source_lane, created_at, updated_at) VALUES ('company-1', 1, 'Company', 'example.com', 'https://example.com', 'researched', NULL, NULL, 'paid_direct_request', '2026-09-11T07:00:00.000Z', '2026-09-11T07:00:00.000Z');
      INSERT INTO evidence_refs (id, schema_version, company_id, workflow_run_id, object_key, content_type, byte_size, sha256, source_url, captured_at, expires_at, created_at, provenance) VALUES ('evidence-1', 1, 'company-1', 'run', 'e', 'text/plain', 1, 'hash', NULL, '2026-09-11T07:00:00.000Z', '2026-09-12T07:00:00.000Z', '2026-09-11T07:00:00.000Z', 'untrusted_external');
      INSERT INTO contacts VALUES ('contact-1', 1, 'company-1', 'contact@example.com', 'contact@example.com', NULL, NULL, 'administrator_verified', '2026-09-11T07:00:00.000Z', 'evidence-1', 0, '2026-09-11T07:00:00.000Z', '2026-09-11T07:00:00.000Z', 1, 'evidence-1', 'Publicly documented owner for this workflow');
      INSERT INTO outreach_drafts (id, schema_version, company_id, contact_id, workflow_run_id, idempotency_key, state, subject, body, claim_evidence_ids_json, source_urls_json, created_at, updated_at) VALUES ('draft-1', 1, 'company-1', 'contact-1', 'author-run', 'draft-key', 'approved', 'Subject', 'Body', '["evidence-1"]', '["https://example.com"]', '2026-09-11T07:00:00.000Z', '2026-09-11T07:00:00.000Z');
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
                  verification_evidence_id: "evidence-1", verification_evidence_present: 1, is_decision_maker: 1, decision_maker_evidence_id: "evidence-1", decision_maker_reason: "Publicly documented owner for this workflow", decision_maker_evidence_present: 1, recipient_suppressed: 0, send_idempotency_used: 0,
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
