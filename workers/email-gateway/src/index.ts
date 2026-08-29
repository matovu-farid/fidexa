import { parseInboundMime } from "./mime";

const ALIASES = new Set([
  "hello@fidexa.org",
  "sales@fidexa.org",
  "support@fidexa.org",
  "info@fidexa.org",
  "faridmatovu@fidexa.org",
]);
const MAX_RAW_BYTES = 15 * 1024 * 1024;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const EXECUTABLE_TYPES = new Set([
  "application/x-msdownload", "application/x-msdos-program", "application/x-executable",
  "application/x-sh", "application/x-bat", "application/vnd.microsoft.portable-executable",
]);
const encoder = new TextEncoder();

export type GatewayEnv = {
  INBOX_BUCKET: R2Bucket;
  FIDEXA_APP_URL: string;
  GMAIL_FORWARD_TO: string;
  INBOX_INGEST_SECRET: string;
  INBOX_ATTACHMENT_SECRET: string;
  CLEANUP_SECRET?: string;
};

function base64Url(bytes: ArrayBuffer): string {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hmac(body: string, secret: string, timestamp: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${body}`));
  return `v1=${base64Url(signature)}`;
}

async function verifyAttachmentToken(token: string, secret: string): Promise<{ storageKey: string; filename: string; expiresAt: number } | null> {
  const [payload, received] = token.split("."); if (!payload || !received) return null;
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(payload.length / 4) * 4, "=");
  let body: string; try { body = atob(normalized); } catch { return null; }
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const sig = received.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(received.length / 4) * 4, "=");
  let bytes: Uint8Array; try { bytes = Uint8Array.from(atob(sig), (char) => char.charCodeAt(0)); } catch { return null; }
  const signatureBuffer = new ArrayBuffer(bytes.byteLength); new Uint8Array(signatureBuffer).set(bytes);
  if (!await crypto.subtle.verify("HMAC", key, signatureBuffer, encoder.encode(payload))) return null;
  try { const parsed = JSON.parse(body) as { storageKey?: string; filename?: string; expiresAt?: number }; if (!parsed.storageKey?.startsWith("attachments/") || !parsed.filename || !parsed.expiresAt || parsed.expiresAt <= Date.now()) return null; return parsed as { storageKey: string; filename: string; expiresAt: number }; } catch { return null; }
}

async function checksum(value: ArrayBuffer): Promise<string> {
  return base64Url(await crypto.subtle.digest("SHA-256", value));
}

export function isAllowedRecipient(address: string): boolean {
  return ALIASES.has(address.trim().toLowerCase());
}

export async function createSignedRequest(body: string, secret: string, timestamp = Math.floor(Date.now() / 1000)): Promise<Request> {
  return new Request("https://fidexa.invalid/api/inbox/ingest", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-inbox-timestamp": String(timestamp),
      "x-inbox-signature": await hmac(body, secret, timestamp),
    },
    body,
  });
}

function storageKey(kind: "raw" | "attachments", id: string): string {
  return `${kind}/${new Date().toISOString().slice(0, 10)}/${id}`;
}

type IngestFetcher = (url: string, init: { method: "POST"; headers: HeadersInit; body: string }) => Promise<Response>;

async function postWithRetry(url: string, body: string, headers: HeadersInit, fetcher: IngestFetcher): Promise<Response> {
  let lastResponse: Response | undefined;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    lastResponse = await fetcher(url, { method: "POST", headers, body });
    if (!([429, 500, 502, 503, 504] as number[]).includes(lastResponse.status)) return lastResponse;
    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 50 * 2 ** attempt));
  }
  return lastResponse!;
}

export async function handleInboundEmail(
  message: ForwardableEmailMessage,
  env: GatewayEnv,
  ctx: ExecutionContext,
  fetcher: IngestFetcher = fetch,
): Promise<void> {
  const recipient = message.to.trim().toLowerCase();
  if (!isAllowedRecipient(recipient)) {
    message.setReject("Recipient is not configured");
    return;
  }
  if (message.rawSize > MAX_RAW_BYTES) {
    message.setReject("Message is too large");
    return;
  }

  const forwardPromise = message.forward(env.GMAIL_FORWARD_TO);
  const raw = new Uint8Array(await new Response(message.raw as BodyInit).arrayBuffer());
  const rawId = crypto.randomUUID();
  const rawKey = storageKey("raw", rawId);
  const parsed = await parseInboundMime(raw);
  const attachments = [];
  for (const attachment of parsed.attachments) {
    if (attachment.sizeBytes > MAX_ATTACHMENT_BYTES || EXECUTABLE_TYPES.has(attachment.mimeType.toLowerCase())) continue;
    const id = crypto.randomUUID();
    const key = storageKey("attachments", id);
    await env.INBOX_BUCKET.put(key, attachment.content, { httpMetadata: { contentType: attachment.mimeType }, customMetadata: { filename: attachment.filename } });
    attachments.push({ id, filename: attachment.filename, mimeType: attachment.mimeType, sizeBytes: attachment.sizeBytes, storageKey: key, checksum: await checksum(attachment.content) });
  }
  await env.INBOX_BUCKET.put(rawKey, raw, { httpMetadata: { contentType: "message/rfc822" } });
  const body = JSON.stringify({
    idempotencyKey: rawId,
    messageId: parsed.messageId,
    inReplyTo: parsed.inReplyTo,
    references: parsed.references,
    fromAddress: message.from,
    toAddresses: [recipient],
    ccAddresses: parsed.cc,
    subject: parsed.subject,
    textBody: parsed.text,
    htmlBody: parsed.html,
    receivedAt: parsed.receivedAt,
    rawMimeKey: rawKey,
    attachments,
  });
  const signed = await createSignedRequest(body, env.INBOX_INGEST_SECRET);
  const ingestPromise = postWithRetry(
    `${env.FIDEXA_APP_URL.replace(/\/$/, "")}/api/inbox/ingest`,
    body,
    signed.headers,
    fetcher,
  );
  const [forwardResult, ingestResult] = await Promise.allSettled([forwardPromise, ingestPromise]);
  if (forwardResult.status === "rejected") console.error(JSON.stringify({ event: "gmail_forward_failed", recipient, error: String(forwardResult.reason) }));
  if (ingestResult.status === "rejected") console.error(JSON.stringify({ event: "fidexa_ingest_failed", recipient, error: String(ingestResult.reason) }));
  if (ingestResult.status === "fulfilled" && !ingestResult.value.ok) console.error(JSON.stringify({ event: "fidexa_ingest_rejected", status: ingestResult.value.status, recipient }));
}

export default {
  async fetch(request: Request, env: GatewayEnv): Promise<Response> {
    const url = new URL(request.url);
    if (request.method !== "GET" || !url.pathname.startsWith("/attachments/")) return new Response("Not found", { status: 404 });
    const token = url.searchParams.get("token"); if (!token) return new Response("Not found", { status: 404 });
    const attachment = await verifyAttachmentToken(token, env.INBOX_ATTACHMENT_SECRET); if (!attachment) return new Response("Not found", { status: 404 });
    const object = await env.INBOX_BUCKET.get(attachment.storageKey); if (!object) return new Response("Not found", { status: 404 });
    return new Response(object.body, { headers: { "content-type": object.httpMetadata?.contentType ?? "application/octet-stream", "content-disposition": `attachment; filename="${attachment.filename.replace(/["\r\n]/g, "_")}"`, "cache-control": "private, no-store" } });
  },
  async email(message: ForwardableEmailMessage, env: GatewayEnv, ctx: ExecutionContext): Promise<void> {
    await handleInboundEmail(message, env, ctx);
  },
  async scheduled(_controller: ScheduledController, env: GatewayEnv, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil((async () => {
      const now = Date.now();
      for (const [prefix, maxAge] of [["raw/", 7], ["attachments/", 365]] as const) {
        let cursor: string | undefined;
        do {
          const listing = await env.INBOX_BUCKET.list({ prefix, limit: 1000, cursor });
          const expired = listing.objects.filter((object) => {
            const date = object.key.split("/")[1];
            const created = Date.parse(`${date}T00:00:00Z`);
            return Number.isFinite(created) && now - created >= maxAge * 24 * 60 * 60 * 1000;
          });
          if (expired.length > 0) await env.INBOX_BUCKET.delete(expired.map((object) => object.key));
          cursor = listing.truncated ? listing.cursor : undefined;
        } while (cursor);
      }
      if (!env.CLEANUP_SECRET) return;
      const request = new Request(`${env.FIDEXA_APP_URL.replace(/\/$/, "")}/api/admin/inbox/cleanup`, { method: "POST", headers: { authorization: `Bearer ${env.CLEANUP_SECRET}` } });
      const response = await fetch(request);
      if (!response.ok) console.error(JSON.stringify({ event: "fidexa_cleanup_failed", status: response.status }));
    })());
  },
} satisfies ExportedHandler<GatewayEnv>;
