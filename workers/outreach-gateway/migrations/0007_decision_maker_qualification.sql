ALTER TABLE contacts ADD COLUMN is_decision_maker INTEGER NOT NULL DEFAULT 0;
ALTER TABLE contacts ADD COLUMN decision_maker_evidence_id TEXT;
ALTER TABLE contacts ADD COLUMN decision_maker_reason TEXT;

CREATE INDEX IF NOT EXISTS contacts_company_decision_maker_index
  ON contacts(company_id, is_decision_maker, updated_at DESC);
