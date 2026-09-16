CREATE TABLE IF NOT EXISTS request_nonces (
  scope TEXT NOT NULL,
  request_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (scope, request_id)
);

CREATE INDEX IF NOT EXISTS request_nonces_expires_at_index
  ON request_nonces(expires_at);
