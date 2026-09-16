import "server-only";

import { getServerConfig } from "./config";

const encoder = new TextEncoder();

async function signReadRequest(secret: string, request: Request, timestamp: number, requestId: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const url = new URL(request.url);
  const message = `${timestamp}.${requestId}.${request.method}.${url.pathname}${url.search}`;
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export type OutreachSummary = {
  companies: Array<{ status: string; count: number }>;
  drafts: Array<{ state: string; count: number }>;
  messages: Array<{ status: string; count: number }>;
};

async function signedRead(path: string): Promise<Response> {
  const config = getServerConfig();
  if (!config.outreachWorkerUrl || !config.outreachReadSecret) throw new Error("Outreach Worker is not configured");
  const request = new Request(`${config.outreachWorkerUrl.replace(/\/$/, "")}${path}`);
  const timestamp = Math.floor(Date.now() / 1000);
  const requestId = crypto.randomUUID();
  const headers = new Headers({
    "x-fidexa-read-timestamp": String(timestamp),
    "x-fidexa-read-request-id": requestId,
  });
  headers.set("x-fidexa-read-signature", await signReadRequest(config.outreachReadSecret, request, timestamp, requestId));
  const response = await fetch(request, {
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) throw new Error(`Outreach Worker request failed (${response.status})`);
  return response;
}

async function read<T>(path: string): Promise<T> {
  const response = await signedRead(path);
  return response.json() as Promise<T>;
}

export function readOutreachSummary(): Promise<OutreachSummary> {
  return read<OutreachSummary>("/reporting/summary");
}

export type OutreachCompany = {
  id: string;
  name: string;
  normalized_domain: string | null;
  website_url: string | null;
  status: string;
  fit_score: number | null;
  fit_summary: string | null;
  created_at: string;
  updated_at: string;
};

export function readOutreachCompanies(): Promise<{ items: OutreachCompany[]; limit: number; offset: number }> {
  return read("/reporting/companies?limit=100&offset=0");
}

export type OutreachCompanyDetail = {
  company: OutreachCompany | null;
  contacts: OutreachContact[];
  researchRuns: OutreachResearchRun[];
  findings: OutreachFinding[];
  evidence: OutreachEvidence[];
  drafts: OutreachDraft[];
  messages: OutreachMessage[];
  followUps: OutreachFollowUp[];
  auditTimeline: OutreachWorkflowEvent[];
};

export function readOutreachCompany(id: string): Promise<OutreachCompanyDetail> {
  return read(`/reporting/companies/${encodeURIComponent(id)}`);
}

export function readOutreachEvidence(id: string): Promise<Response> {
  return signedRead(`/reporting/evidence/${encodeURIComponent(id)}`);
}

export function isSafeExternalUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export type OutreachContact = { id: string; email: string; name: string | null; role: string | null; verification_method: string | null; verified_at: string | null; verification_evidence_id: string | null; created_at: string; updated_at: string };
export type OutreachResearchRun = { id: string; workflow_run_id: string; state: string; started_at: string; completed_at: string | null; failure_code: string | null; created_at: string; updated_at: string };
export type OutreachFinding = { id: string; category: string; finding: string; confidence: string; source_url: string; evidence_ref_id: string | null; created_at: string };
export type OutreachEvidence = { id: string; content_type: string; byte_size: number; sha256: string; source_url: string | null; captured_at: string; expires_at: string; provenance: string };
export type OutreachReview = { id: string; reviewer_run_id: string; decision: string; policy_version: string; findings: string[]; checklist: string[]; reviewed_at: string };
export type OutreachDraft = { id: string; company_id: string; contact_id: string; workflow_run_id: string; state: string; subject: string; body: string; claim_evidence_ids: string[]; source_urls: string[]; created_at: string; updated_at: string; reviews: OutreachReview[]; latestReview: OutreachReview | null };
export type OutreachMessageEvent = { id: string; event_type: string; created_at: string };
export type OutreachMessage = { id: string; draft_id?: string | null; company_id: string | null; contact_id: string | null; direction: string; status: string; subject: string; sent_at: string | null; send_attempts?: number; failure_code?: string | null; created_at: string; updated_at: string; events?: OutreachMessageEvent[] };
export type OutreachFollowUp = { id: string; company_id: string; contact_id: string | null; message_id: string | null; due_at: string; state: string; note: string; created_at: string; updated_at: string };
export type OutreachWorkflowEvent = { id: string; entity_type: string; entity_id: string; actor_type: string; credential_role: string | null; tool_name: string; workflow_run_id: string | null; previous_state: string | null; next_state: string | null; created_at: string };

export function readOutreachMessages(): Promise<{ items: OutreachMessage[]; limit: number; offset: number }> {
  return read("/reporting/messages?limit=25&offset=0");
}

export function readOutreachFollowUps(): Promise<{ items: OutreachFollowUp[]; limit: number; offset: number }> {
  return read("/reporting/follow-ups?limit=25&offset=0");
}
