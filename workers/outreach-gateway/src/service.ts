import { z } from "zod";
import { insertCompany, upsertContact } from "./d1";
import { canTransition, isSendableDraft, type OutreachState } from "./domain";
import { buildEvidenceKey, normalizeDomain } from "./persistence";
import { approvalChecklistSchema, contactInputSchema, draftInputSchema } from "./validation";
import { abortIdempotentMutation, beginIdempotentMutation, completeIdempotentMutation } from "./audit";

const companyInputSchema = z.object({
  schema_version: z.literal(1),
  workflow_run_id: z.string().min(1).max(120),
  idempotency_key: z.string().min(1).max(200),
  name: z.string().trim().min(1).max(240),
  website_url: z.string().url().optional(),
  fit_score: z.number().int().min(0).max(100).optional(),
  fit_summary: z.string().trim().max(5_000).optional(),
}).strict();

const researchRunSchema = z.object({
  schema_version: z.literal(1),
  workflow_run_id: z.string().min(1).max(120),
  idempotency_key: z.string().min(1).max(200),
  company_id: z.string().min(1).max(120),
}).strict();

const researchActionSchema = researchRunSchema.extend({
  research_run_id: z.string().min(1).max(120),
}).strict();

const findingSchema = researchActionSchema.extend({
  category: z.string().trim().min(1).max(100),
  finding: z.string().trim().min(1).max(10_000),
  confidence: z.enum(["low", "medium", "high"]),
  source_url: z.string().url(),
  evidence_ref_id: z.string().min(1).max(200).optional(),
});

const evidenceSchema = researchActionSchema.extend({
  filename: z.string().regex(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/),
  content_type: z.enum(["application/json", "text/markdown", "text/plain"]),
  content: z.string().min(1).max(100_000),
  source_url: z.string().url().optional(),
});

const reviewSchema = z.object({
  schema_version: z.literal(1),
  workflow_run_id: z.string().min(1).max(120),
  idempotency_key: z.string().min(1).max(200),
  draft_id: z.string().min(1).max(120),
  decision: z.enum(["needs_changes", "approved"]),
  policy_version: z.string().trim().min(1).max(80),
  findings: z.array(z.string().trim().min(1).max(2_000)).max(100),
  reviewer_run_id: z.string().min(1).max(120).optional(),
  checklist: approvalChecklistSchema.optional(),
}).strict();

const submitForReviewSchema = z.object({
  schema_version: z.literal(1),
  workflow_run_id: z.string().min(1).max(120),
  idempotency_key: z.string().min(1).max(200),
  draft_id: z.string().min(1).max(120),
}).strict();

const followUpSchema = z.object({
  schema_version: z.literal(1),
  workflow_run_id: z.string().min(1).max(120),
  idempotency_key: z.string().min(1).max(200),
  company_id: z.string().min(1).max(120),
  contact_id: z.string().min(1).max(120).optional(),
  message_id: z.string().min(1).max(120).optional(),
  due_at: z.string().datetime({ offset: true }),
  note: z.string().trim().min(1).max(5_000),
}).strict();

type Context = { db: D1Database; bucket: R2Bucket; now?: string; actorType?: string; credentialRole?: string; toolName?: string };

function now(context: Context): string {
  return context.now ?? new Date().toISOString();
}

function textResult(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] };
}

function boundedFailureMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.slice(0, 500);
}

async function recordSendFailure(context: Context, messageId: string, companyId: string, workflowRunId: string, idempotencyKey: string, code: string, error: unknown) {
  const failure = boundedFailureMessage(error);
  const timestamp = now(context);
  const attemptKey = `${messageId}:${crypto.randomUUID()}`;
  await context.db.batch([
    context.db.prepare("UPDATE messages SET status = 'failed', failure_code = ?, updated_at = ? WHERE id = ?").bind(code, timestamp, messageId),
    context.db.prepare("INSERT INTO workflow_events (id, schema_version, company_id, entity_type, entity_id, actor_type, credential_role, tool_name, workflow_run_id, idempotency_key, previous_state, next_state, metadata_json, created_at) VALUES (?, 1, ?, 'message', ?, 'worker', 'operator', 'resend_send_failed', ?, ?, 'pending', 'failed', ?, ?)")
      .bind(crypto.randomUUID(), companyId, messageId, workflowRunId, `${idempotencyKey}:${attemptKey}`, JSON.stringify({ code, message: failure, retryable: !code.includes("definitive_4xx"), attempt_key: attemptKey }), timestamp),
  ]);
  return failure;
}

async function requireCompany(context: Context, companyId: string) {
  const company = await context.db.prepare("SELECT id, status FROM companies WHERE id = ? LIMIT 1").bind(companyId).first<{ id: string; status: string }>();
  if (!company) throw new Error("Company not found");
  return company;
}

async function requireResearchRun(context: Context, companyId: string, researchRunId: string, workflowRunId: string) {
  const researchRun = await context.db.prepare(
    "SELECT id FROM research_runs WHERE id = ? AND company_id = ? AND workflow_run_id = ? LIMIT 1",
  ).bind(researchRunId, companyId, workflowRunId).first<{ id: string }>();
  if (!researchRun) throw new Error("Research run does not belong to company and workflow run");
  return researchRun;
}

async function requireEvidence(context: Context, evidenceId: string, companyId: string, workflowRunId?: string) {
  const query = workflowRunId
    ? "SELECT id FROM evidence_refs WHERE id = ? AND company_id = ? AND workflow_run_id = ? LIMIT 1"
    : "SELECT id FROM evidence_refs WHERE id = ? AND company_id = ? LIMIT 1";
  const bindings = workflowRunId ? [evidenceId, companyId, workflowRunId] : [evidenceId, companyId];
  const evidence = await context.db.prepare(query).bind(...bindings).first<{ id: string }>();
  if (!evidence) throw new Error("Evidence does not belong to company and workflow run");
  return evidence;
}

async function begin(context: Context, entityType: string, entityId: string, input: { workflow_run_id: string; idempotency_key: string; company_id?: string }, toolName: string) {
  return beginIdempotentMutation({
    db: context.db,
    entityType,
    entityId,
    actorType: context.actorType ?? "codex",
    credentialRole: context.credentialRole ?? "operator",
    toolName,
    workflowRunId: input.workflow_run_id,
    companyId: input.company_id,
    idempotencyKey: input.idempotency_key,
    input,
    now: now(context),
  });
}

type MutationOutcome = {
  result: unknown;
  nextState?: string;
  companyId?: string;
  onFailure?: () => Promise<void>;
};

async function executeIdempotentMutation(
  context: Context,
  entityType: string,
  entityId: string,
  input: { workflow_run_id: string; idempotency_key: string; company_id?: string },
  toolName: string,
  operation: () => Promise<MutationOutcome>,
) {
  const claim = await begin(context, entityType, entityId, input, toolName);
  if (claim.status === "complete") return textResult(claim.result);

  let outcome: MutationOutcome;
  try {
    outcome = await operation();
  } catch (error) {
    try {
      await abortIdempotentMutation(context.db, entityType, input.idempotency_key, claim.ownerToken);
    } catch (abortError) {
      console.error("Failed to release idempotency claim", boundedFailureMessage(abortError));
    }
    throw error;
  }

  try {
    await completeIdempotentMutation(
      context.db,
      entityType,
      input.idempotency_key,
      outcome.result,
      outcome.nextState,
      now(context),
      outcome.companyId ?? input.company_id,
      claim.ownerToken,
    );
    return textResult(outcome.result);
  } catch (error) {
    if (outcome.onFailure) {
      try { await outcome.onFailure(); } catch (cleanupError) {
        console.error("Failed to roll back mutation side effect", boundedFailureMessage(cleanupError));
      }
    }
    // The operation returned successfully, so its outcome may be externally visible even
    // when best-effort compensation ran. Keep the started claim: aborting it would let the
    // same request repeat the side effect. Operators must inspect state instead of retrying
    // with a different key.
    throw new Error(
      "mutation outcome committed; idempotency finalization failed; do not retry with a new key / inspect state",
      { cause: error },
    );
  }
}

export async function createCompany(context: Context, input: unknown) {
  const value = companyInputSchema.parse(input);
  const id = crypto.randomUUID();
  return executeIdempotentMutation(context, "company", id, value, "create_company", async () => {
    const persistedId = await insertCompany(context.db, {
      id,
      name: value.name,
      normalizedDomain: value.website_url ? normalizeDomain(value.website_url) : null,
      websiteUrl: value.website_url ?? null,
      fitScore: value.fit_score ?? null,
      fitSummary: value.fit_summary ?? null,
      now: now(context),
    });
    return { result: { id: persistedId, state: "discovered", workflow_run_id: value.workflow_run_id }, nextState: "discovered", companyId: persistedId };
  });
}

export async function createContact(context: Context, input: unknown) {
  const value = contactInputSchema.parse(input);
  const id = crypto.randomUUID();
  return executeIdempotentMutation(context, "contact", id, value, "upsert_contact", async () => {
    await requireCompany(context, value.company_id);
    await requireEvidence(context, value.verification_evidence_id, value.company_id, value.workflow_run_id);
    const existingContact = await context.db.prepare("SELECT id, company_id FROM contacts WHERE normalized_email = ? LIMIT 1")
      .bind(value.email.trim().toLowerCase()).first<{ id: string; company_id: string }>();
    if (existingContact && existingContact.company_id !== value.company_id) throw new Error("Existing contact belongs to a different company");
    const persistedId = await upsertContact(context.db, {
      id,
      companyId: value.company_id,
      email: value.email,
      name: value.name ?? null,
      role: value.role ?? null,
      verificationMethod: value.verification_method,
      verifiedAt: value.verified_at,
      verificationEvidenceId: value.verification_evidence_id,
      now: now(context),
    });
    return { result: { id: persistedId, normalized_email: value.email.trim().toLowerCase() } };
  });
}

export async function startResearch(context: Context, input: unknown) {
  const value = researchRunSchema.parse(input);
  const id = crypto.randomUUID();
  return executeIdempotentMutation(context, "research_run", id, value, "start_research_run", async () => {
    const company = await context.db.prepare("SELECT status FROM companies WHERE id = ? LIMIT 1").bind(value.company_id).first<{ status: string }>();
    if (!company || !canTransition(company.status as OutreachState, "researching")) throw new Error("Company is not eligible for research");
    await context.db.batch([
      context.db.prepare(`INSERT INTO research_runs (id, schema_version, company_id, workflow_run_id, state, started_at, created_at, updated_at) VALUES (?, 1, ?, ?, 'researching', ?, ?, ?)`)
        .bind(id, value.company_id, value.workflow_run_id, now(context), now(context), now(context)),
      context.db.prepare("UPDATE companies SET status = 'researching', updated_at = ? WHERE id = ?").bind(now(context), value.company_id),
    ]);
    return { result: { id, state: "researching" }, nextState: "researching" };
  });
}

export async function recordFinding(context: Context, input: unknown) {
  const value = findingSchema.parse(input);
  const id = crypto.randomUUID();
  return executeIdempotentMutation(context, "research_finding", id, value, "record_finding", async () => {
    await requireResearchRun(context, value.company_id, value.research_run_id, value.workflow_run_id);
    if (value.evidence_ref_id) await requireEvidence(context, value.evidence_ref_id, value.company_id, value.workflow_run_id);
    await context.db.prepare(`INSERT INTO research_findings (id, schema_version, research_run_id, category, finding, confidence, source_url, evidence_ref_id, created_at) VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, value.research_run_id, value.category, value.finding, value.confidence, value.source_url, value.evidence_ref_id ?? null, now(context)).run();
    return { result: { id, state: "recorded" } };
  });
}

export async function storeEvidence(context: Context, input: unknown) {
  const value = evidenceSchema.parse(input);
  return executeIdempotentMutation(context, "evidence", `${value.company_id}/${value.research_run_id}/${value.filename}`, value, "store_evidence", async () => {
    await requireResearchRun(context, value.company_id, value.research_run_id, value.workflow_run_id);
    const bytes = new TextEncoder().encode(value.content);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    const sha256 = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const key = buildEvidenceKey(value.company_id, value.research_run_id, value.filename);
    await context.bucket.put(key, bytes, { httpMetadata: { contentType: value.content_type }, customMetadata: { source_url: value.source_url ?? "", workflow_run_id: value.workflow_run_id, research_run_id: value.research_run_id, provenance: "untrusted_external" } });
    const cleanupUploadedObject = async () => {
      const failures: string[] = [];
      try {
        await context.bucket.delete(key);
      } catch (cleanupError) {
        failures.push(`r2: ${boundedFailureMessage(cleanupError)}`);
      }
      if (failures.length === 0) {
        try {
          await context.db.prepare("DELETE FROM evidence_refs WHERE object_key = ?").bind(key).run();
        } catch (cleanupError) {
          failures.push(`d1: ${boundedFailureMessage(cleanupError)}`);
        }
      }
      if (failures.length > 0) {
        try {
          await context.db.prepare(`INSERT INTO workflow_events (id, schema_version, company_id, entity_type, entity_id, actor_type, credential_role, tool_name, workflow_run_id, idempotency_key, metadata_json, created_at) VALUES (?, 1, ?, 'cleanup_failure', ?, 'worker', 'operator', 'evidence_cleanup_failed', ?, ?, ?, ?)`)
            .bind(crypto.randomUUID(), value.company_id, key, value.workflow_run_id, `${value.idempotency_key}:cleanup:${crypto.randomUUID()}`, JSON.stringify({ object_key: key, errors: failures }), now(context)).run();
        } catch { /* Cleanup diagnostics must never mask the original mutation failure. */ }
        throw new Error("Evidence cleanup failed");
      }
    };
    try {
      const id = crypto.randomUUID();
      const capturedAt = now(context);
      const expiresAt = new Date(Date.parse(capturedAt) + 90 * 24 * 60 * 60 * 1000).toISOString();
      await context.db.prepare(`INSERT INTO evidence_refs (id, schema_version, company_id, workflow_run_id, object_key, content_type, byte_size, sha256, source_url, provenance, captured_at, expires_at, created_at) VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(id, value.company_id, value.workflow_run_id, key, value.content_type, bytes.byteLength, sha256, value.source_url ?? null, "untrusted_external", capturedAt, expiresAt, capturedAt).run();
      return { result: { id, object_key: key, sha256, expires_at: expiresAt }, onFailure: cleanupUploadedObject };
    } catch (error) {
      try { await cleanupUploadedObject(); } catch { /* Preserve the D1 failure. */ }
      throw error;
    }
  });
}

export async function completeResearch(context: Context, input: unknown) {
  const value = researchActionSchema.parse(input);
  return executeIdempotentMutation(context, "research_completion", value.research_run_id, value, "complete_research_run", async () => {
    const run = await context.db.prepare("SELECT state FROM research_runs WHERE id = ? AND company_id = ? AND workflow_run_id = ? LIMIT 1").bind(value.research_run_id, value.company_id, value.workflow_run_id).first<{ state: string }>();
    if (!run || !canTransition(run.state as OutreachState, "researched")) throw new Error("Research run is not eligible for completion");
    await context.db.batch([
      context.db.prepare("UPDATE research_runs SET state = 'researched', completed_at = ?, updated_at = ? WHERE id = ? AND company_id = ?").bind(now(context), now(context), value.research_run_id, value.company_id),
      context.db.prepare("UPDATE companies SET status = 'researched', updated_at = ? WHERE id = ?").bind(now(context), value.company_id),
    ]);
    return { result: { state: "researched", company_id: value.company_id }, nextState: "researched" };
  });
}

export async function createDraft(context: Context, input: unknown) {
  const value = draftInputSchema.parse(input);
  const id = crypto.randomUUID();
  return executeIdempotentMutation(context, "draft", id, value, "create_outreach_draft", async () => {
    const company = await requireCompany(context, value.company_id);
    if (company.status !== "researched") throw new Error("Company must complete research before drafting");
    const contact = await context.db.prepare("SELECT id FROM contacts WHERE id = ? AND company_id = ? LIMIT 1").bind(value.contact_id, value.company_id).first<{ id: string }>();
    if (!contact) throw new Error("Contact does not belong to company");
    for (const evidenceId of value.claim_evidence_ids) await requireEvidence(context, evidenceId, value.company_id);
    await context.db.prepare(`INSERT INTO outreach_drafts (id, schema_version, company_id, contact_id, workflow_run_id, idempotency_key, state, subject, body, claim_evidence_ids_json, source_urls_json, created_at, updated_at) VALUES (?, 1, ?, ?, ?, ?, 'drafted', ?, ?, ?, ?, ?, ?)`)
      .bind(id, value.company_id, value.contact_id, value.workflow_run_id, value.idempotency_key, value.subject, value.body, JSON.stringify(value.claim_evidence_ids), JSON.stringify(value.source_urls), now(context), now(context)).run();
    return { result: { id, state: "drafted" }, nextState: "drafted" };
  });
}

export async function submitForReview(context: Context, input: unknown) {
  const value = submitForReviewSchema.parse(input);
  return executeIdempotentMutation(context, "review_submission", value.draft_id, value, "submit_outreach_for_review", async () => {
    const draft = await context.db.prepare("SELECT state, company_id FROM outreach_drafts WHERE id = ? LIMIT 1").bind(value.draft_id).first<{ state: string; company_id: string }>();
    if (!draft || !canTransition(draft.state as OutreachState, "in_review")) throw new Error("Draft is not eligible for independent review");
    await context.db.prepare("UPDATE outreach_drafts SET state = 'in_review', updated_at = ? WHERE id = ?").bind(now(context), value.draft_id).run();
    return { result: { draft_id: value.draft_id, state: "in_review" }, nextState: "in_review", companyId: draft.company_id };
  });
}

export async function submitReview(context: Context, input: unknown) {
  const value = reviewSchema.parse(input);
  if (value.decision !== "needs_changes") throw new Error("Operator review can only request changes");
  return executeIdempotentMutation(context, "review", value.draft_id, value, "submit_outreach_review", async () => {
    const draft = await context.db.prepare("SELECT state, company_id FROM outreach_drafts WHERE id = ? LIMIT 1").bind(value.draft_id).first<{ state: string; company_id: string }>();
    if (!draft || !canTransition(draft.state as OutreachState, "in_review")) throw new Error("Draft is not eligible for review");
    await context.db.batch([
      context.db.prepare(`INSERT INTO review_runs (id, schema_version, draft_id, reviewer_run_id, decision, policy_version, findings_json, reviewed_at, created_at) VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(crypto.randomUUID(), value.draft_id, value.reviewer_run_id ?? value.workflow_run_id, value.decision, value.policy_version, JSON.stringify(value.findings), now(context), now(context)),
      context.db.prepare("UPDATE outreach_drafts SET state = 'in_review', updated_at = ? WHERE id = ?").bind(now(context), value.draft_id),
    ]);
    return { result: { draft_id: value.draft_id, state: "in_review" }, nextState: "in_review", companyId: draft.company_id };
  });
}

export async function approveDraft(context: Context, input: unknown) {
  const value = reviewSchema.extend({ checklist: approvalChecklistSchema, reviewer_run_id: z.string().min(1).max(120), author_run_id: z.string().min(1).max(120).optional() }).parse(input);
  if (context.credentialRole !== "reviewer") throw new Error("Only reviewer credentials can approve drafts");
  return executeIdempotentMutation(context, "approval", value.draft_id, value, "approve_outreach_draft", async () => {
    const draft = await context.db.prepare("SELECT state, workflow_run_id, company_id FROM outreach_drafts WHERE id = ? LIMIT 1").bind(value.draft_id).first<{ state: string; workflow_run_id: string; company_id: string }>();
    if (!draft || !canTransition(draft.state as OutreachState, "approved")) throw new Error("Draft is not eligible for approval");
    if (value.reviewer_run_id === draft.workflow_run_id) throw new Error("Reviewer run must differ from draft author run");
    await context.db.batch([
      context.db.prepare(`INSERT INTO review_runs (id, schema_version, draft_id, reviewer_run_id, decision, policy_version, findings_json, approval_checklist_json, reviewed_at, created_at) VALUES (?, 1, ?, ?, 'approved', ?, ?, ?, ?, ?)`)
        .bind(crypto.randomUUID(), value.draft_id, value.reviewer_run_id, value.policy_version, JSON.stringify(value.findings), JSON.stringify(value.checklist), now(context), now(context)),
      context.db.prepare("UPDATE outreach_drafts SET state = 'approved', updated_at = ? WHERE id = ?").bind(now(context), value.draft_id),
    ]);
    return { result: { draft_id: value.draft_id, state: "approved" }, nextState: "approved", companyId: draft.company_id };
  });
}

export async function scheduleFollowUp(context: Context, input: unknown) {
  const value = followUpSchema.parse(input);
  const id = crypto.randomUUID();
  return executeIdempotentMutation(context, "follow_up", id, value, "schedule_follow_up", async () => {
    await requireCompany(context, value.company_id);
    if (value.contact_id) {
      const contact = await context.db.prepare("SELECT id FROM contacts WHERE id = ? AND company_id = ? LIMIT 1").bind(value.contact_id, value.company_id).first<{ id: string }>();
      if (!contact) throw new Error("Contact does not belong to company");
    }
    if (value.message_id) {
      const message = await context.db.prepare("SELECT id FROM messages WHERE id = ? AND company_id = ? LIMIT 1").bind(value.message_id, value.company_id).first<{ id: string }>();
      if (!message) throw new Error("Message does not belong to company");
    }
    await context.db.prepare(`INSERT INTO follow_ups (id, schema_version, company_id, contact_id, message_id, due_at, state, note, created_at, updated_at) VALUES (?, 1, ?, ?, ?, ?, 'scheduled', ?, ?, ?)`)
      .bind(id, value.company_id, value.contact_id ?? null, value.message_id ?? null, value.due_at, value.note, now(context), now(context)).run();
    return { result: { id, state: "scheduled" }, nextState: "scheduled" };
  });
}

export async function sendApproved(context: Context, input: unknown, outboundEnabled: boolean, dailyLimit: number, sendCount: number, resendApiKey: string | undefined) {
  const value = z.object({ schema_version: z.literal(1), workflow_run_id: z.string().min(1), idempotency_key: z.string().min(1), draft_id: z.string().min(1) }).strict().parse(input);
  if (!outboundEnabled) return textResult({ state: "paused", reason: "outbound_disabled" });
  if (!Number.isSafeInteger(dailyLimit) || dailyLimit < 0) return textResult({ state: "paused", reason: "daily_limit_invalid" });
  if (sendCount >= dailyLimit) return textResult({ state: "paused", reason: "daily_limit_reached" });
  if (!resendApiKey) throw new Error("Missing Worker secret: RESEND_API_KEY");

  const prior = await context.db.prepare("SELECT id, draft_id, status, provider_message_id, failure_code, send_attempts, created_at FROM messages WHERE send_idempotency_key = ? LIMIT 1").bind(value.idempotency_key).first<{ id: string; draft_id: string; status: string; provider_message_id: string | null; failure_code: string | null; send_attempts: number; created_at: string }>();
  let retrying = false;
  let messageId: string | null = null;
  if (prior) {
    if (prior.draft_id !== value.draft_id) throw new Error("Send idempotency key already used for a different draft");
    const retryable = prior.failure_code === "resend_network_error" || prior.failure_code === "resend_invalid_response" || prior.failure_code === "resend_missing_provider_id" || prior.failure_code === "resend_provider_failure";
    const insideWindow = Date.parse(now(context)) - Date.parse(prior.created_at) <= 24 * 60 * 60 * 1000;
    if (prior.status !== "failed" || !retryable || !insideWindow || prior.send_attempts >= 3) return textResult({ id: prior.id, state: prior.status, provider_message_id: prior.provider_message_id, idempotent_replay: true });
    retrying = true;
    messageId = prior.id;
  }

  const sendTime = now(context);
  const dayStart = new Date(new Date(sendTime).setUTCHours(0, 0, 0, 0)).toISOString();
  const draft = await context.db.prepare(`SELECT d.*, c.email, c.normalized_email, c.verification_method, c.verified_at, c.verification_evidence_id, ve.id AS verification_evidence_present, EXISTS(SELECT 1 FROM suppressions s WHERE s.normalized_email = c.normalized_email) AS recipient_suppressed, EXISTS(SELECT 1 FROM messages m WHERE m.draft_id = d.id) AS send_idempotency_used, r.reviewer_run_id, r.reviewed_at, r.approval_checklist_json FROM outreach_drafts d JOIN contacts c ON c.id = d.contact_id AND c.company_id = d.company_id LEFT JOIN evidence_refs ve ON ve.id = c.verification_evidence_id AND ve.company_id = d.company_id AND ve.expires_at > ? LEFT JOIN review_runs r ON r.draft_id = d.id AND r.decision = 'approved' WHERE d.id = ? ORDER BY r.reviewed_at DESC LIMIT 1`).bind(sendTime, value.draft_id).first<Record<string, unknown>>();
  if (!draft) throw new Error("Draft not found");
  if (!isSendableDraft({ state: String(draft.state) as never, authorRunId: String(draft.workflow_run_id), reviewerRunId: draft.reviewer_run_id ? String(draft.reviewer_run_id) : null, reviewedAt: draft.reviewed_at ? String(draft.reviewed_at) : null, approvalMaxAgeMs: 86_400_000, now: sendTime, recipientSuppressed: Boolean(draft.recipient_suppressed), contactVerified: Boolean(draft.verification_method && draft.verified_at && draft.verification_evidence_id && draft.verification_evidence_present), sendIdempotencyUsed: Boolean(draft.send_idempotency_used) && !retrying })) return textResult({ state: "rejected", reason: "send_gate_failed" });
  try {
    approvalChecklistSchema.parse(JSON.parse(String(draft.approval_checklist_json)));
  } catch {
    return textResult({ state: "rejected", reason: "send_gate_failed" });
  }
  messageId ??= crypto.randomUUID();
  const claim = retrying
    ? await context.db.prepare("UPDATE messages SET status = 'pending', failure_code = NULL, send_attempts = send_attempts + 1, last_attempt_at = ?, updated_at = ? WHERE id = ? AND status = 'failed' AND send_attempts < 3 AND created_at >= ? AND (SELECT COUNT(*) FROM messages WHERE direction = 'outbound' AND status IN ('pending', 'sent', 'delivered') AND last_attempt_at >= ?) < ?").bind(sendTime, sendTime, messageId, new Date(Date.parse(sendTime) - 24 * 60 * 60 * 1000).toISOString(), dayStart, dailyLimit).run()
    : await context.db.prepare(`INSERT OR IGNORE INTO messages (id, schema_version, draft_id, company_id, contact_id, send_idempotency_key, direction, status, send_attempts, last_attempt_at, subject, body, created_at, updated_at) SELECT ?, 1, ?, ?, ?, ?, 'outbound', 'pending', 1, ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM messages WHERE direction = 'outbound' AND status IN ('pending', 'sent', 'delivered') AND last_attempt_at >= ?) < ?`)
      .bind(messageId, value.draft_id, draft.company_id, draft.contact_id, value.idempotency_key, sendTime, draft.subject, draft.body, sendTime, sendTime, dayStart, dailyLimit).run();
  if (Number(claim.meta.changes) !== 1) {
    const claimed = await context.db.prepare("SELECT id, draft_id, status, provider_message_id FROM messages WHERE send_idempotency_key = ? LIMIT 1").bind(value.idempotency_key).first<{ id: string; draft_id: string; status: string; provider_message_id: string | null }>();
    if (claimed) {
      if (claimed.draft_id !== value.draft_id) throw new Error("Send idempotency key already used for a different draft");
      return textResult({ id: claimed.id, state: claimed.status, provider_message_id: claimed.provider_message_id, idempotent_replay: true });
    }
    const dailyCount = await context.db.prepare("SELECT COUNT(*) AS count FROM messages WHERE direction = 'outbound' AND status IN ('pending', 'sent', 'delivered') AND last_attempt_at >= ?")
      .bind(dayStart).first<{ count: number }>();
    if (Number(dailyCount?.count ?? 0) >= dailyLimit) return textResult({ state: "paused", reason: "daily_limit_reached" });
    return textResult({ state: "rejected", reason: "draft_already_claimed" });
  }
  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json", "Idempotency-Key": value.idempotency_key }, body: JSON.stringify({ from: "Fidexa <hello@fidexa.org>", to: [draft.email], subject: draft.subject, text: draft.body }) });
  } catch (error) {
    await recordSendFailure(context, messageId, String(draft.company_id), value.workflow_run_id, value.idempotency_key, "resend_network_error", error);
    return textResult({ id: messageId, state: "failed", provider_message_id: null, error: "resend_network_error" });
  }
  if (!response.ok) {
    const failureCode = response.status >= 400 && response.status < 500 && response.status !== 429 ? "resend_definitive_4xx" : "resend_provider_failure";
    let provider: { id?: string; message?: string } = {};
    try { provider = z.object({ id: z.string().min(1).optional(), message: z.string().max(2_000).optional() }).passthrough().parse(await response.json()); } catch { /* HTTP status remains authoritative. */ }
    await recordSendFailure(context, messageId, String(draft.company_id), value.workflow_run_id, value.idempotency_key, failureCode, provider.message ?? `HTTP ${response.status}`);
    return textResult({ id: messageId, state: "failed", provider_message_id: provider.id ?? null, error: provider.message ?? failureCode });
  }
  let provider: { id?: string; message?: string };
  try {
    provider = z.object({ id: z.string().min(1).optional(), message: z.string().max(2_000).optional() }).passthrough().parse(await response.json());
  } catch (error) {
    await recordSendFailure(context, messageId, String(draft.company_id), value.workflow_run_id, value.idempotency_key, "resend_invalid_response", error);
    return textResult({ id: messageId, state: "failed", provider_message_id: null, error: "resend_invalid_response" });
  }
  if (!provider.id) {
    await recordSendFailure(context, messageId, String(draft.company_id), value.workflow_run_id, value.idempotency_key, "resend_missing_provider_id", "Resend response did not include a provider message id");
    return textResult({ id: messageId, state: "failed", provider_message_id: null, error: "resend_missing_provider_id" });
  }
  const status = "sent";
  await context.db.prepare("UPDATE messages SET status = ?, provider_message_id = ?, sent_at = CASE WHEN ? = 'sent' THEN ? ELSE sent_at END, updated_at = ? WHERE id = ?").bind(status, provider.id ?? null, status, now(context), now(context), messageId).run();
  return textResult({ id: messageId, state: status, provider_message_id: provider.id ?? null, error: provider.message ?? null });
}
