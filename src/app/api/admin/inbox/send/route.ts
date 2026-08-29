import { eq } from "drizzle-orm";
import { z } from "zod";
import { Resend } from "resend";
import { getDb } from "@/db/client";
import { mailDrafts, mailMessages, mailThreads } from "@/db/schema";
import { getServerConfig } from "@/lib/config";
import { getAdminSession } from "@/lib/auth";
import { prepareOutboundMessage } from "@/lib/email/outbound-service";
import { sanitizeEmailHtml } from "@/lib/email/sanitize";
import { recordAudit } from "@/lib/email/audit";

const schema = z.object({ draftId: z.string().uuid().nullable().optional(), threadId: z.string().uuid().nullable().optional(), fromAddress: z.string().email(), to: z.string().min(1), cc: z.string().optional(), bcc: z.string().optional(), subject: z.string().max(998), textBody: z.string().max(2_000_000), htmlBody: z.string().max(5_000_000).optional(), inReplyTo: z.string().max(998).nullable().optional(), references: z.string().max(8000).nullable().optional() });

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
  if (parsed.data.threadId) {
    const existing = await db.select({ id: mailThreads.id, receivingAlias: mailThreads.receivingAlias }).from(mailThreads).where(eq(mailThreads.id, parsed.data.threadId)).limit(1);
    if (!existing[0]) return Response.json({ error: "Thread not found" }, { status: 404 });
    if (existing[0].receivingAlias !== prepared.fromAddress) return Response.json({ error: "Sender does not match thread alias" }, { status: 400 });
  }
  const thread = parsed.data.threadId ? [{ id: parsed.data.threadId }] : await db.insert(mailThreads).values({ subject: prepared.subject, normalizedSubject: prepared.normalizedSubject, receivingAlias: prepared.fromAddress, lastMessageAt: new Date(), isUnread: false }).returning({ id: mailThreads.id });
  const idempotencyKey = crypto.randomUUID();
  const pending = await db.insert(mailMessages).values({ threadId: thread[0].id, direction: "outbound", status: "pending", idempotencyKey, fromAddress: prepared.fromAddress, toAddresses: prepared.toAddresses, ccAddresses: prepared.ccAddresses, bccAddresses: prepared.bccAddresses, subject: prepared.subject, textBody: prepared.textBody, sanitizedHtml: sanitizeEmailHtml(parsed.data.htmlBody ?? ""), inReplyTo: parsed.data.inReplyTo, references: parsed.data.references, contentExpiresAt, sentAt: null }).returning({ id: mailMessages.id });
  const resend = new Resend(config.resendApiKey);
  let sent;
  try { sent = await resend.emails.send({ from: prepared.fromAddress, to: prepared.toAddresses, cc: prepared.ccAddresses, bcc: prepared.bccAddresses, subject: prepared.subject, text: prepared.textBody, html: prepared.htmlBody, headers: prepared.headers }, { idempotencyKey }); } catch {
    await db.update(mailMessages).set({ status: "failed", updatedAt: new Date() }).where(eq(mailMessages.id, pending[0].id));
    return Response.json({ error: "Delivery provider could not be reached", messageId: pending[0].id }, { status: 502 });
  }
  if (sent.error || !sent.data?.id) {
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
