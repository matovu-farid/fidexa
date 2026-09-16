import { z } from "zod";
import { requireSecret, type OutreachEnv } from "./env";
import { requireBinding } from "./env";

const messageSchema = z.object({
  messageId: z.union([z.string(), z.number()]).transform(String),
  sender: z.union([z.object({ address: z.string().email() }), z.string().max(500)]).optional(),
  fromAddress: z.string().email().optional(),
  toAddress: z.string().optional(),
  subject: z.string().max(500).optional(),
  content: z.string().max(100_000).optional(),
  receivedTime: z.union([z.string(), z.number()]).optional(),
  receivedtime: z.union([z.string(), z.number()]).optional(),
}).passthrough();

type ZohoMessage = z.infer<typeof messageSchema>;
type Fetcher = typeof fetch;

function hasExactRecipient(value: string | undefined, mailbox: string): boolean {
  if (!value) return false;
  const normalizedMailbox = mailbox.trim().toLowerCase();
  const addresses = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [value];
  return addresses.some((address) => address.trim().toLowerCase() === normalizedMailbox);
}

function apiUrl(env: OutreachEnv, path: string): string {
  return `${env.ZOHO_API_BASE_URL ?? "https://mail.zoho.com/api"}${path}`;
}

async function accessToken(env: OutreachEnv, fetcher: Fetcher): Promise<string> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: requireSecret(env.ZOHO_CLIENT_ID, "ZOHO_CLIENT_ID"),
    client_secret: requireSecret(env.ZOHO_CLIENT_SECRET, "ZOHO_CLIENT_SECRET"),
    refresh_token: requireSecret(env.ZOHO_REFRESH_TOKEN, "ZOHO_REFRESH_TOKEN"),
  });
  const response = await fetcher(env.ZOHO_ACCOUNTS_URL ?? "https://accounts.zoho.com/oauth/v2/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body });
  if (!response.ok) throw new Error("Zoho OAuth refresh failed");
  const result = z.object({ access_token: z.string().min(1) }).parse(await response.json());
  return result.access_token;
}

function extractRawMessages(value: unknown): unknown[] {
  const candidates = z.object({ data: z.array(z.unknown()).optional(), dataList: z.array(z.unknown()).optional() }).passthrough().safeParse(value);
  if (!candidates.success || (!candidates.data.data && !candidates.data.dataList)) throw new Error("Zoho message envelope was malformed");
  return candidates.data.data ?? candidates.data.dataList ?? [];
}

function extractMessages(items: unknown[]): ZohoMessage[] {
  return items.map((item) => messageSchema.parse(item));
}

async function quarantineZohoPayload(db: D1Database, now: string, reason: string, retryable = true): Promise<void> {
  await db.prepare("INSERT INTO workflow_events (id, schema_version, entity_type, entity_id, actor_type, tool_name, metadata_json, created_at) VALUES (?, 1, 'zoho_sync', 'inbound', 'worker', 'zoho_quarantine', ?, ?)")
    .bind(crypto.randomUUID(), JSON.stringify({ reason: reason.slice(0, 200), retryable }), now).run();
}

export async function syncZohoReplies(env: OutreachEnv, now: string, fetcher: Fetcher = fetch): Promise<{ imported: number; cursor: string }> {
  const mailbox = env.ZOHO_MAILBOX;
  const folderId = env.ZOHO_FOLDER_ID;
  const accountId = requireSecret(env.ZOHO_ACCOUNT_ID, "ZOHO_ACCOUNT_ID");
  if (!mailbox || !folderId) throw new Error("Missing Zoho mailbox configuration");
  const db = requireBinding(env.OUTREACH_DB, "OUTREACH_DB");
  const current = await db.prepare("SELECT cursor, watermark_received_at, watermark_message_id, continuation_upper_bound, continuation_start, continuation_candidate_watermark, continuation_candidate_message_id FROM zoho_sync_state WHERE mailbox = ? LIMIT 1").bind(mailbox).first<{ cursor: string | null; watermark_received_at: string | null; watermark_message_id: string | null; continuation_upper_bound: string | null; continuation_start: number | null; continuation_candidate_watermark: string | null; continuation_candidate_message_id: string | null }>();
  const upperBound = Number(current?.continuation_upper_bound ?? Date.parse(now) - 2 * 60 * 1000);
  const initialStart = Math.max(Number(current?.continuation_start ?? 1), 1);
  const priorReceivedAt = Number(current?.watermark_received_at ?? 0);
  const hasValidWatermark = Boolean(current?.watermark_received_at && Number.isFinite(priorReceivedAt) && priorReceivedAt >= 0);
  const isNewerThanWatermark = (message: ZohoMessage) => {
    const receivedAt = Number(message.receivedtime ?? message.receivedTime ?? 0);
    return !hasValidWatermark || receivedAt > priorReceivedAt || (receivedAt === priorReceivedAt && message.messageId > (current?.watermark_message_id ?? ""));
  };
  const token = await accessToken(env, fetcher);
  const url = new URL(apiUrl(env, `/accounts/${encodeURIComponent(accountId)}/messages/search`));
  url.searchParams.set("folderId", folderId);
  url.searchParams.set("searchKey", `to:${mailbox}`);
  url.searchParams.set("receivedTime", String(upperBound));
  url.searchParams.set("limit", "25");
  url.searchParams.set("includeto", "true");
  url.searchParams.set("sortBy", "date");
  url.searchParams.set("sortorder", "false");
  const rawMessages: unknown[] = [];
  const messages: ZohoMessage[] = [];
  let continuationStart: number | null = null;
  for (let start = initialStart; start < initialStart + 100; start += 25) {
    url.searchParams.set("start", String(start));
    const response = await fetcher(url, { headers: { Authorization: `Zoho-oauthtoken ${token}` } });
    if (!response.ok) throw new Error("Zoho message list failed");
    try {
      const page = extractRawMessages(await response.json());
      rawMessages.push(...page);
      messages.push(...extractMessages(page));
      if (page.length < 25) break;
      if (hasValidWatermark && messages.some((message) => !isNewerThanWatermark(message))) break;
      if (start + 25 >= initialStart + 100) continuationStart = start + 25;
  } catch {
      await quarantineZohoPayload(db, now, "malformed_provider_envelope_or_item");
      throw new Error("Zoho message envelope contained malformed item");
    }
  }
  if (!hasValidWatermark) {
    await db.prepare(`INSERT INTO zoho_sync_state (id, mailbox, cursor, watermark_received_at, watermark_message_id, last_success_at, updated_at) VALUES (?, ?, '1', ?, NULL, ?, ?) ON CONFLICT(mailbox) DO UPDATE SET watermark_received_at = excluded.watermark_received_at, last_success_at = excluded.last_success_at, updated_at = excluded.updated_at`)
      .bind(crypto.randomUUID(), mailbox, String(upperBound), now, now).run();
    return { imported: 0, cursor: "1" };
  }
  let imported = 0;
  const eligibleMessages = messages.filter(isNewerThanWatermark);
  for (const message of eligibleMessages) {
    const from = message.fromAddress ?? (typeof message.sender === "string" ? message.sender : message.sender?.address);
    if (!from || !hasExactRecipient(message.toAddress, mailbox)) continue;
    const contact = await db.prepare("SELECT c.id, c.company_id FROM contacts c JOIN companies co ON co.id = c.company_id JOIN evidence_refs e ON e.id = c.verification_evidence_id AND e.company_id = c.company_id AND e.expires_at > ? WHERE c.normalized_email = ? AND c.verification_method IS NOT NULL AND c.verified_at IS NOT NULL LIMIT 1")
      .bind(now, from.trim().toLowerCase()).first<{ id: string; company_id: string }>();
    if (!contact) {
      await quarantineZohoPayload(db, now, "unmatched_verified_sender", false);
      continue;
    }
    const externalId = message.messageId;
    const result = await db.prepare(`INSERT OR IGNORE INTO messages (id, schema_version, company_id, contact_id, external_message_id, direction, status, subject, body, created_at, updated_at) VALUES (?, 1, ?, ?, ?, 'inbound', 'received', ?, ?, ?, ?)`)
      .bind(crypto.randomUUID(), contact.company_id, contact.id, externalId, message.subject ?? "(no subject)", message.content ?? "", now, now).run();
    if ((result.meta?.changes ?? 0) > 0) imported += 1;
    const storedMessage = await db.prepare("SELECT id FROM messages WHERE external_message_id = ? LIMIT 1").bind(externalId).first<{ id: string }>();
    await db.prepare("INSERT OR IGNORE INTO message_events (id, schema_version, message_id, zoho_message_id, event_type, payload_hash, payload_json, created_at) VALUES (?, 1, ?, ?, 'zoho.received', ?, ?, ?)")
      .bind(crypto.randomUUID(), storedMessage?.id ?? null, externalId, externalId, JSON.stringify({ subject: message.subject ?? "" }), now).run();
  }
  const newest = eligibleMessages.reduce<{ receivedAt: number; messageId: string } | null>((latest, message) => {
    const receivedAt = Number(message.receivedtime ?? message.receivedTime ?? 0);
    if (!Number.isFinite(receivedAt)) return latest;
    if (!latest || receivedAt > latest.receivedAt || (receivedAt === latest.receivedAt && message.messageId > latest.messageId)) return { receivedAt, messageId: message.messageId };
    return latest;
  }, null);
  const nextCursor = String(Math.max(Number(current?.cursor ?? "1"), 1) + rawMessages.length);
  const continuationCandidate = { receivedAt: Number(current?.continuation_candidate_watermark ?? -1), messageId: current?.continuation_candidate_message_id ?? "" };
  const candidate = newest && (newest.receivedAt > continuationCandidate.receivedAt || (newest.receivedAt === continuationCandidate.receivedAt && newest.messageId > continuationCandidate.messageId)) ? newest : continuationCandidate;
  const prior = { receivedAt: priorReceivedAt, messageId: current?.watermark_message_id ?? "" };
  const finalWatermark = candidate.receivedAt > prior.receivedAt || (candidate.receivedAt === prior.receivedAt && candidate.messageId > prior.messageId) ? candidate : prior;
  const nextWatermark = continuationStart ? current?.watermark_received_at ?? null : String(finalWatermark.receivedAt);
  await db.prepare(`INSERT INTO zoho_sync_state (id, mailbox, cursor, watermark_received_at, watermark_message_id, continuation_upper_bound, continuation_start, continuation_candidate_watermark, continuation_candidate_message_id, last_success_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(mailbox) DO UPDATE SET cursor = excluded.cursor, watermark_received_at = excluded.watermark_received_at, watermark_message_id = excluded.watermark_message_id, continuation_upper_bound = excluded.continuation_upper_bound, continuation_start = excluded.continuation_start, continuation_candidate_watermark = excluded.continuation_candidate_watermark, continuation_candidate_message_id = excluded.continuation_candidate_message_id, last_success_at = excluded.last_success_at, last_failure_at = NULL, last_failure_code = NULL, updated_at = excluded.updated_at`)
    .bind(crypto.randomUUID(), mailbox, nextCursor, nextWatermark, continuationStart ? current?.watermark_message_id ?? null : finalWatermark.messageId, continuationStart ? String(upperBound) : null, continuationStart, continuationStart ? String(candidate.receivedAt) : null, continuationStart ? candidate.messageId : null, now, now).run();
  return { imported, cursor: nextCursor };
}
