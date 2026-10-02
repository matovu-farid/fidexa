import { z } from "zod";

const isoDate = z.string().datetime({ offset: true });

export const sourceLaneSchema = z.enum([
  "paid_direct_request",
  "warm_referral",
  "verified_operator_workflow",
  "formal_procurement",
  "unclassified",
]);

const companyAliasTypeSchema = z.enum([
  "legal_name",
  "trading_name",
  "former_name",
  "website_domain",
  "brand",
  "parent_group",
  "subsidiary",
  "division",
]);

export const companyAliasInputSchema = z.object({
  schema_version: z.literal(1),
  workflow_run_id: z.string().min(1).max(120),
  idempotency_key: z.string().min(1).max(200),
  company_id: z.string().min(1).max(120),
  alias: z.string().trim().min(1).max(240).refine((value) => !value.includes("@"), "Aliases must not contain email addresses"),
  alias_type: companyAliasTypeSchema,
  evidence_ref_id: z.string().min(1).max(200),
}).strict().superRefine((value, context) => {
  if (value.alias_type === "website_domain") {
    try {
      const parsed = new URL(value.alias.includes("://") ? value.alias : `https://${value.alias}`);
      if (!parsed.hostname || parsed.hostname.includes("..")) throw new Error("invalid hostname");
    } catch {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["alias"], message: "Website-domain aliases must be valid domains or URLs" });
    }
  }
});

export const companyIdentityLookupSchema = z.object({
  schema_version: z.literal(1),
  alias: z.string().trim().min(1).max(240).optional(),
  website_url: z.string().url().max(500).optional(),
}).strict().refine((value) => Boolean(value.alias || value.website_url), "Provide an exact company name/alias or website URL");

export const companyInputSchema = z.object({
  schema_version: z.literal(1),
  workflow_run_id: z.string().min(1).max(120),
  idempotency_key: z.string().min(1).max(200),
  name: z.string().trim().min(1).max(240),
  website_url: z.string().url().optional(),
  fit_score: z.number().int().min(0).max(100).optional(),
  fit_summary: z.string().trim().max(5_000).optional(),
  source_lane: sourceLaneSchema,
  identity_resolution_id: z.string().min(1).max(120).optional(),
}).strict();

export const companyIdentityResolutionInputSchema = z.object({
  schema_version: z.literal(1),
  workflow_run_id: z.string().min(1).max(120),
  idempotency_key: z.string().min(1).max(200),
  candidate_company_id: z.string().min(1).max(120),
  proposed_name: z.string().trim().min(1).max(240),
  proposed_website_url: z.string().url().max(500),
  decision: z.enum(["same_entity", "distinct_entity"]),
  reason: z.string().trim().min(20).max(2_000),
  evidence_ref_id: z.string().min(1).max(200),
}).strict();

const dispositionReasonCodes = z.enum([
  "no_current_buyer_need",
  "growth_signal_without_buyer_need",
  "existing_vendor_or_in_house_team",
  "procurement_closed_or_ineligible",
  "decision_maker_or_contact_unverified",
  "poor_fit_or_competitor",
  "duplicate_or_prior_outreach",
  "other",
]);

export const qualificationHoldInputSchema = z.object({
  schema_version: z.literal(1),
  workflow_run_id: z.string().min(1).max(120),
  idempotency_key: z.string().min(1).max(200),
  company_id: z.string().min(1).max(120),
  reason_code: dispositionReasonCodes,
  reason: z.string().trim().min(1).max(2_000),
  basis_evidence_ref_id: z.string().min(1).max(200),
}).strict();

export const qualificationReopenInputSchema = z.object({
  schema_version: z.literal(1),
  workflow_run_id: z.string().min(1).max(120),
  idempotency_key: z.string().min(1).max(200),
  company_id: z.string().min(1).max(120),
  reason: z.string().trim().min(1).max(2_000),
  new_evidence_ref_id: z.string().min(1).max(200),
  source_lane: z.enum(["paid_direct_request", "warm_referral", "verified_operator_workflow"]),
}).strict();

export const contactInputSchema = z.object({
  schema_version: z.literal(1),
  workflow_run_id: z.string().min(1).max(120),
  idempotency_key: z.string().min(1).max(200),
  company_id: z.string().min(1).max(120),
  email: z.string().email().max(320),
  name: z.string().trim().max(200).optional(),
  role: z.string().trim().max(200).optional(),
  verification_method: z.enum([
    "public_company_domain_mailbox",
    "verified_company_contact_page",
    "administrator_verified",
  ]),
  verified_at: isoDate,
  verification_evidence_id: z.string().min(1).max(200),
  is_decision_maker: z.boolean().optional().default(false),
  decision_maker_evidence_id: z.string().min(1).max(200).optional(),
  decision_maker_reason: z.string().trim().min(1).max(2_000).optional(),
}).strict().superRefine((value, context) => {
  if (value.is_decision_maker) {
    if (!value.name) context.addIssue({ code: z.ZodIssueCode.custom, path: ["name"], message: "Decision-maker contacts require a name" });
    if (!value.role) context.addIssue({ code: z.ZodIssueCode.custom, path: ["role"], message: "Decision-maker contacts require a role" });
    if (!value.decision_maker_evidence_id) context.addIssue({ code: z.ZodIssueCode.custom, path: ["decision_maker_evidence_id"], message: "Decision-maker contacts require evidence" });
    if (!value.decision_maker_reason) context.addIssue({ code: z.ZodIssueCode.custom, path: ["decision_maker_reason"], message: "Decision-maker contacts require a relevance reason" });
  } else if (value.decision_maker_evidence_id || value.decision_maker_reason) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["is_decision_maker"], message: "Decision-maker evidence requires is_decision_maker" });
  }
});

export const preReviewPacketInputSchema = z.object({
  schema_version: z.literal(1),
  workflow_run_id: z.string().min(1).max(120),
  idempotency_key: z.string().min(1).max(200),
  company_id: z.string().min(1).max(120),
  contact_id: z.string().min(1).max(120),
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(20_000),
  links: z.array(z.object({
    kind: z.enum(["booking", "email", "website"]),
    anchor_text: z.string().trim().min(2).max(120),
    target: z.string().min(1).max(500),
  }).strict()).length(3),
  claim_evidence_ids: z.array(z.string().min(1).max(200)).min(1).max(12),
  source_urls: z.array(z.string().url()).min(1).max(12),
  variant_id: z.string().trim().min(1).max(120).optional(),
  supersedes_packet_id: z.string().trim().min(1).max(120).optional(),
}).strict().superRefine((value, context) => {
  const expected = {
    booking: "https://fidexa.zohobookings.com/fidexa",
    email: "mailto:farid@fidexa.org",
    website: "https://www.fidexa.org",
  } as const;
  const kinds = new Set(value.links.map((link) => link.kind));
  if (kinds.size !== 3) context.addIssue({ code: z.ZodIssueCode.custom, path: ["links"], message: "Booking, reply-email, and website links must each appear exactly once" });
  for (const link of value.links) {
    if (link.target !== expected[link.kind]) context.addIssue({ code: z.ZodIssueCode.custom, path: ["links"], message: `Unexpected ${link.kind} destination` });
    if (!value.body.includes(link.anchor_text)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["links"], message: `Message body must include the ${link.kind} link anchor text` });
    if (value.body.includes(link.target)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["body"], message: "Link destinations must be inserted as hyperlinks, not pasted as raw URL text" });
  }
  if (/(?:https?:\/\/|www\.)\S+/i.test(value.body)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["body"], message: "Use readable hyperlink anchors instead of raw website URLs in the message body" });
  }
});

export const draftInputSchema = z.object({
  schema_version: z.literal(1),
  workflow_run_id: z.string().min(1).max(120),
  idempotency_key: z.string().min(1).max(200),
  pre_review_packet_id: z.string().min(1).max(120),
}).strict();

export const approvalChecklistSchema = z.object({
  claims_supported: z.literal(true),
  recipient_validated: z.literal(true),
  prior_outreach_checked: z.literal(true),
  relevance_personalization_checked: z.literal(true),
  opt_out_suppression_checked: z.literal(true),
  deliverability_checked: z.literal(true),
  prompt_injection_checked: z.literal(true),
  decision_maker_verified: z.literal(true),
  company_specific_evidence_checked: z.literal(true),
  devils_advocate_objections_addressed: z.literal(true),
  timely_trigger_checked: z.literal(true),
  fit_score_checked: z.literal(true),
  person_workflow_authority_checked: z.literal(true),
  booking_link_checked: z.literal(true),
  email_link_checked: z.literal(true),
  website_link_checked: z.literal(true),
  signature_checked: z.literal(true).optional(),
  opt_out_language_checked: z.literal(true),
}).strict();

export const preReviewDecisionSchema = z.object({
  schema_version: z.literal(1),
  workflow_run_id: z.string().min(1).max(120),
  idempotency_key: z.string().min(1).max(200),
  packet_id: z.string().min(1).max(120),
  decision: z.enum(["needs_changes", "approved"]),
  policy_version: z.string().trim().min(1).max(80),
  findings: z.array(z.string().trim().min(1).max(2_000)).min(1).max(100),
  checklist: approvalChecklistSchema.optional(),
}).strict().superRefine((value, context) => {
  if (value.decision === "approved" && !value.checklist) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["checklist"], message: "A pre-review PASS requires every review checklist item" });
  }
  if (value.decision === "needs_changes" && value.checklist) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["checklist"], message: "A failed review cannot carry an approval checklist" });
  }
});

export const mcpAuthInputSchema = z.object({
  role: z.enum(["operator", "reviewer"]),
  timestamp: z.number().int().positive(),
  signature: z.string().regex(/^[a-f0-9]{64}$/i),
  workflow_run_id: z.string().min(1).max(120),
  tool_name: z.string().regex(/^[a-z][a-z0-9_]{1,80}$/),
}).strict();

export function parseJsonBody<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  return schema.parse(input);
}
