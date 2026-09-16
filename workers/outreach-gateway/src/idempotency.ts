import { z } from "zod";

type IdempotencyContext = {
  db: D1Database;
  entityType: string;
  entityId: string;
  actorType: string;
  credentialRole: string;
  toolName: string;
  workflowRunId: string;
  companyId?: string;
  idempotencyKey: string;
  input: unknown;
  now: string;
};

export type IdempotentMutation = { status: "new"; ownerToken: string } | { status: "complete"; result: unknown };

async function digest(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function beginIdempotentMutation(context: IdempotencyContext): Promise<IdempotentMutation> {
  const requestHash = await digest(context.input);
  const ownerToken = crypto.randomUUID();
  const metadata = JSON.stringify({ request_hash: requestHash, status: "started", owner_token: ownerToken });
  const claim = await context.db.prepare(`
    INSERT OR IGNORE INTO workflow_events (
      id, schema_version, entity_type, entity_id, actor_type, credential_role,
      tool_name, workflow_run_id, company_id, idempotency_key, metadata_json, created_at
    ) VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(), context.entityType, context.entityId, context.actorType,
    context.credentialRole, context.toolName, context.workflowRunId, context.companyId ?? null,
    context.idempotencyKey, metadata, context.now,
  ).run();

  if ((claim.meta?.changes ?? 0) === 1) return { status: "new", ownerToken };

  const existing = await context.db.prepare(
    "SELECT metadata_json FROM workflow_events WHERE entity_type = ? AND idempotency_key = ? LIMIT 1",
  ).bind(context.entityType, context.idempotencyKey).first<{ metadata_json: string }>();
  if (!existing) throw new Error("Idempotency record could not be read");

  const parsed = z.object({ request_hash: z.string(), status: z.enum(["started", "complete"]), owner_token: z.string().uuid().optional(), result: z.unknown().optional() }).parse(JSON.parse(existing.metadata_json));
  if (parsed.request_hash !== requestHash) throw new Error("Idempotency key already used with a different payload");
  if (parsed.status === "complete") return { status: "complete", result: parsed.result };
  throw new Error("Idempotency mutation is already in progress");
}

export async function completeIdempotentMutation(db: D1Database, entityType: string, idempotencyKey: string, result: unknown, nextState?: string, now?: string, companyId?: string, ownerToken?: string): Promise<void> {
  if (!ownerToken) throw new Error("Idempotency owner token is required");
  const existing = await db.prepare(
    "SELECT metadata_json FROM workflow_events WHERE entity_type = ? AND idempotency_key = ? LIMIT 1",
  ).bind(entityType, idempotencyKey).first<{ metadata_json: string }>();
  if (!existing) throw new Error("Idempotency record could not be completed");
  const parsed = z.object({ request_hash: z.string(), status: z.literal("started"), owner_token: z.string().uuid() }).parse(JSON.parse(existing.metadata_json));
  if (parsed.owner_token !== ownerToken) throw new Error("Idempotency claim is not owned by this mutation");
  const metadata = JSON.stringify({ request_hash: parsed.request_hash, status: "complete", owner_token: ownerToken, result });
  const completed = await db.prepare(`
    UPDATE workflow_events
    SET metadata_json = ?, next_state = COALESCE(?, next_state), created_at = COALESCE(?, created_at), company_id = COALESCE(?, company_id)
    WHERE entity_type = ? AND idempotency_key = ?
      AND json_extract(metadata_json, '$.status') = 'started'
      AND json_extract(metadata_json, '$.owner_token') = ?
  `).bind(metadata, nextState ?? null, now ?? null, companyId ?? null, entityType, idempotencyKey, ownerToken).run();
  if ((completed.meta?.changes ?? 0) !== 1) throw new Error("Idempotency record could not be completed by this mutation owner");
}

export async function abortIdempotentMutation(db: D1Database, entityType: string, idempotencyKey: string, ownerToken: string): Promise<void> {
  const aborted = await db.prepare(`
    DELETE FROM workflow_events
    WHERE entity_type = ? AND idempotency_key = ?
      AND json_extract(metadata_json, '$.status') = 'started'
      AND json_extract(metadata_json, '$.owner_token') = ?
  `).bind(entityType, idempotencyKey, ownerToken).run();
  if ((aborted.meta?.changes ?? 0) > 1) throw new Error("Unexpected idempotency abort count");
}
