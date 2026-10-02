import { normalizeDomain, normalizeEmail } from "./persistence";

export function normalizeIdentityNameKey(value: string): string {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}

export async function backfillCompanyIdentityNameKeys(db: D1Database, maxRows = 50_000): Promise<void> {
  for (let processed = 0; processed < maxRows; processed += 1) {
    const company = await db.prepare(`
      SELECT id, name FROM companies
      WHERE identity_name_key IS NULL OR length(trim(identity_name_key)) = 0
      ORDER BY created_at, id LIMIT 1
    `).bind().first<{ id: string; name: string }>();
    if (!company) return;
    const identityNameKey = normalizeIdentityNameKey(company.name);
    if (!identityNameKey) throw new Error(`Cannot backfill an empty company identity key for ${company.id}`);
    await db.prepare(`
      UPDATE companies SET identity_name_key = ?
      WHERE id = ? AND (identity_name_key IS NULL OR length(trim(identity_name_key)) = 0)
    `).bind(identityNameKey, company.id).run();
  }

  const remaining = await db.prepare(`
    SELECT id FROM companies
    WHERE identity_name_key IS NULL OR length(trim(identity_name_key)) = 0
    LIMIT 1
  `).bind().first<{ id: string }>();
  if (remaining) throw new Error(`Company identity-key backfill exceeded ${maxRows} rows; retry before creating companies`);
}

export type CompanyInput = {
  id: string;
  name: string;
  normalizedDomain: string | null;
  websiteUrl: string | null;
  fitScore: number | null;
  fitSummary: string | null;
  sourceLane: string;
  identityResolutionId?: string | null;
  now: string;
};

export async function insertCompany(db: D1Database, input: CompanyInput): Promise<{ id: string; created: boolean; match?: "domain" | "name" }> {
  let result: { id: string } | null;
  try {
    result = await db.prepare(`
      INSERT INTO companies (id, schema_version, name, normalized_name, identity_name_key, normalized_domain, website_url, status, fit_score, fit_summary, source_lane, identity_resolution_id, created_at, updated_at)
      VALUES (?, 1, ?, lower(trim(?)), ?, ?, ?, 'discovered', ?, ?, ?, ?, ?, ?)
      ON CONFLICT(normalized_domain) WHERE normalized_domain IS NOT NULL DO NOTHING
      RETURNING id
    `).bind(input.id, input.name, input.name, normalizeIdentityNameKey(input.name), input.normalizedDomain, input.websiteUrl, input.fitScore, input.fitSummary, input.sourceLane, input.identityResolutionId ?? null, input.now, input.now).first<{ id: string }>();
  } catch (error) {
    const nameCollision = await db.prepare("SELECT id FROM companies WHERE identity_name_key = ? AND (normalized_domain IS NULL OR ? IS NULL) ORDER BY created_at LIMIT 1")
      .bind(normalizeIdentityNameKey(input.name), input.normalizedDomain).first<{ id: string }>();
    if (nameCollision) return { id: nameCollision.id, created: false, match: "name" };
    throw error;
  }
  if (result) return { id: result.id, created: true };
  if (input.normalizedDomain) {
    const existing = await db.prepare("SELECT id FROM companies WHERE normalized_domain = ? LIMIT 1")
      .bind(input.normalizedDomain).first<{ id: string }>();
    if (existing) return { id: existing.id, created: false, match: "domain" };
  }
  throw new Error("Company insert did not return an ID and no canonical domain match was found");
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
    ON CONFLICT(normalized_email) DO NOTHING
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
    if (existing?.company_id === input.companyId) return existing.id;
    throw new Error("Contact insert did not return an ID");
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
