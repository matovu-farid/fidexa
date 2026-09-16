CREATE UNIQUE INDEX IF NOT EXISTS messages_outbound_draft_unique
  ON messages(draft_id)
  WHERE direction = 'outbound' AND draft_id IS NOT NULL;
