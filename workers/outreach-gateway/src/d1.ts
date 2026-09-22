import { normalizeDomain, normalizeEmail } from "./persistence";

export type CompanyInput = {
  id: string;
  name: string;
  normalizedDomain: string | null;
  websiteUrl: string | null;
  fitScore: number | null;
  fitSummary: string | null;
  now: string;
};

export async function insertCompany(db: D1Database, input: CompanyInput): Promise<string> {
  const result = await db.prepare(`
    INSERT INTO companies (id, schema_version, name, normalized_domain, website_url, status, fit_score, fit_summary, created_at, updated_at)
    VALUES (?, 1, ?, ?, ?, 'discovered', ?, ?, ?, ?)
    ON CONFLICT(normalized_domain) WHERE normalized_domain IS NOT NULL DO UPDATE SET
      name = excluded.name,
      normalized_domain = excluded.normalized_domain,
      website_url = excluded.website_url,
      fit_score = COALESCE(excluded.fit_score, companies.fit_score),
      fit_summary = COALESCE(excluded.fit_summary, companies.fit_summary),
      updated_at = excluded.updated_at
    RETURNING id
  `).bind(input.id, input.name, input.normalizedDomain, input.websiteUrl, input.fitScore, input.fitSummary, input.now, input.now).first<{ id: string }>();
  if (!result) throw new Error("Company upsert did not return an ID");
  return result.id;
}

export type ContactInput = {
  id: string;
  companyId: string;
  email: string;
  name: string | null;
  role: string | null;
  verificationMethod: string;
  verifiedAt: string;
  verificationEvidenceId: string;
  isDecisionMaker: boolean;
  decisionMakerEvidenceId: string | null;
  decisionMakerReason: string | null;
  now: string;
};

export async function upsertContact(db: D1Database, input: ContactInput): Promise<string> {
  const email = normalizeEmail(input.email);
  const result = await db.prepare(`
    INSERT INTO contacts (
      id, schema_version, company_id, email, normalized_email, name, role,
      verification_method, verified_at, verification_evidence_id, is_decision_maker, decision_maker_evidence_id, decision_maker_reason, created_at, updated_at
    ) VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(normalized_email) DO UPDATE SET
      email = excluded.email,
      name = excluded.name,
      role = excluded.role,
      verification_method = excluded.verification_method,
      verified_at = excluded.verified_at,
      verification_evidence_id = excluded.verification_evidence_id,
      is_decision_maker = excluded.is_decision_maker,
      decision_maker_evidence_id = excluded.decision_maker_evidence_id,
      decision_maker_reason = excluded.decision_maker_reason,
      updated_at = excluded.updated_at
    WHERE contacts.company_id = excluded.company_id
    RETURNING id, company_id
  `).bind(
    input.id,
    input.companyId,
    input.email,
    email,
    input.name,
    input.role,
    input.verificationMethod,
    input.verifiedAt,
    input.verificationEvidenceId,
    input.isDecisionMaker ? 1 : 0,
    input.decisionMakerEvidenceId,
    input.decisionMakerReason,
    input.now,
    input.now,
  ).first<{ id: string; company_id: string }>();
  if (!result) {
    const existing = await db.prepare("SELECT id, company_id FROM contacts WHERE normalized_email = ? LIMIT 1")
      .bind(email).first<{ id: string; company_id: string }>();
    if (existing?.company_id !== undefined && existing.company_id !== input.companyId) throw new Error("Existing contact belongs to a different company");
    throw new Error("Contact upsert did not return an ID");
  }
  if (result.company_id !== input.companyId) throw new Error("Existing contact belongs to a different company");
  return result.id;
}

export async function findCompanyIdByDomain(db: D1Database, value: string): Promise<string | null> {
  const normalizedDomain = normalizeDomain(value);
  const result = await db.prepare("SELECT id FROM companies WHERE normalized_domain = ? LIMIT 1").bind(normalizedDomain).first<{ id: string }>();
  return result?.id ?? null;
}

export async function getDailySendCount(db: D1Database, dayStart: string): Promise<number> {
  const row = await db.prepare("SELECT COUNT(*) AS count FROM messages WHERE direction = 'outbound' AND status IN ('pending', 'sent', 'delivered') AND last_attempt_at >= ?").bind(dayStart).first<{ count: number }>();
  return Number(row?.count ?? 0);
}
