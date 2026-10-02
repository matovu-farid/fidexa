CREATE TABLE pre_review_packets (
  id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL DEFAULT 1,
  company_id TEXT NOT NULL REFERENCES companies(id),
  contact_id TEXT NOT NULL REFERENCES contacts(id),
  author_run_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  version INTEGER NOT NULL,
  supersedes_packet_id TEXT REFERENCES pre_review_packets(id),
  variant_id TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  links_json TEXT NOT NULL,
  claim_evidence_ids_json TEXT NOT NULL,
  source_urls_json TEXT NOT NULL,
  content_sha256 TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('pending_review', 'needs_changes', 'approved')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(company_id, contact_id, version)
);

CREATE INDEX pre_review_packets_company_index
  ON pre_review_packets(company_id, contact_id, created_at DESC);

CREATE TABLE pre_review_reviews (
  id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL DEFAULT 1,
  packet_id TEXT NOT NULL UNIQUE REFERENCES pre_review_packets(id),
  reviewer_run_id TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('needs_changes', 'approved')),
  policy_version TEXT NOT NULL,
  findings_json TEXT NOT NULL,
  approval_checklist_json TEXT,
  reviewed_content_sha256 TEXT NOT NULL,
  reviewed_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  CHECK (
    (decision = 'approved' AND approval_checklist_json IS NOT NULL) OR
    (decision = 'needs_changes' AND approval_checklist_json IS NULL)
  )
);

CREATE TABLE pre_review_reads (
  id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL DEFAULT 1,
  packet_id TEXT NOT NULL REFERENCES pre_review_packets(id),
  reviewer_run_id TEXT NOT NULL,
  reviewed_content_sha256 TEXT NOT NULL,
  evidence_ids_json TEXT NOT NULL,
  read_at TEXT NOT NULL,
  UNIQUE(packet_id, reviewer_run_id)
);

CREATE TRIGGER pre_review_reads_no_update
BEFORE UPDATE ON pre_review_reads
BEGIN
  SELECT RAISE(ABORT, 'pre-review read receipts are append-only');
END;

CREATE TRIGGER pre_review_reads_no_delete
BEFORE DELETE ON pre_review_reads
BEGIN
  SELECT RAISE(ABORT, 'pre-review read receipts are append-only');
END;

CREATE TRIGGER pre_review_packets_content_immutable
BEFORE UPDATE OF id, schema_version, company_id, contact_id, author_run_id, idempotency_key, version,
  supersedes_packet_id, variant_id, subject, body, claim_evidence_ids_json,
  links_json, source_urls_json, content_sha256, created_at ON pre_review_packets
BEGIN
  SELECT RAISE(ABORT, 'pre-review packet content is immutable');
END;

CREATE TRIGGER pre_review_packets_state_transition
BEFORE UPDATE OF state ON pre_review_packets
WHEN NOT (
  OLD.state = 'pending_review'
  AND NEW.state IN ('needs_changes', 'approved')
  AND EXISTS (
    SELECT 1 FROM pre_review_reviews r
    WHERE r.packet_id = OLD.id
      AND r.decision = NEW.state
      AND r.reviewed_content_sha256 = OLD.content_sha256
      AND r.reviewer_run_id <> OLD.author_run_id
  )
)
BEGIN
  SELECT RAISE(ABORT, 'pre-review packet state requires its independent exact-version decision');
END;

CREATE TRIGGER pre_review_reviews_validate_insert
BEFORE INSERT ON pre_review_reviews
WHEN NOT EXISTS (
    SELECT 1 FROM pre_review_packets p
    JOIN pre_review_reads rr ON rr.packet_id = p.id
    WHERE p.id = NEW.packet_id
      AND p.state = 'pending_review'
      AND p.author_run_id <> NEW.reviewer_run_id
      AND p.content_sha256 = NEW.reviewed_content_sha256
      AND rr.reviewer_run_id = NEW.reviewer_run_id
      AND rr.reviewed_content_sha256 = NEW.reviewed_content_sha256
      AND rr.evidence_ids_json = p.claim_evidence_ids_json
  )
BEGIN
  SELECT RAISE(ABORT, 'pre-review requires an independent exact-version read receipt');
END;

CREATE TRIGGER pre_review_packets_no_delete
BEFORE DELETE ON pre_review_packets
BEGIN
  SELECT RAISE(ABORT, 'pre-review packets are append-only');
END;

CREATE TRIGGER pre_review_reviews_no_update
BEFORE UPDATE ON pre_review_reviews
BEGIN
  SELECT RAISE(ABORT, 'pre-review decisions are append-only');
END;

CREATE TRIGGER pre_review_reviews_no_delete
BEFORE DELETE ON pre_review_reviews
BEGIN
  SELECT RAISE(ABORT, 'pre-review decisions are append-only');
END;

ALTER TABLE outreach_drafts ADD COLUMN pre_review_packet_id TEXT REFERENCES pre_review_packets(id);
ALTER TABLE outreach_drafts ADD COLUMN reviewed_links_json TEXT;

CREATE UNIQUE INDEX outreach_drafts_pre_review_packet_unique
  ON outreach_drafts(pre_review_packet_id)
  WHERE pre_review_packet_id IS NOT NULL;
