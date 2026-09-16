import { requireBinding } from "./env";
import { type OutreachEnv } from "./env";

function boundedError(error: unknown): string {
  return (error instanceof Error ? error.message : String(error)).slice(0, 500);
}

export async function recordScheduledFailure(db: D1Database, task: string, now: string, error: unknown): Promise<void> {
  try {
    await db.prepare("INSERT INTO workflow_events (id, schema_version, entity_type, entity_id, actor_type, tool_name, metadata_json, created_at) VALUES (?, 1, 'scheduled_task', ?, 'worker', 'scheduled_task_failed', ?, ?)")
      .bind(crypto.randomUUID(), task, JSON.stringify({ task, error: boundedError(error), retryable: true }), now).run();
  } catch {
    // Auditing must not prevent independently scheduled cleanup or synchronization work.
  }
}

export async function cleanupExpiredNonces(db: D1Database, now: string, batchSize = 100): Promise<{ deleted: number }> {
  const rows = await db.prepare(
    "SELECT scope, request_id FROM request_nonces WHERE expires_at <= ? ORDER BY expires_at ASC LIMIT ?",
  ).bind(now, batchSize).all<{ scope: string; request_id: string }>();
  let deleted = 0;
  for (const row of rows.results) {
    const result = await db.prepare(
      "DELETE FROM request_nonces WHERE scope = ? AND request_id = ? AND expires_at <= ?",
    ).bind(row.scope, row.request_id, now).run();
    deleted += result.meta?.changes ?? 0;
  }
  return { deleted };
}

export async function cleanupExpiredEvidence(env: OutreachEnv, now: string, batchSize = 100): Promise<{ deleted: number; failed: number }> {
  const db = requireBinding(env.OUTREACH_DB, "OUTREACH_DB");
  const bucket = requireBinding(env.OUTREACH_BUCKET, "OUTREACH_BUCKET");
  const rows = await db.prepare("SELECT id, object_key FROM evidence_refs WHERE expires_at <= ? ORDER BY expires_at ASC LIMIT ?").bind(now, batchSize).all<{ id: string; object_key: string }>();
  let deleted = 0;
  let failed = 0;
  for (const row of rows.results) {
    try {
      await bucket.delete(row.object_key);
      await db.batch([
        db.prepare("DELETE FROM evidence_refs WHERE id = ? AND object_key = ?").bind(row.id, row.object_key),
        db.prepare("INSERT INTO workflow_events (id, schema_version, entity_type, entity_id, actor_type, tool_name, metadata_json, created_at) VALUES (?, 1, 'retention', 'evidence', 'worker', 'retention_cleanup', ?, ?)")
          .bind(crypto.randomUUID(), JSON.stringify({ deleted: 1, failed: 0 }), now),
      ]);
      deleted += 1;
    } catch {
      failed += 1;
    }
  }
  if (failed > 0) {
    await db.prepare("INSERT INTO workflow_events (id, schema_version, entity_type, entity_id, actor_type, tool_name, metadata_json, created_at) VALUES (?, 1, 'retention', 'evidence', 'worker', 'retention_cleanup', ?, ?)").bind(crypto.randomUUID(), JSON.stringify({ failed }), now).run();
  }
  return { deleted, failed };
}
