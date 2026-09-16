PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  normalized_domain TEXT,
  website_url TEXT,
  status TEXT NOT NULL DEFAULT 'discovered',
  fit_score INTEGER,
  fit_summary TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS companies_domain_unique
  ON companies(normalized_domain)
  WHERE normalized_domain IS NOT NULL;

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL DEFAULT 1,
  company_id TEXT NOT NULL REFERENCES companies(id),
  email TEXT NOT NULL,
  normalized_email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT,
  verification_method TEXT,
  verified_at TEXT,
  verification_evidence_id TEXT,
  suppressed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS contacts_company_index ON contacts(company_id);

CREATE TABLE IF NOT EXISTS research_runs (
  id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL DEFAULT 1,
  company_id TEXT NOT NULL REFERENCES companies(id),
  workflow_run_id TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'researching',
  started_at TEXT NOT NULL,
  completed_at TEXT,
  failure_code TEXT,
  failure_message TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS research_runs_company_index ON research_runs(company_id, created_at DESC);

CREATE TABLE IF NOT EXISTS research_findings (
  id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL DEFAULT 1,
  research_run_id TEXT NOT NULL REFERENCES research_runs(id),
  category TEXT NOT NULL,
  finding TEXT NOT NULL,
  confidence TEXT NOT NULL,
  source_url TEXT NOT NULL,
  evidence_ref_id TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS evidence_refs (
  id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL DEFAULT 1,
  company_id TEXT REFERENCES companies(id),
  workflow_run_id TEXT NOT NULL,
  object_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  byte_size INTEGER NOT NULL,
  sha256 TEXT NOT NULL,
  source_url TEXT,
  captured_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS outreach_drafts (
  id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL DEFAULT 1,
  company_id TEXT NOT NULL REFERENCES companies(id),
  contact_id TEXT NOT NULL REFERENCES contacts(id),
  workflow_run_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL DEFAULT 'drafted',
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  claim_evidence_ids_json TEXT NOT NULL,
  source_urls_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS review_runs (
  id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL DEFAULT 1,
  draft_id TEXT NOT NULL REFERENCES outreach_drafts(id),
  reviewer_run_id TEXT NOT NULL,
  decision TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  findings_json TEXT NOT NULL,
  reviewed_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS review_runs_draft_index ON review_runs(draft_id, reviewed_at DESC);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL DEFAULT 1,
  draft_id TEXT REFERENCES outreach_drafts(id),
  company_id TEXT REFERENCES companies(id),
  contact_id TEXT REFERENCES contacts(id),
  send_idempotency_key TEXT UNIQUE,
  direction TEXT NOT NULL,
  status TEXT NOT NULL,
  provider_message_id TEXT,
  external_message_id TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS messages_provider_unique
  ON messages(provider_message_id)
  WHERE provider_message_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS messages_external_unique
  ON messages(external_message_id)
  WHERE external_message_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS message_events (
  id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL DEFAULT 1,
  message_id TEXT REFERENCES messages(id),
  provider_event_id TEXT,
  zoho_message_id TEXT,
  event_type TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS message_events_provider_unique
  ON message_events(provider_event_id)
  WHERE provider_event_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS message_events_zoho_unique
  ON message_events(zoho_message_id)
  WHERE zoho_message_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS workflow_events (
  id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL DEFAULT 1,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  credential_role TEXT,
  tool_name TEXT NOT NULL,
  workflow_run_id TEXT,
  idempotency_key TEXT,
  previous_state TEXT,
  next_state TEXT,
  metadata_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS workflow_events_idempotency_unique
  ON workflow_events(entity_type, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- The workflow event itself is the idempotency ledger. A completed event stores
-- only the stable result IDs/state, never message bodies or credentials.

CREATE TABLE IF NOT EXISTS follow_ups (
  id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL DEFAULT 1,
  company_id TEXT NOT NULL REFERENCES companies(id),
  contact_id TEXT REFERENCES contacts(id),
  message_id TEXT REFERENCES messages(id),
  due_at TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'scheduled',
  note TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS suppressions (
  id TEXT PRIMARY KEY,
  normalized_email TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  source TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS zoho_sync_state (
  id TEXT PRIMARY KEY,
  mailbox TEXT NOT NULL UNIQUE,
  cursor TEXT,
  last_success_at TEXT,
  last_failure_at TEXT,
  last_failure_code TEXT,
  updated_at TEXT NOT NULL
);
