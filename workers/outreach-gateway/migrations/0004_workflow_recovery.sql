ALTER TABLE review_runs ADD COLUMN approval_checklist_json TEXT NOT NULL DEFAULT '{}';

ALTER TABLE evidence_refs ADD COLUMN provenance TEXT NOT NULL DEFAULT 'untrusted_external';

ALTER TABLE messages ADD COLUMN send_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE messages ADD COLUMN failure_code TEXT;
ALTER TABLE messages ADD COLUMN last_attempt_at TEXT;

ALTER TABLE zoho_sync_state ADD COLUMN watermark_received_at TEXT;
ALTER TABLE zoho_sync_state ADD COLUMN watermark_message_id TEXT;
ALTER TABLE zoho_sync_state ADD COLUMN continuation_upper_bound TEXT;
ALTER TABLE zoho_sync_state ADD COLUMN continuation_start INTEGER;
ALTER TABLE zoho_sync_state ADD COLUMN continuation_candidate_watermark TEXT;
