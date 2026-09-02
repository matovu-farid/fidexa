import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { Resend } from "resend";
import { getDb } from "@/db/client";
import { mailAttachments, mailDrafts, mailMessages, mailThreads } from "@/db/schema";
import { getServerConfig } from "@/lib/config";
import { getAdminSession } from "@/lib/auth";
import { prepareOutboundMessage } from "@/lib/email/outbound-service";
import { isIdempotencyWindowExpired, isResendConcurrencyConflict, isSameOutboundMessage } from "@/lib/email/outbound-idempotency";
import { sanitizeEmailHtml } from "@/lib/email/sanitize";
import { recordAudit } from "@/lib/email/audit";
import { createAttachmentToken } from "@/lib/email/attachment-token";

const schema = z.object({ idempotencyKey: z.string().uuid().optional(), draftId: z.string().uuid().nullable().optional(), threadId: z.string().uuid().nullable().optional(), attachmentIds: z.array(z.string().uuid()).max(20).default([]), fromAddress: z.string().email(), to: z.string().min(1), cc: z.string().optional(), bcc: z.string().optional(), subject: z.string().max(998), textBody: z.string().max(2_000_000), htmlBody: z.string().max(5_000_000).optional(), inReplyTo: z.string().max(998).nullable().optional(), references: z.string().max(8000).nullable().optional() });

async function loadResendAttachments(rows: Array<{ id: string; filename: string; mimeType: string; storageKey: string; expiresAt: Date }>, config: ReturnType<typeof getServerConfig>) {
  return Promise.all(rows.map(async (attachment) => {
    const expiresAt = Math.min(attachment.expiresAt.getTime(), Date.now() + 10 * 60 * 1000);
    const token = await createAttachmentToken({ id: attachment.id, storageKey: attachment.storageKey, filename: attachment.filename, expiresAt }, config.inboxAttachmentSecret);
    const response = await fetch(`${config.inboxWorkerUrl.replace(/\/$/, "")}/attachments/${encodeURIComponent(attachment.id)}?token=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error("Attachment unavailable");
    return { filename: attachment.filename, content: Buffer.from(await response.arrayBuffer()), contentType: attachment.mimeType };
  }));
}

export async function POST(request: Request) {
  const session = await getAdminSession(request.headers);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  let payload: unknown;
  try { payload = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) return Response.json({ error: "Invalid message" }, { status: 400 });
  let prepared;
  try { prepared = prepareOutboundMessage(parsed.data); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Invalid sender or recipient" }, { status: 400 }); }
  const config = getServerConfig();
  const db = getDb();
  const contentExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  const headerKey = request.headers.get("idempotency-key");
  const idempotencyKey = parsed.data.idempotencyKey ?? (headerKey && z.string().uuid().safeParse(headerKey).success ? headerKey : undefined) ?? crypto.randomUUID();
  const sanitizedHtml = sanitizeEmailHtml(parsed.data.htmlBody ?? "");
  const requestForComparison = { fromAddress: prepared.fromAddress, toAddresses: prepared.toAddresses, ccAddresses: prepared.ccAddresses, bccAddresses: prepared.bccAddresses, subject: prepared.subject, textBody: prepared.textBody, sanitizedHtml, inReplyTo: parsed.data.inReplyTo, references: parsed.data.references, threadId: parsed.data.threadId ?? null, draftId: parsed.data.draftId ?? null, attachmentIds: parsed.data.attachmentIds };
  const findExisting = () => db.select({ id: mailMessages.id, threadId: mailMessages.threadId, draftId: mailMessages.draftId, attachmentIds: mailMessages.attachmentIds, status: mailMessages.status, providerMessageId: mailMessages.providerMessageId, createdAt: mailMessages.createdAt, fromAddress: mailMessages.fromAddress, toAddresses: mailMessages.toAddresses, ccAddresses: mailMessages.ccAddresses, bccAddresses: mailMessages.bccAddresses, subject: mailMessages.subject, textBody: mailMessages.textBody, sanitizedHtml: mailMessages.sanitizedHtml, inReplyTo: mailMessages.inReplyTo, references: mailMessages.references }).from(mailMessages).where(eq(mailMessages.idempotencyKey, idempotencyKey)).limit(1);
  let existing = (await findExisting())[0];
  if (existing) {
    const sameRequest = isSameOutboundMessage(requestForComparison, existing);
    if (!sameRequest) return Response.json({ error: "Idempotency key was already used for a different message" }, { status: 409 });
    if (isIdempotencyWindowExpired(existing.createdAt, new Date()) && !existing.providerMessageId) return Response.json({ error: "Delivery status is older than the provider retry window; create a new send request after reviewing the inbox", expired: true, messageId: existing.id }, { status: 409 });
    if (existing.providerMessageId) return Response.json({ ok: true, messageId: existing.id, providerMessageId: existing.providerMessageId, duplicate: true }, { status: 200 });
  }
  if (parsed.data.threadId) {
    const existing = await db.select({ id: mailThreads.id, receivingAlias: mailThreads.receivingAlias }).from(mailThreads).where(eq(mailThreads.id, parsed.data.threadId)).limit(1);
    if (!existing[0]) return Response.json({ error: "Thread not found" }, { status: 404 });
    if (existing[0].receivingAlias !== prepared.fromAddress) return Response.json({ error: "Sender does not match thread alias" }, { status: 400 });
  }
  const attachmentRows = parsed.data.attachmentIds.length > 0 ? await db.select({ id: mailAttachments.id, filename: mailAttachments.filename, mimeType: mailAttachments.mimeType, storageKey: mailAttachments.storageKey, sizeBytes: mailAttachments.sizeBytes, expiresAt: mailAttachments.expiresAt }).from(mailAttachments).where(inArray(mailAttachments.id, parsed.data.attachmentIds)) : [];
  if (attachmentRows.length !== parsed.data.attachmentIds.length || attachmentRows.some((attachment) => attachment.expiresAt <= new Date()) || attachmentRows.reduce((total, attachment) => total + attachment.sizeBytes, 0) > 15 * 1024 * 1024) return Response.json({ error: "Invalid or oversized attachment" }, { status: 400 });
  let thread: Array<{ id: string }>;
  let pending: Array<{ id: string }>;
  if (existing) {
    thread = [{ id: existing.threadId }];
    pending = [{ id: existing.id }];
  } else {
    const created = await db.transaction(async (tx) => {
      const newThread = parsed.data.threadId ? [{ id: parsed.data.threadId }] : await tx.insert(mailThreads).values({ subject: prepared.subject, normalizedSubject: prepared.normalizedSubject, receivingAlias: prepared.fromAddress, lastMessageAt: new Date(), isUnread: false }).returning({ id: mailThreads.id });
      const newMessage = await tx.insert(mailMessages).values({ threadId: newThread[0].id, draftId: parsed.data.draftId ?? null, attachmentIds: parsed.data.attachmentIds, direction: "outbound", status: "pending", idempotencyKey, fromAddress: prepared.fromAddress, toAddresses: prepared.toAddresses, ccAddresses: prepared.ccAddresses, bccAddresses: prepared.bccAddresses, subject: prepared.subject, textBody: prepared.textBody, sanitizedHtml, inReplyTo: parsed.data.inReplyTo, references: parsed.data.references, contentExpiresAt, sentAt: null }).onConflictDoNothing({ target: mailMessages.idempotencyKey }).returning({ id: mailMessages.id });
      if (newMessage.length === 0) throw new Error("OUTBOUND_IDEMPOTENCY_RACE");
      return { existing: undefined, thread: newThread, pending: newMessage };
    }).catch(async (error) => {
      if (!(error instanceof Error) || error.message !== "OUTBOUND_IDEMPOTENCY_RACE") throw error;
      const raced = await findExisting();
      if (!raced[0]) throw error;
      return { existing: raced[0] };
    });
    if (created.existing) {
      existing = created.existing;
      if (!isSameOutboundMessage(requestForComparison, existing)) return Response.json({ error: "Idempotency key was already used for a different message" }, { status: 409 });
      if (isIdempotencyWindowExpired(existing.createdAt, new Date()) && !existing.providerMessageId) return Response.json({ error: "Delivery status is older than the provider retry window; create a new send request after reviewing the inbox", expired: true, messageId: existing.id }, { status: 409 });
      if (existing.providerMessageId) return Response.json({ ok: true, messageId: existing.id, providerMessageId: existing.providerMessageId, duplicate: true }, { status: 200 });
      thread = [{ id: existing.threadId }];
      pending = [{ id: existing.id }];
    } else {
      thread = created.thread;
      pending = created.pending;
    }
  }
  const resend = new Resend(config.resendApiKey);
  let attachments;
  try { attachments = await loadResendAttachments(attachmentRows, config); } catch {
    await db.update(mailMessages).set({ status: "failed", updatedAt: new Date() }).where(eq(mailMessages.id, pending[0].id));
    return Response.json({ error: "Attachment could not be loaded", messageId: pending[0].id }, { status: 502 });
  }
  let sent;
  try { sent = await resend.emails.send({ from: prepared.fromAddress, to: prepared.toAddresses, cc: prepared.ccAddresses, bcc: prepared.bccAddresses, subject: prepared.subject, text: prepared.textBody, html: sanitizedHtml || undefined, headers: prepared.headers, attachments }, { idempotencyKey }); } catch (error) {
    if (isResendConcurrencyConflict(error)) return Response.json({ error: "Another delivery attempt is in progress; retry with the same idempotency key", messageId: pending[0].id }, { status: 409 });
    await db.update(mailMessages).set({ status: "failed", updatedAt: new Date() }).where(eq(mailMessages.id, pending[0].id));
    return Response.json({ error: "Delivery provider could not be reached", messageId: pending[0].id }, { status: 502 });
  }
  if (sent.error || !sent.data?.id) {
    if (isResendConcurrencyConflict(sent.error)) return Response.json({ error: "Another delivery attempt is in progress; retry with the same idempotency key", messageId: pending[0].id }, { status: 409 });
    await db.update(mailMessages).set({ status: "failed", updatedAt: new Date() }).where(eq(mailMessages.id, pending[0].id));
    return Response.json({ error: "Delivery provider rejected the message", messageId: pending[0].id }, { status: 502 });
  }
  await db.update(mailMessages).set({ status: "sent", providerMessageId: sent.data.id, sentAt: new Date(), updatedAt: new Date() }).where(eq(mailMessages.id, pending[0].id));
  await db.update(mailThreads).set({ lastMessageAt: new Date(), isUnread: false, updatedAt: new Date() }).where(eq(mailThreads.id, thread[0].id));
  try {
    await recordAudit({ actorEmail: session.user.email, action: "message.sent", objectType: "message", objectId: pending[0].id, metadata: { threadId: thread[0].id, providerMessageId: sent.data.id } });
  } catch (error) {
    console.error("Failed to write outbound audit log", error);
  }
  if (parsed.data.draftId) await db.delete(mailDrafts).where(eq(mailDrafts.id, parsed.data.draftId));
  return Response.json({ ok: true, messageId: pending[0].id, providerMessageId: sent.data.id }, { status: 202 });
}
