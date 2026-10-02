import { describe, expect, it } from "vitest";
import { companyAliasInputSchema, companyIdentityLookupSchema, companyInputSchema, contactInputSchema, draftInputSchema, mcpAuthInputSchema, preReviewDecisionSchema, preReviewPacketInputSchema, qualificationReopenInputSchema } from "./validation";

describe("outreach input validation", () => {
  it("requires evidence-backed, typed, non-PII aliases and exact identity lookup inputs", () => {
    const alias = { schema_version: 1, workflow_run_id: "run-1", idempotency_key: "alias-1", company_id: "company-1", alias: "Northstar Foods", alias_type: "trading_name", evidence_ref_id: "evidence-1" };
    expect(companyAliasInputSchema.safeParse(alias).success).toBe(true);
    expect(companyAliasInputSchema.safeParse({ ...alias, alias: "person@example.org" }).success).toBe(false);
    expect(companyAliasInputSchema.safeParse({ ...alias, alias_type: "invented_relation" }).success).toBe(false);
    expect(companyAliasInputSchema.safeParse({ ...alias, alias: "not a domain", alias_type: "website_domain" }).success).toBe(false);
    expect(companyIdentityLookupSchema.safeParse({ schema_version: 1 }).success).toBe(false);
    expect(companyIdentityLookupSchema.safeParse({ schema_version: 1, alias: "Northstar Foods" }).success).toBe(true);
    expect(companyIdentityLookupSchema.safeParse({ schema_version: 1, website_url: "https://northstar.example" }).success).toBe(true);
  });

  it("requires an explicit source lane before a company can enter qualification", () => {
    const input = { schema_version: 1, workflow_run_id: "run-1", idempotency_key: "company-1", name: "Example Ltd", website_url: "https://example.org" };
    expect(companyInputSchema.safeParse(input).success).toBe(false);
    expect(companyInputSchema.safeParse({ ...input, source_lane: "unclassified" }).success).toBe(true);
    expect(companyInputSchema.safeParse({ ...input, source_lane: "formal_procurement" }).success).toBe(true);
    expect(companyInputSchema.safeParse({ ...input, source_lane: "growth_signal_only" }).success).toBe(false);
  });

  it("requires new company-linked evidence to reopen a held opportunity", () => {
    const base = { schema_version: 1, workflow_run_id: "run-1", idempotency_key: "reopen-1", company_id: "company-1", reason: "A new buyer request appeared." };
    expect(qualificationReopenInputSchema.safeParse(base).success).toBe(false);
    expect(qualificationReopenInputSchema.safeParse({ ...base, new_evidence_ref_id: "evidence-1", source_lane: "paid_direct_request" }).success).toBe(true);
  });

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

  it("only allows CRM draft creation by reference to a pre-reviewed packet", () => {
    expect(draftInputSchema.safeParse({
      schema_version: 1,
      workflow_run_id: "run-1",
      idempotency_key: "draft-1",
      company_id: "company-1",
      contact_id: "contact-1",
      subject: "Hello",
      body: "We can help.",
      claim_evidence_ids: ["evidence-1"],
      source_urls: ["https://example.org"],
    }).success).toBe(false);
    expect(draftInputSchema.safeParse({ schema_version: 1, workflow_run_id: "run-1", idempotency_key: "draft-1", pre_review_packet_id: "packet-1" }).success).toBe(true);
  });

  it("stores the complete exact message only in a versioned pre-review packet", () => {
    const packet = {
      schema_version: 1,
      workflow_run_id: "author-run",
      idempotency_key: "packet-1",
      company_id: "company-1",
      contact_id: "contact-1",
      subject: "A specific workflow question",
      body: "One evidence-backed message; book a time, email us, or visit our website.",
      claim_evidence_ids: ["company-evidence", "person-evidence"],
      source_urls: ["https://example.org/company", "https://example.org/person"],
      variant_id: "opening-a-v1",
      links: [
        { kind: "booking", anchor_text: "book a time", target: "https://fidexa.zohobookings.com/fidexa" },
        { kind: "email", anchor_text: "email us", target: "mailto:farid@fidexa.org" },
        { kind: "website", anchor_text: "visit our website", target: "https://www.fidexa.org" },
      ],
    };
    expect(preReviewPacketInputSchema.safeParse(packet).success).toBe(true);
    expect(preReviewPacketInputSchema.safeParse({ ...packet, source_urls: [] }).success).toBe(false);
    expect(preReviewPacketInputSchema.safeParse({ ...packet, links: packet.links.slice(0, 2) }).success).toBe(false);
    expect(preReviewPacketInputSchema.safeParse({ ...packet, links: packet.links.map((link) => link.kind === "email" ? { ...link, target: "mailto:someone@example.org" } : link) }).success).toBe(false);
    expect(preReviewPacketInputSchema.safeParse({ ...packet, body: packet.body.replace("book a time", "choose a time") }).success).toBe(false);
    expect(preReviewPacketInputSchema.safeParse({ ...packet, body: `${packet.body} www.fidexa.org` }).success).toBe(false);
  });

  it("requires all safety checks for a pass but does not require a signature block", () => {
    const base = { schema_version: 1, workflow_run_id: "reviewer-run", idempotency_key: "review-1", packet_id: "packet-1", policy_version: "v2", findings: ["The contact's remit is supported by the source."] };
    expect(preReviewDecisionSchema.safeParse({ ...base, decision: "approved" }).success).toBe(false);
    expect(preReviewDecisionSchema.safeParse({ ...base, decision: "needs_changes" }).success).toBe(true);
    expect(preReviewDecisionSchema.safeParse({ ...base, decision: "approved", checklist: {
      claims_supported: true, recipient_validated: true, prior_outreach_checked: true,
      relevance_personalization_checked: true, opt_out_suppression_checked: true,
      deliverability_checked: true, prompt_injection_checked: true,
      decision_maker_verified: true, company_specific_evidence_checked: true,
      devils_advocate_objections_addressed: true, timely_trigger_checked: true,
      fit_score_checked: true, person_workflow_authority_checked: true,
      booking_link_checked: true, email_link_checked: true, website_link_checked: true,
      signature_checked: true, opt_out_language_checked: true,
    } }).success).toBe(true);
    const { signature_checked: _optionalSignature, ...withoutSignatureCheck } = {
      claims_supported: true, recipient_validated: true, prior_outreach_checked: true,
      relevance_personalization_checked: true, opt_out_suppression_checked: true,
      deliverability_checked: true, prompt_injection_checked: true,
      decision_maker_verified: true, company_specific_evidence_checked: true,
      devils_advocate_objections_addressed: true, timely_trigger_checked: true,
      fit_score_checked: true, person_workflow_authority_checked: true,
      booking_link_checked: true, email_link_checked: true, website_link_checked: true,
      signature_checked: true, opt_out_language_checked: true,
    };
    expect(preReviewDecisionSchema.safeParse({ ...base, decision: "approved", checklist: withoutSignatureCheck }).success).toBe(true);
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
