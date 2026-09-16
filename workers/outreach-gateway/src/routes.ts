import { requireBinding } from "./env";
import { type OutreachEnv } from "./env";
import { maxSignatureSkewSeconds, verifyReadRequest } from "./signatures";
import { boundedLimit } from "./limits";

async function claimReadRequestId(db: D1Database, requestId: string, now: string, signedTimestamp: number): Promise<boolean> {
  const expiresAt = new Date((signedTimestamp + maxSignatureSkewSeconds + 1) * 1_000).toISOString();
  const result = await db.prepare(
    "INSERT OR IGNORE INTO request_nonces (scope, request_id, expires_at, created_at) VALUES ('read', ?, ?, ?)",
  ).bind(requestId, expiresAt, now).run();
  return result.meta?.changes === 1;
}

export async function authenticateReadRequest(request: Request, secret: string, db: D1Database): Promise<boolean> {
  const requestId = request.headers.get("x-fidexa-read-request-id");
  const timestamp = Number(request.headers.get("x-fidexa-read-timestamp"));
  if (!secret || !requestId || !Number.isInteger(timestamp) || !await verifyReadRequest(request, secret)) return false;
  return claimReadRequestId(db, requestId, new Date().toISOString(), timestamp);
}

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}

function stringList(value: unknown, maximum = 100): string[] {
  if (typeof value !== "string") return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string").slice(0, maximum).map((item) => item.slice(0, 2_000))
      : [];
  } catch {
    return [];
  }
}

function reviewChecklist(value: unknown): string[] {
  if (typeof value !== "string") return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return [];
    return ["claims_supported", "recipient_validated", "prior_outreach_checked", "relevance_personalization_checked", "opt_out_suppression_checked", "deliverability_checked", "prompt_injection_checked"]
      .filter((key) => (parsed as Record<string, unknown>)[key] === true);
  } catch {
    return [];
  }
}

function pick(record: Record<string, unknown>, keys: readonly string[]): Record<string, unknown> {
  return Object.fromEntries(keys.filter((key) => key in record).map((key) => [key, record[key]]));
}

export async function handleReportingRequest(request: Request, env: OutreachEnv): Promise<Response> {
  if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405);
  const db = requireBinding(env.OUTREACH_DB, "OUTREACH_DB");
  if (!(await authenticateReadRequest(request, env.FIDEXA_READ_SECRET ?? "", db))) return json({ error: "unauthorized" }, 401);
  const url = new URL(request.url);
  const limit = boundedLimit(url.searchParams.get("limit"));
  const offset = Number(url.searchParams.get("offset") ?? "0");
  if (limit === null || !Number.isSafeInteger(offset) || offset < 0) return json({ error: "invalid_pagination" }, 400);

  if (url.pathname === "/reporting/summary") {
    const results = await db.batch([
      db.prepare("SELECT status, COUNT(*) AS count FROM companies GROUP BY status"),
      db.prepare("SELECT state, COUNT(*) AS count FROM outreach_drafts GROUP BY state"),
      db.prepare("SELECT status, COUNT(*) AS count FROM messages GROUP BY status"),
    ]);
    return json({ companies: results[0]?.results ?? [], drafts: results[1]?.results ?? [], messages: results[2]?.results ?? [] });
  }

  if (url.pathname === "/reporting/companies") {
    const result = await db.prepare("SELECT id, name, normalized_domain, website_url, status, fit_score, fit_summary, created_at, updated_at FROM companies ORDER BY updated_at DESC LIMIT ? OFFSET ?").bind(limit, offset).all();
    return json({ items: result.results, limit, offset });
  }

  const companyMatch = url.pathname.match(/^\/reporting\/companies\/([^/]+)$/);
  if (companyMatch) {
    const companyId = decodeURIComponent(companyMatch[1] ?? "");
    const result = await db.batch([
      db.prepare("SELECT id, name, normalized_domain, website_url, status, fit_score, fit_summary, created_at, updated_at FROM companies WHERE id = ? LIMIT 1").bind(companyId),
      db.prepare("SELECT id, email, name, role, verification_method, verified_at, verification_evidence_id, created_at, updated_at FROM contacts WHERE company_id = ? ORDER BY updated_at DESC LIMIT 100").bind(companyId),
      db.prepare("SELECT id, workflow_run_id, state, started_at, completed_at, failure_code, created_at, updated_at FROM research_runs WHERE company_id = ? ORDER BY created_at DESC LIMIT 100").bind(companyId),
      db.prepare("SELECT id, category, finding, confidence, source_url, evidence_ref_id, created_at FROM research_findings WHERE research_run_id IN (SELECT id FROM research_runs WHERE company_id = ?) ORDER BY created_at DESC LIMIT 100").bind(companyId),
      db.prepare("SELECT id, content_type, byte_size, sha256, source_url, captured_at, expires_at, provenance FROM evidence_refs WHERE company_id = ? ORDER BY captured_at DESC LIMIT 100").bind(companyId),
      db.prepare("SELECT id, company_id, contact_id, workflow_run_id, state, subject, body, claim_evidence_ids_json, source_urls_json, created_at, updated_at FROM outreach_drafts WHERE company_id = ? ORDER BY updated_at DESC LIMIT 100").bind(companyId),
      db.prepare("SELECT id, draft_id, reviewer_run_id, decision, policy_version, findings_json, approval_checklist_json, reviewed_at, created_at FROM review_runs WHERE draft_id IN (SELECT id FROM outreach_drafts WHERE company_id = ?) ORDER BY reviewed_at DESC LIMIT 100").bind(companyId),
      db.prepare("SELECT id, draft_id, company_id, contact_id, direction, status, subject, sent_at, send_attempts, failure_code, created_at, updated_at FROM messages WHERE company_id = ? ORDER BY created_at DESC LIMIT 100").bind(companyId),
      db.prepare("SELECT id, message_id, event_type, created_at FROM message_events WHERE message_id IN (SELECT id FROM messages WHERE company_id = ?) ORDER BY created_at DESC LIMIT 100").bind(companyId),
      db.prepare("SELECT id, company_id, contact_id, message_id, due_at, state, note, created_at, updated_at FROM follow_ups WHERE company_id = ? ORDER BY due_at ASC LIMIT 100").bind(companyId),
      db.prepare("SELECT id, entity_type, entity_id, actor_type, credential_role, tool_name, workflow_run_id, previous_state, next_state, created_at FROM workflow_events WHERE company_id = ? ORDER BY created_at DESC LIMIT 100").bind(companyId),
    ]);
    const reviews = (result[6]?.results ?? []) as Array<Record<string, unknown>>;
    const reviewsByDraft = new Map<string, Array<Record<string, unknown>>>();
    for (const review of reviews) {
      const draftId = typeof review.draft_id === "string" ? review.draft_id : null;
      if (!draftId) continue;
      const safeReview = {
        id: review.id,
        reviewer_run_id: review.reviewer_run_id,
        decision: review.decision,
        policy_version: review.policy_version,
        findings: stringList(review.findings_json),
        checklist: reviewChecklist(review.approval_checklist_json),
        reviewed_at: review.reviewed_at,
      };
      reviewsByDraft.set(draftId, [...(reviewsByDraft.get(draftId) ?? []), safeReview]);
    }
    const events = (result[8]?.results ?? []) as Array<Record<string, unknown>>;
    const eventsByMessage = new Map<string, Array<Record<string, unknown>>>();
    for (const event of events) {
      const messageId = typeof event.message_id === "string" ? event.message_id : null;
      if (messageId) eventsByMessage.set(messageId, [...(eventsByMessage.get(messageId) ?? []), { id: event.id, event_type: event.event_type, created_at: event.created_at }]);
    }
    const drafts = ((result[5]?.results ?? []) as Array<Record<string, unknown>>).map((draft) => ({
      ...pick(draft, ["id", "company_id", "contact_id", "workflow_run_id", "state", "subject", "body", "created_at", "updated_at"]),
      claim_evidence_ids: stringList(draft.claim_evidence_ids_json, 50),
      source_urls: stringList(draft.source_urls_json, 50),
      reviews: typeof draft.id === "string" ? reviewsByDraft.get(draft.id) ?? [] : [],
      latestReview: typeof draft.id === "string" ? reviewsByDraft.get(draft.id)?.[0] ?? null : null,
    }));
    const messages = ((result[7]?.results ?? []) as Array<Record<string, unknown>>).map((message) => ({
      ...pick(message, ["id", "draft_id", "company_id", "contact_id", "direction", "status", "subject", "sent_at", "send_attempts", "failure_code", "created_at", "updated_at"]),
      events: typeof message.id === "string" ? eventsByMessage.get(message.id) ?? [] : [],
    }));
    return json({
      company: result[0]?.results[0] ?? null,
      contacts: ((result[1]?.results ?? []) as Array<Record<string, unknown>>).map((row) => pick(row, ["id", "email", "name", "role", "verification_method", "verified_at", "verification_evidence_id", "created_at", "updated_at"])),
      researchRuns: ((result[2]?.results ?? []) as Array<Record<string, unknown>>).map((row) => pick(row, ["id", "workflow_run_id", "state", "started_at", "completed_at", "failure_code", "created_at", "updated_at"])),
      findings: ((result[3]?.results ?? []) as Array<Record<string, unknown>>).map((row) => pick(row, ["id", "category", "finding", "confidence", "source_url", "evidence_ref_id", "created_at"])),
      evidence: ((result[4]?.results ?? []) as Array<Record<string, unknown>>).map((row) => pick(row, ["id", "content_type", "byte_size", "sha256", "source_url", "captured_at", "expires_at", "provenance"])),
      drafts,
      messages,
      followUps: ((result[9]?.results ?? []) as Array<Record<string, unknown>>).map((row) => pick(row, ["id", "company_id", "contact_id", "message_id", "due_at", "state", "note", "created_at", "updated_at"])),
      auditTimeline: ((result[10]?.results ?? []) as Array<Record<string, unknown>>).map((row) => pick(row, ["id", "entity_type", "entity_id", "actor_type", "credential_role", "tool_name", "workflow_run_id", "previous_state", "next_state", "created_at"])),
    });
  }

  const evidenceMatch = url.pathname.match(/^\/reporting\/evidence\/([^/]+)$/);
  if (evidenceMatch) {
    const evidenceId = decodeURIComponent(evidenceMatch[1] ?? "");
    const evidence = await db.prepare("SELECT object_key, content_type, expires_at FROM evidence_refs WHERE id = ? LIMIT 1").bind(evidenceId).first<{ object_key: string; content_type: string; expires_at: string }>();
    if (!evidence || Date.parse(evidence.expires_at) <= Date.now()) return json({ error: "not_found" }, 404);
    const object = await requireBinding(env.OUTREACH_BUCKET, "OUTREACH_BUCKET").get(evidence.object_key);
    if (!object) return json({ error: "not_found" }, 404);
    return new Response(object.body, { headers: { "content-type": evidence.content_type, "cache-control": "private, max-age=60", "x-content-type-options": "nosniff" } });
  }

  if (url.pathname === "/reporting/follow-ups") {
    const result = await db.prepare("SELECT id, company_id, contact_id, message_id, due_at, state, note, created_at, updated_at FROM follow_ups ORDER BY due_at ASC LIMIT ? OFFSET ?").bind(limit, offset).all();
    return json({ items: result.results, limit, offset });
  }

  if (url.pathname === "/reporting/messages") {
    const result = await db.prepare("SELECT id, company_id, contact_id, direction, status, subject, sent_at, created_at, updated_at FROM messages ORDER BY created_at DESC LIMIT ? OFFSET ?").bind(limit, offset).all();
    return json({ items: result.results, limit, offset });
  }

  return json({ error: "not_found" }, 404);
}
