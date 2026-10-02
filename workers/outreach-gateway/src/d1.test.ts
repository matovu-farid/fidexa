import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { insertCompany, upsertContact } from "./d1";

describe("D1 outreach persistence", () => {
  it("inserts a company without overwriting canonical history on a domain conflict", async () => {
    const queries: Array<{ sql: string; args: unknown[] }> = [];
    const db = {
      prepare(sql: string) {
        return {
          bind(...args: unknown[]) {
            queries.push({ sql, args });
            return { run: async () => ({ success: true }), first: async () => ({ id: "company-1" }) };
          },
        };
      },
    } as unknown as D1Database;

    const id = await insertCompany(db, {
      id: "company-1",
      name: "Example Co",
      normalizedDomain: "example.com",
      websiteUrl: "https://example.com",
      fitScore: null,
      fitSummary: null,
      sourceLane: "verified_operator_workflow",
      now: "2026-09-11T08:00:00.000Z",
    });

    expect(id).toEqual({ id: "company-1", created: true });
    expect(queries).toHaveLength(1);
    expect(queries[0]?.sql).toContain("ON CONFLICT(normalized_domain)");
    expect(queries[0]?.sql).toContain("DO NOTHING");
    expect(queries[0]?.sql).not.toContain("DO UPDATE");
    expect(queries[0]?.sql).not.toContain("Example Co");
    expect(queries[0]?.args).toContain("Example Co");
  });

  it("returns the existing company as a duplicate when the domain already exists", async () => {
    const queries: string[] = [];
    const db = {
      prepare(sql: string) {
        queries.push(sql);
        return {
          bind() {
            return {
              first: async () => sql.includes("INSERT INTO companies") ? null : ({ id: "company-existing" }),
            };
          },
        };
      },
    } as unknown as D1Database;

    await expect(insertCompany(db, {
      id: "company-new",
      name: "Example Co",
      normalizedDomain: "example.com",
      websiteUrl: "https://example.com",
      fitScore: 80,
      fitSummary: "Strong fit",
      sourceLane: "paid_direct_request",
      now: "2026-09-11T08:00:00.000Z",
    })).resolves.toEqual({ id: "company-existing", created: false, match: "domain" });
    expect(queries).toHaveLength(2);
    expect(queries[1]).toContain("SELECT id FROM companies WHERE normalized_domain = ?");
  });

  it("enforces ambiguous company-name collisions in SQLite, including domainless/domain races", async () => {
    const sqlite = new DatabaseSync(":memory:");
    sqlite.exec(readFileSync(new URL("../migrations/0001_outreach_base.sql", import.meta.url), "utf8"));
    sqlite.exec(readFileSync(new URL("../migrations/0009_company_name_dedup.sql", import.meta.url), "utf8"));
    sqlite.exec(readFileSync(new URL("../migrations/0010_qualification_history.sql", import.meta.url), "utf8"));
    sqlite.exec(readFileSync(new URL("../migrations/0011_company_alias_registry.sql", import.meta.url), "utf8"));
    sqlite.exec(readFileSync(new URL("../migrations/0012_company_identity_resolution.sql", import.meta.url), "utf8"));
    const db = {
      prepare(sql: string) {
        const statement = sqlite.prepare(sql);
        return { bind(...args: unknown[]) { return {
          run: async () => { const result = statement.run(...args as SQLInputValue[]); return { success: true, meta: { changes: result.changes } }; },
          first: async <T>() => (statement.get(...args as SQLInputValue[]) as T | undefined) ?? null,
        }; } };
      },
    } as unknown as D1Database;
    const common = { websiteUrl: null, fitScore: null, fitSummary: null, sourceLane: "unclassified", now: "2026-09-30T08:00:00.000Z" };
    try {
      const initial = await insertCompany(db, { ...common, id: "company-1", name: "Example Group", normalizedDomain: null });
      expect(initial).toMatchObject({ id: "company-1", created: true });
      const concurrentCandidate = await insertCompany(db, { ...common, id: "company-2", name: "EXAMPLE GROUP", normalizedDomain: "example.org", websiteUrl: "https://example.org" });
      expect(concurrentCandidate).toEqual({ id: "company-1", created: false, match: "name" });
      const unicodeCanonical = await insertCompany(db, { ...common, id: "company-3", name: "Élan Co", normalizedDomain: null });
      expect(unicodeCanonical).toMatchObject({ id: "company-3", created: true });
      const unicodeVariant = await insertCompany(db, { ...common, id: "company-4", name: "élan Co", normalizedDomain: "elan.example", websiteUrl: "https://elan.example" });
      expect(unicodeVariant).toEqual({ id: "company-3", created: false, match: "name" });
      expect(sqlite.prepare("SELECT COUNT(*) AS count FROM companies").get()).toEqual({ count: 2 });
    } finally {
      sqlite.close();
    }
  });

  it("returns the persisted contact ID when an email upsert hits an existing contact", async () => {
    const db = {
      prepare() {
        return {
          bind() {
            return {
              run: async () => ({ success: true }),
              first: async () => ({ id: "contact-existing", company_id: "company-1" }),
            };
          },
        };
      },
    } as unknown as D1Database;

    await expect(upsertContact(db, {
      id: "contact-new",
      companyId: "company-1",
      email: "hello@example.com",
      name: null,
      role: null,
      verificationMethod: "administrator_verified",
      verifiedAt: "2026-09-11T08:00:00.000Z",
      verificationEvidenceId: "evidence-1",
      isDecisionMaker: false,
      decisionMakerEvidenceId: null,
      decisionMakerReason: null,
      now: "2026-09-11T08:00:00.000Z",
    })).resolves.toBe("contact-existing");
  });

  it("does not replace an existing contact's verified facts on an email match", async () => {
    const sqlite = new DatabaseSync(":memory:");
    sqlite.exec(`CREATE TABLE contacts (
      id TEXT PRIMARY KEY, schema_version INTEGER NOT NULL, company_id TEXT NOT NULL,
      email TEXT NOT NULL, normalized_email TEXT NOT NULL UNIQUE, name TEXT, role TEXT,
      verification_method TEXT, verified_at TEXT, verification_evidence_id TEXT,
      is_decision_maker INTEGER NOT NULL DEFAULT 0, decision_maker_evidence_id TEXT,
      decision_maker_reason TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    )`);
    sqlite.prepare(`INSERT INTO contacts (id, schema_version, company_id, email, normalized_email, name, role, verification_method, verified_at, verification_evidence_id, is_decision_maker, decision_maker_evidence_id, decision_maker_reason, created_at, updated_at)
      VALUES ('contact-existing', 1, 'company-1', 'alex@example.org', 'alex@example.org', 'Alex Owner', 'Operations Director', 'verified_company_contact_page', '2026-09-01T08:00:00.000Z', 'evidence-old', 1, 'authority-old', 'Owns operations', '2026-09-01T08:00:00.000Z', '2026-09-01T08:00:00.000Z')`).run();
    const db = {
      prepare(sql: string) {
        const statement = sqlite.prepare(sql);
        return { bind(...args: unknown[]) { return {
          first: async <T>() => (statement.get(...args as SQLInputValue[]) as T | undefined) ?? null,
        }; } };
      },
    } as unknown as D1Database;
    try {
      await expect(upsertContact(db, {
        id: "contact-replacement", companyId: "company-1", email: "alex@example.org",
        name: "Alex", role: null, verificationMethod: "administrator_verified",
        verifiedAt: "2026-09-30T08:00:00.000Z", verificationEvidenceId: "new-evidence",
        isDecisionMaker: false, decisionMakerEvidenceId: null, decisionMakerReason: null,
        now: "2026-09-30T08:00:00.000Z",
      })).resolves.toBe("contact-existing");
      expect(sqlite.prepare("SELECT name, role, verification_method, verification_evidence_id, is_decision_maker, decision_maker_evidence_id FROM contacts WHERE id = 'contact-existing'").get()).toEqual({
        name: "Alex Owner", role: "Operations Director", verification_method: "verified_company_contact_page",
        verification_evidence_id: "evidence-old", is_decision_maker: 1, decision_maker_evidence_id: "authority-old",
      });
    } finally {
      sqlite.close();
    }
  });

  it("rejects a competing cross-company email conflict without permitting the upsert to reassign ownership", async () => {
    const queries: string[] = [];
    const db = {
      prepare(sql: string) {
        queries.push(sql);
        return {
          bind() {
            return {
              first: async () => ({ id: "contact-existing", company_id: "other-company" }),
            };
          },
        };
      },
    } as unknown as D1Database;

    await expect(upsertContact(db, {
      id: "contact-new",
      companyId: "company-1",
      email: "hello@example.com",
      name: null,
      role: null,
      verificationMethod: "administrator_verified",
      verifiedAt: "2026-09-11T08:00:00.000Z",
      verificationEvidenceId: "evidence-1",
      isDecisionMaker: false,
      decisionMakerEvidenceId: null,
      decisionMakerReason: null,
      now: "2026-09-11T08:00:00.000Z",
    })).rejects.toThrow("Existing contact belongs to a different company");

    expect(queries[0]).toContain("ON CONFLICT(normalized_email) DO NOTHING");
  });

  it("handles SQLite's no-row RETURNING result for a guarded cross-company conflict", async () => {
    const sqlite = new DatabaseSync(":memory:");
    sqlite.exec(`
      CREATE TABLE contacts (
        id TEXT PRIMARY KEY,
        schema_version INTEGER NOT NULL,
        company_id TEXT NOT NULL,
        email TEXT NOT NULL,
        normalized_email TEXT NOT NULL UNIQUE,
        name TEXT,
        role TEXT,
        verification_method TEXT,
        verified_at TEXT,
        verification_evidence_id TEXT,
        is_decision_maker INTEGER NOT NULL DEFAULT 0,
        decision_maker_evidence_id TEXT,
        decision_maker_reason TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    sqlite.prepare(`INSERT INTO contacts (id, schema_version, company_id, email, normalized_email, created_at, updated_at) VALUES ('contact-existing', 1, 'other-company', 'hello@example.com', 'hello@example.com', '2026-09-11T08:00:00.000Z', '2026-09-11T08:00:00.000Z')`).run();
    const db = {
      prepare(sql: string) {
        const statement = sqlite.prepare(sql);
        return {
          bind(...args: unknown[]) {
            return {
              first: async <T>() => (statement.get(...args as SQLInputValue[]) as T | undefined) ?? null,
            };
          },
        };
      },
    } as unknown as D1Database;

    await expect(upsertContact(db, {
      id: "contact-new",
      companyId: "company-1",
      email: "hello@example.com",
      name: null,
      role: null,
      verificationMethod: "administrator_verified",
      verifiedAt: "2026-09-11T08:00:00.000Z",
      verificationEvidenceId: "evidence-1",
      isDecisionMaker: false,
      decisionMakerEvidenceId: null,
      decisionMakerReason: null,
      now: "2026-09-11T08:00:00.000Z",
    })).rejects.toThrow("Existing contact belongs to a different company");

    expect(sqlite.prepare("SELECT company_id FROM contacts WHERE normalized_email = ?").get("hello@example.com")).toEqual({ company_id: "other-company" });
    sqlite.close();
  });
});
