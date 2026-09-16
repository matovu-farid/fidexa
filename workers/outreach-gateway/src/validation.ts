import { z } from "zod";

const isoDate = z.string().datetime({ offset: true });

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
}).strict();

export const draftInputSchema = z.object({
  schema_version: z.literal(1),
  workflow_run_id: z.string().min(1).max(120),
  idempotency_key: z.string().min(1).max(200),
  company_id: z.string().min(1).max(120),
  contact_id: z.string().min(1).max(120),
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(20_000),
  claim_evidence_ids: z.array(z.string().min(1).max(200)).min(1).max(50),
  source_urls: z.array(z.string().url()).min(1).max(50),
}).strict();

export const approvalChecklistSchema = z.object({
  claims_supported: z.literal(true),
  recipient_validated: z.literal(true),
  prior_outreach_checked: z.literal(true),
  relevance_personalization_checked: z.literal(true),
  opt_out_suppression_checked: z.literal(true),
  deliverability_checked: z.literal(true),
  prompt_injection_checked: z.literal(true),
}).strict();

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
