ALTER TABLE workflow_events ADD COLUMN company_id TEXT REFERENCES companies(id);

CREATE INDEX IF NOT EXISTS workflow_events_company_created_index
  ON workflow_events(company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS research_findings_run_created_index
  ON research_findings(research_run_id, created_at DESC);

CREATE INDEX IF NOT EXISTS evidence_refs_company_captured_index
  ON evidence_refs(company_id, captured_at DESC);

CREATE INDEX IF NOT EXISTS outreach_drafts_company_updated_index
  ON outreach_drafts(company_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS messages_company_created_index
  ON messages(company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS message_events_message_created_index
  ON message_events(message_id, created_at DESC);

CREATE INDEX IF NOT EXISTS follow_ups_company_due_index
  ON follow_ups(company_id, due_at ASC);

-- Backfill only associations that can be derived from a persisted entity.
-- Ambiguous legacy rows deliberately remain NULL so reporting cannot leak them.
UPDATE workflow_events
SET company_id = CASE entity_type
  WHEN 'company' THEN COALESCE(
    (SELECT id FROM companies WHERE id = workflow_events.entity_id),
    (SELECT id FROM companies WHERE id = CASE WHEN json_valid(workflow_events.metadata_json) THEN json_extract(workflow_events.metadata_json, '$.result.id') END)
  )
  WHEN 'contact' THEN COALESCE(
    (SELECT company_id FROM contacts WHERE id = workflow_events.entity_id),
    (SELECT company_id FROM contacts WHERE id = CASE WHEN json_valid(workflow_events.metadata_json) THEN json_extract(workflow_events.metadata_json, '$.result.id') END)
  )
  WHEN 'research_run' THEN (SELECT company_id FROM research_runs WHERE id = workflow_events.entity_id)
  WHEN 'research_finding' THEN (SELECT rr.company_id FROM research_findings rf JOIN research_runs rr ON rr.id = rf.research_run_id WHERE rf.id = workflow_events.entity_id)
  WHEN 'research_completion' THEN (SELECT company_id FROM research_runs WHERE id = workflow_events.entity_id)
  WHEN 'evidence' THEN (SELECT id FROM companies WHERE id = substr(workflow_events.entity_id, 1, instr(workflow_events.entity_id || '/', '/') - 1))
  WHEN 'draft' THEN (SELECT company_id FROM outreach_drafts WHERE id = workflow_events.entity_id)
  WHEN 'review' THEN (SELECT d.company_id FROM outreach_drafts d WHERE d.id = workflow_events.entity_id)
  WHEN 'approval' THEN (SELECT d.company_id FROM outreach_drafts d WHERE d.id = workflow_events.entity_id)
  WHEN 'message' THEN (SELECT company_id FROM messages WHERE id = workflow_events.entity_id)
  WHEN 'follow_up' THEN (SELECT company_id FROM follow_ups WHERE id = workflow_events.entity_id)
END
WHERE company_id IS NULL;
