import { z } from "zod";
import { requireSecret } from "./env";

const eventSchema = z.object({
  type: z.enum(["email.sent", "email.delivered", "email.bounced", "email.complained", "email.failed"]),
  created_at: z.string().optional(),
  data: z.object({
    email_id: z.string().min(1),
    to: z.array(z.string().email()).optional(),
    subject: z.string().optional(),
    reason: z.string().optional(),
  }).passthrough(),
}).passthrough();

export type ResendMessageStatus = "pending" | "sent" | "delivered" | "bounced" | "complained" | "failed";

function resendStatus(type: z.infer<typeof eventSchema>["type"]): ResendMessageStatus {
  return type === "email.delivered" ? "delivered" : type === "email.bounced" ? "bounced" : type === "email.complained" ? "complained" : type === "email.failed" ? "failed" : "sent";
}

export function nextResendStatus(current: ResendMessageStatus, incoming: ResendMessageStatus): ResendMessageStatus {
  if (current === "bounced" || current === "complained") return current;
  if (current === "delivered" && (incoming === "sent" || incoming === "failed")) return current;
  if (current === "failed" && incoming === "sent") return current;
  return incoming;
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function verifySvix(secret: string, payload: string, headers: Headers): Promise<boolean> {
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signatureHeader = headers.get("svix-signature");
  const timestampNumber = Number(timestamp);
  if (!id || !timestamp || !signatureHeader || !Number.isInteger(timestampNumber) || Math.abs(Date.now() / 1000 - timestampNumber) > 300) return false;
  const encodedSecret = secret.replace(/^whsec_/, "");
  let secretBytes: Uint8Array;
  try { secretBytes = base64ToBytes(encodedSecret); } catch { return false; }
  const key = await crypto.subtle.importKey("raw", secretBytes.buffer as ArrayBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const signed = new TextEncoder().encode(`${id}.${timestamp}.${payload}`);
  const candidates = signatureHeader.split(" ").map((value) => value.split(",")).filter(([version, signature]) => version === "v1" && Boolean(signature));
  for (const [, encodedSignature] of candidates) {
    try {
      if (await crypto.subtle.verify("HMAC", key, base64ToBytes(encodedSignature as string).buffer as ArrayBuffer, signed)) return true;
    } catch { /* ignore malformed candidate and reject if none verify */ }
  }
  return false;
}

export async function verifyAndParseResendWebhook(payload: string, headers: Headers, secret: string): Promise<z.infer<typeof eventSchema>> {
  if (!await verifySvix(requireSecret(secret, "RESEND_WEBHOOK_SECRET"), payload, headers)) throw new Error("Invalid Resend webhook signature");
  return eventSchema.parse(JSON.parse(payload));
}

export async function recordResendEvent(db: D1Database, event: z.infer<typeof eventSchema>, payload: string, now: string, providerEventId: string): Promise<{ duplicate: boolean; suppressedEmail?: string }> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
  const payloadHash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  const message = await db.prepare("SELECT id FROM messages WHERE provider_message_id = ? LIMIT 1").bind(event.data.email_id).first<{ id: string }>();
  const status = resendStatus(event.type);
  const result = await db.prepare(`INSERT OR IGNORE INTO message_events (id, schema_version, message_id, provider_event_id, event_type, payload_hash, payload_json, created_at) VALUES (?, 1, ?, ?, ?, ?, ?, ?)`).bind(crypto.randomUUID(), message?.id ?? null, providerEventId, event.type, payloadHash, payload, now).run();
  if (result.meta?.changes === 0) {
    const stored = await db.prepare("SELECT message_id, event_type, payload_json FROM message_events WHERE provider_event_id = ? LIMIT 1")
      .bind(providerEventId).first<{ message_id: string | null; event_type: string; payload_json: string }>();
    if (!stored || stored.payload_json.length > 131_072) throw new Error("Stored provider event is unavailable or exceeds the reconciliation limit");
    let original: z.infer<typeof eventSchema>;
    try {
      original = eventSchema.parse(JSON.parse(stored.payload_json));
    } catch {
      throw new Error("Stored provider event payload is invalid");
    }
    if (stored.event_type !== original.type || original.type !== event.type || original.data.email_id !== event.data.email_id) {
      throw new Error("Provider event ID conflicts with the stored event identity");
    }
    const originalMessage = await db.prepare("SELECT id FROM messages WHERE provider_message_id = ? LIMIT 1")
      .bind(original.data.email_id).first<{ id: string }>();
    if (originalMessage?.id) {
      const originalStatus = resendStatus(original.type);
      await db.prepare("UPDATE message_events SET message_id = COALESCE(message_id, ?) WHERE provider_event_id = ?").bind(originalMessage.id, providerEventId).run();
      await db.prepare("UPDATE messages SET status = CASE WHEN status IN ('bounced', 'complained') THEN status WHEN status = 'delivered' AND ? IN ('sent', 'failed') THEN status WHEN status = 'failed' AND ? = 'sent' THEN status ELSE ? END, updated_at = ? WHERE id = ?").bind(originalStatus, originalStatus, originalStatus, now, originalMessage.id).run();
    }
    return { duplicate: true };
  }
  await db.prepare("UPDATE messages SET status = CASE WHEN status IN ('bounced', 'complained') THEN status WHEN status = 'delivered' AND ? IN ('sent', 'failed') THEN status WHEN status = 'failed' AND ? = 'sent' THEN status ELSE ? END, updated_at = ? WHERE provider_message_id = ?").bind(status, status, status, now, event.data.email_id).run();
  let suppressedEmail: string | undefined;
  if (event.type === "email.bounced" || event.type === "email.complained") {
    suppressedEmail = event.data.to?.[0]?.trim().toLowerCase();
    if (suppressedEmail) await db.prepare("INSERT OR IGNORE INTO suppressions (id, normalized_email, reason, source, created_at) VALUES (?, ?, ?, 'resend', ?)").bind(crypto.randomUUID(), suppressedEmail, event.type, now).run();
  }
  return { duplicate: false, suppressedEmail };
}
