UPDATE messages
SET last_attempt_at = COALESCE(last_attempt_at, sent_at, updated_at, created_at)
WHERE direction = 'outbound' AND last_attempt_at IS NULL;

ALTER TABLE zoho_sync_state ADD COLUMN continuation_candidate_message_id TEXT;

CREATE INDEX IF NOT EXISTS messages_outbound_daily_attempt_index
  ON messages(direction, status, last_attempt_at);
