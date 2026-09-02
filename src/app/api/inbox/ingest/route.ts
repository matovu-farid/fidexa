import { and, desc, eq, like, or } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db/client";
import { mailAttachments, mailContacts, mailMessages, mailThreads } from "@/db/schema";
import { getServerConfig } from "@/lib/config";
import { threadLookupCandidates } from "@/lib/email/headers";
import { buildInboundRecord } from "@/lib/email/inbound-service";
import { sanitizeEmailHtml } from "@/lib/email/sanitize";
import { verifyPayloadSignature } from "@/lib/email/signatures";
import { isInboundAlias } from "@/lib/email/addresses";
import { recordAudit } from "@/lib/email/audit";
import { boundReceivedAt } from "@/lib/email/received-at";

const attachmentSchema = z.object({
  id: z.string().uuid(), filename: z.string().min(1).max(255), mimeType: z.string().min(1).max(255),
  sizeBytes: z.number().int().nonnegative().max(10 * 1024 * 1024), storageKey: z.string().regex(/^attachments\/[0-9]{4}-[0-9]{2}-[0-9]{2}\/[a-f0-9-]+$/), checksum: z.string().min(1),
});
const inboundSchema = z.object({
  idempotencyKey: z.string().uuid(), messageId: z.string().max(998).nullable().optional(), inReplyTo: z.string().max(998).nullable().optional(), references: z.string().max(8000).nullable().optional(),
  fromAddress: z.string().email().max(320), toAddresses: z.array(z.string().email().max(320)).min(1).max(5), ccAddresses: z.array(z.string().email().max(320)).max(50).default([]),
  subject: z.string().max(998).default("(no subject)"), textBody: z.string().max(2_000_000).default(""), htmlBody: z.string().max(5_000_000).default(""), receivedAt: z.string().datetime(), rawMimeKey: z.string().regex(/^raw\/[0-9]{4}-[0-9]{2}-[0-9]{2}\/[a-f0-9-]+$/).nullable().optional(), attachments: z.array(attachmentSchema).max(20).default([]),
}).superRefine((value, context) => {
  if (value.attachments.reduce((total, attachment) => total + attachment.sizeBytes, 0) > 15 * 1024 * 1024) context.addIssue({ code: z.ZodIssueCode.too_big, maximum: 15 * 1024 * 1024, origin: "array", inclusive: true, path: ["attachments"], message: "Attachments exceed the aggregate size limit" });
});

class DuplicateInboundMessageError extends Error {}

export async function POST(request: Request) {
  const config = getServerConfig();
  const body = await request.text();
  const valid = await verifyPayloadSignature({ body, timestamp: request.headers.get("x-inbox-timestamp") ?? "", signature: request.headers.get("x-inbox-signature") ?? "", secret: config.inboxIngestSecret });
  if (!valid) return Response.json({ error: "Invalid signature" }, { status: 401 });
  let json: unknown;
  try { json = JSON.parse(body); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = inboundSchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: "Invalid inbound message" }, { status: 400 });
  const input = parsed.data;
  const receivingAlias = input.toAddresses.find(isInboundAlias);
  if (!receivingAlias) return Response.json({ error: "Recipient is not configured" }, { status: 400 });

  const db = getDb();
  const duplicate = await db.select({ id: mailMessages.id }).from(mailMessages).where(or(eq(mailMessages.idempotencyKey, input.idempotencyKey), input.messageId ? eq(mailMessages.rfcMessageId, input.messageId) : undefined)).limit(1);
  if (duplicate.length > 0) return Response.json({ ok: true, duplicate: true }, { status: 200 });

  const receivedAt = boundReceivedAt(new Date(input.receivedAt), new Date());
  const record = buildInboundRecord({ ...input, fromAddress: input.fromAddress.toLowerCase(), sanitizedHtml: sanitizeEmailHtml(input.htmlBody), receivedAt, rawMimeExpiresAt: null, attachments: input.attachments.map((attachment) => ({ ...attachment, expiresAt: new Date(receivedAt.getTime() + 365 * 24 * 60 * 60 * 1000) })) });
  const lookup = threadLookupCandidates({ messageId: input.messageId, inReplyTo: input.inReplyTo, references: input.references, subject: input.subject });
  const reference = lookup.messageReferences[0];
  const referencePrior = reference
    ? await db.select({ threadId: mailMessages.threadId }).from(mailMessages).innerJoin(mailThreads, eq(mailMessages.threadId, mailThreads.id)).where(and(eq(mailThreads.receivingAlias, receivingAlias), or(eq(mailMessages.rfcMessageId, reference), like(mailMessages.references, `%${reference}%`)))).orderBy(desc(mailMessages.createdAt)).limit(1)
    : [];
  const prior = referencePrior.length > 0
    ? referencePrior
    : await db.select({ threadId: mailThreads.id }).from(mailThreads).where(and(eq(mailThreads.receivingAlias, receivingAlias), eq(mailThreads.normalizedSubject, lookup.normalizedSubject), eq(mailThreads.state, "active"))).orderBy(desc(mailThreads.lastMessageAt)).limit(1);

  let result: { threadId: string; messageId: string };
  try {
    result = await db.transaction(async (tx) => {
    const contacts = await tx.insert(mailContacts).values({ email: record.fromAddress, displayName: input.fromAddress }).onConflictDoUpdate({ target: mailContacts.email, set: { displayName: input.fromAddress, updatedAt: new Date() } }).returning({ id: mailContacts.id });
    const thread = prior[0]?.threadId ? [{ id: prior[0].threadId }] : await tx.insert(mailThreads).values({ subject: input.subject, normalizedSubject: lookup.normalizedSubject, receivingAlias, contactId: contacts[0]?.id, lastMessageAt: record.receivedAt }).returning({ id: mailThreads.id });
    const messages = await tx.insert(mailMessages).values({ threadId: thread[0].id, attachmentIds: record.attachments.map((attachment) => attachment.id), direction: record.direction, status: record.status, rfcMessageId: record.messageId, idempotencyKey: record.idempotencyKey, inReplyTo: record.inReplyTo, references: record.references, fromAddress: record.fromAddress, fromName: input.fromAddress, toAddresses: record.toAddresses, ccAddresses: record.ccAddresses, subject: record.subject, textBody: record.textBody, sanitizedHtml: record.sanitizedHtml, rawMimeKey: record.rawMimeKey, rawMimeExpiresAt: record.rawMimeExpiresAt, contentExpiresAt: record.contentExpiresAt, receivedAt: record.receivedAt }).onConflictDoNothing().returning({ id: mailMessages.id });
    if (messages.length === 0) throw new DuplicateInboundMessageError("Message already exists");
    if (record.attachments.length > 0) await tx.insert(mailAttachments).values(record.attachments.map((attachment) => ({ messageId: messages[0].id, storageKey: attachment.storageKey, filename: attachment.filename, mimeType: attachment.mimeType, sizeBytes: attachment.sizeBytes, checksum: attachment.checksum, expiresAt: attachment.expiresAt })));
    await tx.update(mailThreads).set({ lastMessageAt: record.receivedAt, isUnread: true, updatedAt: new Date() }).where(eq(mailThreads.id, thread[0].id));
    return { threadId: thread[0].id, messageId: messages[0].id };
    });
  } catch (error) {
    if (error instanceof DuplicateInboundMessageError) return Response.json({ ok: true, duplicate: true }, { status: 200 });
    throw error;
  }
  try {
    await recordAudit({ actorEmail: "email-gateway@fidexa.org", action: "message.ingested", objectType: "message", objectId: result.messageId, metadata: { threadId: result.threadId, receivingAlias } });
  } catch (error) {
    console.error("Failed to write inbound audit log", error);
  }
  return Response.json({ ok: true, ...result }, { status: 202 });
}
