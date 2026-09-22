import { describe, expect, it } from "vitest";
import { contactInputSchema, draftInputSchema, mcpAuthInputSchema } from "./validation";

describe("outreach input validation", () => {
  it("requires a named, evidenced rationale before qualifying a decision-maker contact", () => {
    const base = {
      schema_version: 1,
      workflow_run_id: "research-run",
      idempotency_key: "contact-1",
      company_id: "company-1",
      email: "owner@example.com",
      verification_method: "verified_company_contact_page",
      verified_at: "2026-09-11T08:00:00.000Z",
      verification_evidence_id: "contact-evidence",
      is_decision_maker: true,
    };

    expect(contactInputSchema.safeParse(base).success).toBe(false);
    expect(contactInputSchema.safeParse({ ...base, name: "Alex Owner", role: "Operations Director", decision_maker_evidence_id: "role-evidence", decision_maker_reason: "Owns the operating workflow described in the company evidence." }).success).toBe(true);
  });
  it("rejects guessed contacts and accepts evidenced verification", () => {
    expect(() => contactInputSchema.parse({
      schema_version: 1,
      company_id: "company-1",
      email: "ceo@example.com",
      verification_method: "guessed_pattern",
      verified_at: "2026-09-11T08:00:00.000Z",
      verification_evidence_id: "evidence-1",
    })).toThrow();

    expect(contactInputSchema.parse({
      schema_version: 1,
      workflow_run_id: "run-1",
      idempotency_key: "contact-1",
      company_id: "company-1",
      email: "hello@example.com",
      verification_method: "verified_company_contact_page",
      verified_at: "2026-09-11T08:00:00.000Z",
      verification_evidence_id: "evidence-1",
    }).email).toBe("hello@example.com");
  });

  it("requires evidence and provenance for outreach drafts", () => {
    expect(() => draftInputSchema.parse({
      schema_version: 1,
      workflow_run_id: "run-1",
      idempotency_key: "draft-1",
      company_id: "company-1",
      contact_id: "contact-1",
      subject: "Hello",
      body: "We can help.",
      claim_evidence_ids: [],
    })).toThrow();
  });

  it("requires signed role metadata for MCP calls", () => {
    expect(mcpAuthInputSchema.parse({
      role: "operator",
      timestamp: 1_757_584_000,
      signature: "a".repeat(64),
      workflow_run_id: "run-1",
      tool_name: "create_company",
    }).role).toBe("operator");
  });
});
