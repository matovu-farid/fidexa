import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createCompany, lookupCompanyIdentity, recordCompanyAlias, recordCompanyIdentityResolution } from "./service";

function text(result: unknown) {
  return JSON.parse((result as { content: Array<{ text: string }> }).content[0]!.text);
}

function database(options: { legacyCompanyName?: string } = {}) {
  const sqlite = new DatabaseSync(":memory:");
  const migrations = [
    "0001_outreach_base.sql", "0002_outbound_draft_claim.sql", "0003_request_nonces.sql",
    "0004_workflow_recovery.sql", "0005_retry_reservations.sql", "0006_workflow_event_company.sql",
    "0007_decision_maker_qualification.sql", "0008_pre_review_packets.sql",
    "0009_company_name_dedup.sql", "0010_qualification_history.sql", "0011_company_alias_registry.sql",
  ];
  for (const migration of migrations) sqlite.exec(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), "utf8"));
  if (options.legacyCompanyName) {
    sqlite.prepare("INSERT INTO companies (id, schema_version, name, normalized_name, normalized_domain, website_url, status, source_lane, created_at, updated_at) VALUES ('legacy-company', 1, ?, lower(trim(?)), NULL, NULL, 'discovered', 'unclassified', '2025-01-01T00:00:00.000Z', '2025-01-01T00:00:00.000Z')").run(options.legacyCompanyName, options.legacyCompanyName);
  }
  sqlite.exec(readFileSync(new URL("../migrations/0012_company_identity_resolution.sql", import.meta.url), "utf8"));
  const db = {
      prepare(sql: string) {
        const statement = sqlite.prepare(sql);
        return { bind(...args: unknown[]) { return {
          run: async () => { const result = statement.run(...args as SQLInputValue[]); return { success: true, meta: { changes: result.changes } }; },
          first: async <T>() => (statement.get(...args as SQLInputValue[]) as T | undefined) ?? null,
          all: async <T>() => ({ results: statement.all(...args as SQLInputValue[]) as T[] }),
        }; } };
    },
    batch: async (statements: Array<{ run: () => Promise<unknown> }>) => Promise.all(statements.map((statement) => statement.run())),
  } as unknown as D1Database;
  const now = "2026-10-01T08:00:00.000Z";
  if (!options.legacyCompanyName) {
    sqlite.prepare("INSERT INTO companies (id, schema_version, name, normalized_name, identity_name_key, normalized_domain, website_url, status, source_lane, created_at, updated_at) VALUES ('company-1', 1, 'Northstar Ltd', 'northstar ltd', 'northstar ltd', 'northstar.example', 'https://northstar.example', 'researching', 'unclassified', ?, ?)").run(now, now);
    sqlite.prepare("INSERT INTO research_runs (id, schema_version, company_id, workflow_run_id, state, started_at, completed_at, created_at, updated_at) VALUES ('research-1', 1, 'company-1', 'wave-1', 'researched', ?, ?, ?, ?)").run(now, now, now, now);
    sqlite.prepare("INSERT INTO evidence_refs (id, schema_version, company_id, workflow_run_id, object_key, content_type, byte_size, sha256, source_url, provenance, captured_at, expires_at, created_at) VALUES ('evidence-1', 1, 'company-1', 'wave-1', 'company-1/wave-1/source.md', 'text/markdown', 20, 'hash', 'https://northstar.example/about', 'untrusted_external', ?, '2027-01-01T00:00:00.000Z', ?)").run(now, now);
  }
  const context = { db, bucket: {} as R2Bucket, now, credentialRole: "operator" } as never;
  return { sqlite, db, context };
}

describe("evidence-backed company identity aliases", () => {
  it("backfills a legacy Unicode canonical name before duplicate checks", async () => {
    const { sqlite, context } = database({ legacyCompanyName: "Élan Co" });
    try {
      expect(sqlite.prepare("SELECT identity_name_key FROM companies WHERE id = 'legacy-company'").get()).toEqual({ identity_name_key: null });
      expect(() => sqlite.prepare(`
        INSERT INTO companies (id, schema_version, name, normalized_name, identity_name_key, normalized_domain, website_url, status, source_lane, created_at, updated_at)
        VALUES ('raw-bypass', 1, 'Unrelated', 'unrelated', 'unrelated', 'unrelated.example', 'https://unrelated.example', 'discovered', 'unclassified', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z')
      `).run()).toThrow("legacy company identity keys require service backfill");
      const result = text(await createCompany(context, {
        schema_version: 1, workflow_run_id: "wave-2", idempotency_key: "unicode-legacy-collision",
        name: "élan co", website_url: "https://new-elan.example", source_lane: "unclassified",
      }));
      expect(result).toMatchObject({ state: "possible_duplicate", needs_resolution: true, existing_company_id: "legacy-company" });
      expect(sqlite.prepare("SELECT identity_name_key FROM companies WHERE id = 'legacy-company'").get()).toEqual({ identity_name_key: "élan co" });
      expect(sqlite.prepare("SELECT COUNT(*) AS count FROM companies").get()).toEqual({ count: 1 });
    } finally { sqlite.close(); }
  });

  it("records aliases only with company/run-linked evidence and keeps rows append-only", async () => {
    const { sqlite, context } = database();
    try {
      const result = text(await recordCompanyAlias(context, {
        schema_version: 1, workflow_run_id: "wave-1", idempotency_key: "alias-1",
        company_id: "company-1", alias: "Northstar Foods", alias_type: "trading_name", evidence_ref_id: "evidence-1",
      }));
      expect(result).toMatchObject({ company_id: "company-1", alias_type: "trading_name", relation: "same_entity", normalized_alias: "northstar foods" });
      expect(() => sqlite.prepare("UPDATE company_aliases SET alias = 'other' WHERE id = ?").run(result.id)).toThrow("append-only");
      expect(() => sqlite.prepare("DELETE FROM company_aliases WHERE id = ?").run(result.id)).toThrow("append-only");
    } finally { sqlite.close(); }
  });

  it("rejects evidence from a different company or workflow and allows documented related entities without merging", async () => {
    const { sqlite, context } = database();
    try {
      await expect(recordCompanyAlias(context, {
        schema_version: 1, workflow_run_id: "other-wave", idempotency_key: "wrong-run",
        company_id: "company-1", alias: "Northstar Foods", alias_type: "trading_name", evidence_ref_id: "evidence-1",
      })).rejects.toThrow("Evidence does not belong to company and workflow run");
      const related = text(await recordCompanyAlias(context, {
        schema_version: 1, workflow_run_id: "wave-1", idempotency_key: "related-1",
        company_id: "company-1", alias: "Northstar Retail", alias_type: "subsidiary", evidence_ref_id: "evidence-1",
      }));
      expect(related.relation).toBe("related_entity");
      expect(sqlite.prepare("SELECT COUNT(*) AS count FROM companies").get()).toEqual({ count: 1 });
    } finally { sqlite.close(); }
  });

  it("returns exact identity candidates and preserves ambiguity across distinct companies", async () => {
    const { sqlite, context } = database();
    try {
      sqlite.prepare("INSERT INTO companies (id, schema_version, name, normalized_name, identity_name_key, normalized_domain, website_url, status, source_lane, created_at, updated_at) VALUES ('company-2', 1, 'Northstar Holdings', 'northstar holdings', 'northstar holdings', 'holdings.example', 'https://holdings.example', 'discovered', 'unclassified', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z')").run();
      sqlite.prepare("INSERT INTO research_runs (id, schema_version, company_id, workflow_run_id, state, started_at, created_at, updated_at) VALUES ('research-2', 1, 'company-2', 'wave-2', 'researching', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z')").run();
      sqlite.prepare("INSERT INTO evidence_refs (id, schema_version, company_id, workflow_run_id, object_key, content_type, byte_size, sha256, source_url, provenance, captured_at, expires_at, created_at) VALUES ('evidence-2', 1, 'company-2', 'wave-2', 'company-2/wave-2/source.md', 'text/markdown', 20, 'hash-2', 'https://holdings.example/brand', 'untrusted_external', '2026-10-01T08:00:00.000Z', '2027-01-01T00:00:00.000Z', '2026-10-01T08:00:00.000Z')").run();
      await recordCompanyAlias(context, {
        schema_version: 1, workflow_run_id: "wave-1", idempotency_key: "same-alias-1",
        company_id: "company-1", alias: "Northstar Foods", alias_type: "trading_name", evidence_ref_id: "evidence-1",
      });
      await recordCompanyAlias(context, {
        schema_version: 1, workflow_run_id: "wave-2", idempotency_key: "same-alias-2",
        company_id: "company-2", alias: "Northstar Foods", alias_type: "brand", evidence_ref_id: "evidence-2",
      });
      const result = text(await lookupCompanyIdentity(context, { schema_version: 1, alias: " NORTHSTAR   FOODS " }));
      expect(result.ambiguous).toBe(true);
      expect(result.candidates).toHaveLength(2);
      expect(result.candidates.map((candidate: { company_id: string }) => candidate.company_id).sort()).toEqual(["company-1", "company-2"]);
      expect(result.candidates.map((candidate: { relation: string }) => candidate.relation).sort()).toEqual(["related_entity", "same_entity"]);
    } finally { sqlite.close(); }
  });

  it("keeps website-domain lookups exact and returns no match for unrelated strings", async () => {
    const { sqlite, context } = database();
    try {
      await recordCompanyAlias(context, {
        schema_version: 1, workflow_run_id: "wave-1", idempotency_key: "domain-alias",
        company_id: "company-1", alias: "https://www.old-northstar.example/about", alias_type: "website_domain", evidence_ref_id: "evidence-1",
      });
      const found = text(await lookupCompanyIdentity(context, { schema_version: 1, website_url: "https://old-northstar.example/contact" }));
      expect(found.candidates).toHaveLength(1);
      expect(found.candidates[0]).toMatchObject({ company_id: "company-1", alias_type: "website_domain", relation: "same_entity" });
      const missing = text(await lookupCompanyIdentity(context, { schema_version: 1, alias: "unrelated name" }));
      expect(missing).toMatchObject({ ambiguous: false, candidates: [] });
    } finally { sqlite.close(); }
  });

  it("enforces NFKC and whitespace-folded same-entity alias keys in direct company inserts", async () => {
    const { sqlite, context } = database();
    try {
      await recordCompanyAlias(context, {
        schema_version: 1, workflow_run_id: "wave-1", idempotency_key: "unicode-alias",
        company_id: "company-1", alias: "ＡＢＣ   Foods", alias_type: "trading_name", evidence_ref_id: "evidence-1",
      });
      expect(() => sqlite.prepare(`
        INSERT INTO companies (id, schema_version, name, normalized_name, identity_name_key, normalized_domain, website_url, status, source_lane, created_at, updated_at)
        VALUES ('unicode-bypass', 1, 'ABC Foods', 'abc foods', 'abc foods', 'abc-foods.example', 'https://abc-foods.example', 'discovered', 'unclassified', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z')
      `).run()).toThrow("company name collision requires identity resolution");
      expect(() => sqlite.prepare("UPDATE companies SET identity_name_key = 'renamed' WHERE id = 'company-1'").run()).toThrow("identity name key is immutable after backfill");
      expect(sqlite.prepare("SELECT COUNT(*) AS count FROM companies").get()).toEqual({ count: 1 });
    } finally { sqlite.close(); }
  });

  it("uses the same NFKC and whitespace normalization for canonical names and aliases", async () => {
    const { sqlite, context } = database();
    try {
      sqlite.prepare("INSERT INTO companies (id, schema_version, name, normalized_name, identity_name_key, normalized_domain, website_url, status, source_lane, created_at, updated_at) VALUES ('company-2', 1, 'Northstar  Retail', 'northstar  retail', 'northstar retail', 'retail.northstar.example', 'https://retail.northstar.example', 'discovered', 'unclassified', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z')").run();
      sqlite.prepare("INSERT INTO companies (id, schema_version, name, normalized_name, identity_name_key, normalized_domain, website_url, status, source_lane, created_at, updated_at) VALUES ('company-3', 1, 'Élan Co', 'Élan co', 'élan co', 'elan.example', 'https://elan.example', 'discovered', 'unclassified', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z')").run();
      const exact = text(await lookupCompanyIdentity(context, { schema_version: 1, alias: " Northstar  Retail " }));
      expect(exact.candidates).toContainEqual(expect.objectContaining({ company_id: "company-2", alias_type: "canonical_name", relation: "same_entity" }));
      const differentSpacing = text(await lookupCompanyIdentity(context, { schema_version: 1, alias: "Northstar Retail" }));
      expect(differentSpacing.candidates.map((candidate: { company_id: string }) => candidate.company_id)).toContain("company-2");
      const unicode = text(await lookupCompanyIdentity(context, { schema_version: 1, alias: "Élan Co" }));
      expect(unicode.candidates).toContainEqual(expect.objectContaining({ company_id: "company-3", alias_type: "canonical_name" }));
    } finally { sqlite.close(); }
  });

  it("does not treat a related-entity alias as a duplicate company", async () => {
    const { sqlite, context } = database();
    try {
      await recordCompanyAlias(context, {
        schema_version: 1, workflow_run_id: "wave-1", idempotency_key: "related-alias",
        company_id: "company-1", alias: "Northstar Retail", alias_type: "subsidiary", evidence_ref_id: "evidence-1",
      });
      const created = text(await createCompany(context, {
        schema_version: 1, workflow_run_id: "wave-2", idempotency_key: "separate-subsidiary",
        name: "Northstar Retail", website_url: "https://retail.northstar.example", source_lane: "unclassified",
      }));
      expect(created).toMatchObject({ state: "discovered", duplicate: false });
      expect(sqlite.prepare("SELECT COUNT(*) AS count FROM companies").get()).toEqual({ count: 2 });
    } finally { sqlite.close(); }
  });

  it("requires an evidence-backed, exact distinct-entity resolution before overriding a same-entity alias", async () => {
    const { sqlite, context } = database();
    try {
      await recordCompanyAlias(context, {
        schema_version: 1, workflow_run_id: "wave-1", idempotency_key: "alias-to-resolve",
        company_id: "company-1", alias: "Northstar Foods", alias_type: "trading_name", evidence_ref_id: "evidence-1",
      });
      const blocked = text(await createCompany(context, {
        schema_version: 1, workflow_run_id: "wave-2", idempotency_key: "blocked-alias",
        name: "Northstar Foods", website_url: "https://foods.example", source_lane: "unclassified",
      }));
      expect(blocked).toMatchObject({ state: "possible_duplicate", needs_resolution: true });

      const resolution = text(await recordCompanyIdentityResolution(context, {
        schema_version: 1, workflow_run_id: "wave-1", idempotency_key: "resolve-alias",
        candidate_company_id: "company-1", proposed_name: "Northstar Foods", proposed_website_url: "https://foods.example",
        decision: "distinct_entity", reason: "Official registry records show separate legal entities and separate operating sites.", evidence_ref_id: "evidence-1",
      }));
      const created = text(await createCompany(context, {
        schema_version: 1, workflow_run_id: "wave-2", idempotency_key: "resolved-alias",
        name: "Northstar Foods", website_url: "https://foods.example", source_lane: "unclassified", identity_resolution_id: resolution.id,
      }));
      expect(created).toMatchObject({ state: "discovered", duplicate: false, identity_resolution_id: resolution.id });
      expect(sqlite.prepare("SELECT COUNT(*) AS count FROM companies").get()).toEqual({ count: 2 });
      expect(sqlite.prepare("SELECT identity_resolution_id FROM companies WHERE id = ?").get(created.id)).toEqual({ identity_resolution_id: resolution.id });
      expect(() => sqlite.prepare("UPDATE companies SET name = 'Other target', identity_name_key = 'other target' WHERE id = ?").run(created.id)).toThrow("identity fields bound to a resolution are immutable");
      expect(() => sqlite.prepare("UPDATE companies SET identity_resolution_id = NULL WHERE id = ?").run(created.id)).toThrow("identity resolution reference is immutable");
      expect(() => sqlite.prepare("DELETE FROM companies WHERE id = ?").run(created.id)).toThrow("identity resolution cannot be deleted");
      const lookup = text(await lookupCompanyIdentity(context, { schema_version: 1, alias: "Northstar Foods", website_url: "https://foods.example" }));
      expect(lookup.resolutions).toContainEqual(expect.objectContaining({ id: resolution.id, decision: "distinct_entity", proposed_domain: "foods.example" }));

      const mismatched = text(await createCompany(context, {
        schema_version: 1, workflow_run_id: "wave-3", idempotency_key: "wrong-target",
        name: "Northstar Foods", website_url: "https://other.example", source_lane: "unclassified", identity_resolution_id: resolution.id,
      }));
      expect(mismatched).toMatchObject({ state: "possible_duplicate", needs_resolution: true });
      expect(sqlite.prepare("SELECT COUNT(*) AS count FROM companies").get()).toEqual({ count: 2 });
    } finally { sqlite.close(); }
  });

  it("does not let a same-entity decision authorize creation of another company", async () => {
    const { sqlite, context } = database();
    try {
      const resolution = text(await recordCompanyIdentityResolution(context, {
        schema_version: 1, workflow_run_id: "wave-1", idempotency_key: "same-entity-resolution",
        candidate_company_id: "company-1", proposed_name: "Northstar Ltd", proposed_website_url: "https://northstar.example",
        decision: "same_entity", reason: "The public registry and website identify the existing record.", evidence_ref_id: "evidence-1",
      }));
      const result = text(await createCompany(context, {
        schema_version: 1, workflow_run_id: "wave-2", idempotency_key: "cannot-use-same-entity",
        name: "Northstar Ltd", website_url: "https://northstar.example", source_lane: "unclassified", identity_resolution_id: resolution.id,
      }));
      expect(result).toMatchObject({ state: "possible_duplicate", needs_resolution: true });
      expect(sqlite.prepare("SELECT COUNT(*) AS count FROM companies").get()).toEqual({ count: 1 });
      expect(() => sqlite.prepare("UPDATE company_identity_resolutions SET reason = 'changed' WHERE id = ?").run(resolution.id)).toThrow("append-only");
      expect(() => sqlite.prepare("DELETE FROM company_identity_resolutions WHERE id = ?").run(resolution.id)).toThrow("append-only");
    } finally { sqlite.close(); }
  });

  it("requires current evidence from a completed research run to record a resolution", async () => {
    const { sqlite, context } = database();
    try {
      sqlite.prepare("UPDATE research_runs SET state = 'researching', completed_at = NULL WHERE id = 'research-1'").run();
      await expect(recordCompanyIdentityResolution(context, {
        schema_version: 1, workflow_run_id: "wave-1", idempotency_key: "incomplete-research-resolution",
        candidate_company_id: "company-1", proposed_name: "Northstar Ltd", proposed_website_url: "https://new-northstar.example",
        decision: "distinct_entity", reason: "Current public registry evidence establishes the separate entity.", evidence_ref_id: "evidence-1",
      })).rejects.toThrow("completed research run");
      expect(sqlite.prepare("SELECT COUNT(*) AS count FROM company_identity_resolutions").get()).toEqual({ count: 0 });
    } finally { sqlite.close(); }
  });

  it("does not let a resolution for an unrelated candidate clear another company's alias collision", async () => {
    const { sqlite, context } = database();
    try {
      const now = "2026-10-01T08:00:00.000Z";
      sqlite.prepare("INSERT INTO companies (id, schema_version, name, normalized_name, identity_name_key, normalized_domain, website_url, status, source_lane, created_at, updated_at) VALUES ('company-2', 1, 'Other Northstar', 'other northstar', 'other northstar', 'other-northstar.example', 'https://other-northstar.example', 'discovered', 'unclassified', ?, ?)").run(now, now);
      sqlite.prepare("INSERT INTO research_runs (id, schema_version, company_id, workflow_run_id, state, started_at, completed_at, created_at, updated_at) VALUES ('research-2', 1, 'company-2', 'wave-2', 'researched', ?, ?, ?, ?)").run(now, now, now, now);
      sqlite.prepare("INSERT INTO evidence_refs (id, schema_version, company_id, workflow_run_id, object_key, content_type, byte_size, sha256, source_url, provenance, captured_at, expires_at, created_at) VALUES ('evidence-2', 1, 'company-2', 'wave-2', 'company-2/wave-2/source.md', 'text/markdown', 20, 'hash-2', 'https://other-northstar.example/brand', 'untrusted_external', ?, '2027-01-01T00:00:00.000Z', ?)").run(now, now);
      await recordCompanyAlias(context, {
        schema_version: 1, workflow_run_id: "wave-2", idempotency_key: "company-2-alias",
        company_id: "company-2", alias: "Northstar Foods", alias_type: "trading_name", evidence_ref_id: "evidence-2",
      });
      await expect(recordCompanyIdentityResolution(context, {
        schema_version: 1, workflow_run_id: "wave-1", idempotency_key: "unrelated-candidate-resolution",
        candidate_company_id: "company-1", proposed_name: "Northstar Foods", proposed_website_url: "https://foods.example",
        decision: "distinct_entity", reason: "Separate registry entries identify this exact target as an independent company.", evidence_ref_id: "evidence-1",
      })).rejects.toThrow("exact canonical-name or same-entity alias collision");
      expect(sqlite.prepare("SELECT COUNT(*) AS count FROM company_identity_resolutions").get()).toEqual({ count: 0 });
      expect(() => sqlite.prepare(`
        INSERT INTO company_identity_resolutions (id, candidate_company_id, proposed_name, proposed_name_key, proposed_domain, decision, reason, evidence_ref_id, workflow_run_id, created_by, created_at)
        VALUES ('direct-unrelated-resolution', 'company-1', 'Northstar Foods', 'northstar foods', 'foods.example', 'distinct_entity', 'Separate registry entries identify this exact target as an independent company.', 'evidence-1', 'wave-1', 'test', ?)
      `).run(now)).toThrow("distinct identity resolution must address a canonical-name or same-entity alias collision");
      expect(sqlite.prepare("SELECT COUNT(*) AS count FROM companies").get()).toEqual({ count: 2 });
    } finally { sqlite.close(); }
  });

  it("does not let one resolution bypass a second conflicting alias candidate", async () => {
    const { sqlite, context } = database();
    try {
      const now = "2026-10-01T08:00:00.000Z";
      sqlite.prepare("INSERT INTO companies (id, schema_version, name, normalized_name, identity_name_key, normalized_domain, website_url, status, source_lane, created_at, updated_at) VALUES ('company-2', 1, 'Other Northstar', 'other northstar', 'other northstar', 'other-northstar.example', 'https://other-northstar.example', 'discovered', 'unclassified', ?, ?)").run(now, now);
      sqlite.prepare("INSERT INTO research_runs (id, schema_version, company_id, workflow_run_id, state, started_at, completed_at, created_at, updated_at) VALUES ('research-2', 1, 'company-2', 'wave-2', 'researched', ?, ?, ?, ?)").run(now, now, now, now);
      sqlite.prepare("INSERT INTO evidence_refs (id, schema_version, company_id, workflow_run_id, object_key, content_type, byte_size, sha256, source_url, provenance, captured_at, expires_at, created_at) VALUES ('evidence-2', 1, 'company-2', 'wave-2', 'company-2/wave-2/source.md', 'text/markdown', 20, 'hash-2', 'https://other-northstar.example/brand', 'untrusted_external', ?, '2027-01-01T00:00:00.000Z', ?)").run(now, now);
      await recordCompanyAlias(context, {
        schema_version: 1, workflow_run_id: "wave-2", idempotency_key: "company-2-alias",
        company_id: "company-2", alias: "Northstar Foods", alias_type: "trading_name", evidence_ref_id: "evidence-2",
      });
      await recordCompanyAlias(context, {
        schema_version: 1, workflow_run_id: "wave-1", idempotency_key: "company-1-alias",
        company_id: "company-1", alias: "Northstar Foods", alias_type: "trading_name", evidence_ref_id: "evidence-1",
      });
      const resolution = text(await recordCompanyIdentityResolution(context, {
        schema_version: 1, workflow_run_id: "wave-1", idempotency_key: "resolve-company-1",
        candidate_company_id: "company-1", proposed_name: "Northstar Foods", proposed_website_url: "https://foods.example",
        decision: "distinct_entity", reason: "Registry evidence distinguishes this target from the first matched company.", evidence_ref_id: "evidence-1",
      }));
      const result = text(await createCompany(context, {
        schema_version: 1, workflow_run_id: "wave-3", idempotency_key: "unresolved-second-candidate",
        name: "Northstar Foods", website_url: "https://foods.example", source_lane: "unclassified", identity_resolution_id: resolution.id,
      }));
      expect(result).toMatchObject({ state: "possible_duplicate", needs_resolution: true });
      expect(sqlite.prepare("SELECT COUNT(*) AS count FROM companies").get()).toEqual({ count: 2 });
      expect(() => sqlite.prepare(`
        INSERT INTO companies (id, schema_version, name, normalized_name, identity_name_key, normalized_domain, website_url, status, source_lane, identity_resolution_id, created_at, updated_at)
        VALUES ('direct-mixed-bypass', 1, 'Northstar Foods', 'northstar foods', 'northstar foods', 'foods.example', 'https://foods.example', 'discovered', 'unclassified', ?, ?, ?)
      `).run(resolution.id, now, now)).toThrow("company name collision requires identity resolution");
    } finally { sqlite.close(); }
  });

  it("rejects cross-company evidence and database-level relation/type mismatches", async () => {
    const { sqlite, context } = database();
    try {
      sqlite.prepare("INSERT INTO companies (id, schema_version, name, normalized_name, identity_name_key, normalized_domain, website_url, status, source_lane, created_at, updated_at) VALUES ('company-2', 1, 'Other Company', 'other company', 'other company', 'other.example', 'https://other.example', 'discovered', 'unclassified', '2026-10-01T08:00:00.000Z', '2026-10-01T08:00:00.000Z')").run();
      await expect(recordCompanyAlias(context, {
        schema_version: 1, workflow_run_id: "wave-1", idempotency_key: "cross-company-evidence",
        company_id: "company-2", alias: "Northstar Foods", alias_type: "trading_name", evidence_ref_id: "evidence-1",
      })).rejects.toThrow("Evidence does not belong to company and workflow run");
      expect(() => sqlite.prepare(`
        INSERT INTO company_aliases (id, company_id, alias, normalized_alias, alias_type, relation, evidence_ref_id, workflow_run_id, created_by, created_at)
        VALUES ('bad-relation', 'company-1', 'Northstar Retail', 'northstar retail', 'subsidiary', 'same_entity', 'evidence-1', 'wave-1', 'test', '2026-10-01T08:00:00.000Z')
      `).run()).toThrow("CHECK constraint failed");
      expect(sqlite.prepare("SELECT COUNT(*) AS count FROM company_aliases").get()).toEqual({ count: 0 });
    } finally { sqlite.close(); }
  });
});
