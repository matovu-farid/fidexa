ALTER TABLE companies ADD COLUMN source_lane TEXT NOT NULL DEFAULT 'unclassified'
  CHECK (source_lane IN ('paid_direct_request', 'warm_referral', 'verified_operator_workflow', 'formal_procurement', 'unclassified'));

CREATE TABLE qualification_history (
  id TEXT PRIMARY KEY,
  schema_version INTEGER NOT NULL DEFAULT 1,
  company_id TEXT NOT NULL REFERENCES companies(id),
  decision TEXT NOT NULL CHECK (decision IN ('held', 'reopened')),
  reason_code TEXT NOT NULL CHECK (reason_code IN (
    'no_current_buyer_need',
    'growth_signal_without_buyer_need',
    'existing_vendor_or_in_house_team',
    'procurement_closed_or_ineligible',
    'decision_maker_or_contact_unverified',
    'poor_fit_or_competitor',
    'duplicate_or_prior_outreach',
    'new_material_evidence',
    'other'
  )),
  reason TEXT NOT NULL,
  source_lane TEXT NOT NULL CHECK (source_lane IN ('paid_direct_request', 'warm_referral', 'verified_operator_workflow', 'formal_procurement', 'unclassified')),
  basis_evidence_ref_id TEXT NOT NULL REFERENCES evidence_refs(id),
  new_evidence_ref_id TEXT REFERENCES evidence_refs(id),
  prior_event_id TEXT UNIQUE REFERENCES qualification_history(id),
  workflow_run_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX qualification_history_company_created_index
  ON qualification_history(company_id, created_at DESC);

CREATE TRIGGER qualification_history_validate_insert
BEFORE INSERT ON qualification_history
BEGIN
  SELECT CASE
    WHEN NOT EXISTS (SELECT 1 FROM evidence_refs WHERE id = NEW.basis_evidence_ref_id AND company_id = NEW.company_id)
    THEN RAISE(ABORT, 'qualification decision must cite evidence belonging to the company')
  END;
  SELECT CASE
    WHEN NEW.prior_event_id IS NOT (SELECT id FROM qualification_history WHERE company_id = NEW.company_id ORDER BY created_at DESC, rowid DESC LIMIT 1)
    THEN RAISE(ABORT, 'qualification history must extend the latest company decision')
  END;
  SELECT CASE
    WHEN NEW.decision = 'held' AND NEW.reason_code = 'new_material_evidence'
    THEN RAISE(ABORT, 'held decisions cannot use the reopen-only reason code')
  END;
  SELECT CASE
    WHEN NEW.decision = 'reopened' AND (
      NEW.prior_event_id IS NULL
      OR (SELECT decision FROM qualification_history WHERE id = NEW.prior_event_id) != 'held'
      OR NEW.reason_code != 'new_material_evidence'
      OR NEW.new_evidence_ref_id IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM evidence_refs e
        JOIN research_runs rr ON rr.company_id = e.company_id AND rr.workflow_run_id = e.workflow_run_id
        JOIN research_findings rf ON rf.research_run_id = rr.id AND rf.evidence_ref_id = e.id
        JOIN qualification_history prior ON prior.id = NEW.prior_event_id
        WHERE e.id = NEW.new_evidence_ref_id
          AND e.company_id = NEW.company_id
          AND e.captured_at > prior.created_at
          AND rr.state = 'researched'
          AND rr.completed_at > prior.created_at
          AND rf.category = CASE NEW.source_lane
            WHEN 'paid_direct_request' THEN 'paid_buyer_request'
            WHEN 'warm_referral' THEN 'warm_referral_and_buyer_need'
            WHEN 'verified_operator_workflow' THEN 'verified_unresolved_buyer_workflow'
            ELSE ''
          END
      )
    ) THEN RAISE(ABORT, 'reopening requires new company-linked evidence captured after the active hold')
  END;
  SELECT CASE
    WHEN NEW.decision = 'held' AND NEW.prior_event_id IS NOT NULL
      AND (SELECT decision FROM qualification_history WHERE id = NEW.prior_event_id) != 'reopened'
    THEN RAISE(ABORT, 'a new hold can follow only an open qualification state')
  END;
END;

CREATE TRIGGER qualification_history_no_update
BEFORE UPDATE ON qualification_history
BEGIN
  SELECT RAISE(ABORT, 'qualification history is append-only');
END;

CREATE TRIGGER qualification_history_no_delete
BEFORE DELETE ON qualification_history
BEGIN
  SELECT RAISE(ABORT, 'qualification history is append-only');
END;
