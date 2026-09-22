import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { describe, expect, it } from "vitest";
import { insertCompany, upsertContact } from "./d1";

describe("D1 outreach persistence", () => {
  it("uses a parameterized company upsert", async () => {
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
      now: "2026-09-11T08:00:00.000Z",
    });

    expect(id).toBe("company-1");
    expect(queries).toHaveLength(1);
    expect(queries[0]?.sql).toContain("ON CONFLICT");
    expect(queries[0]?.sql).toContain("COALESCE(excluded.fit_score, companies.fit_score)");
    expect(queries[0]?.sql).toContain("COALESCE(excluded.fit_summary, companies.fit_summary)");
    expect(queries[0]?.sql).not.toContain("Example Co");
    expect(queries[0]?.args).toContain("Example Co");
  });

  it("returns the persisted company ID when a domain upsert hits an existing company", async () => {
    const db = {
      prepare() {
        return {
          bind() {
            return {
              run: async () => ({ success: true }),
              first: async () => ({ id: "company-existing" }),
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
      now: "2026-09-11T08:00:00.000Z",
    })).resolves.toBe("company-existing");
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

    expect(queries[0]).toContain("WHERE contacts.company_id = excluded.company_id");
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
