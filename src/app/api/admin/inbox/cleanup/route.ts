import { and, eq, isNull, lt, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { mailDrafts, mailEvents, mailMessages, mailThreads } from "@/db/schema";
import { getServerConfig } from "@/lib/config";
import { recordAudit } from "@/lib/email/audit";
import { canAdvanceMessageStatus, mapResendEventStatus } from "@/lib/email/resend-events";

export async function POST(request: Request) {
  const config = getServerConfig();
  if (request.headers.get("authorization") !== `Bearer ${config.cleanupSecret}`) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const now = new Date();
  const db = getDb();
  const reconciledResendEvents = await db.transaction(async (tx) => {
    const pendingEvents = await tx.select({ id: mailEvents.id, eventType: mailEvents.eventType, providerMessageId: mailEvents.providerMessageId }).from(mailEvents).where(and(eq(mailEvents.source, "resend"), isNull(mailEvents.processedAt))).limit(500);
    let processed = 0;
    for (const event of pendingEvents) {
      const status = event.eventType ? mapResendEventStatus(event.eventType) : null;
      if (!status || !event.providerMessageId) continue;
      const current = await tx.select({ status: mailMessages.status }).from(mailMessages).where(eq(mailMessages.providerMessageId, event.providerMessageId)).for("update").limit(1);
      if (!current[0]) continue;
      if (canAdvanceMessageStatus(current[0].status === "received" ? "pending" : current[0].status, status)) await tx.update(mailMessages).set({ status, updatedAt: now, sentAt: status === "sent" ? now : undefined }).where(eq(mailMessages.providerMessageId, event.providerMessageId));
      await tx.update(mailEvents).set({ processedAt: now, updatedAt: now }).where(eq(mailEvents.id, event.id));
      processed += 1;
    }
    return processed;
  });
  const drafts = await db.delete(mailDrafts).where(lt(mailDrafts.expiresAt, now)).returning({ id: mailDrafts.id });
  const messages = await db.delete(mailMessages).where(lt(mailMessages.contentExpiresAt, now)).returning({ id: mailMessages.id });
  const threads = await db.delete(mailThreads).where(sql`NOT EXISTS (SELECT 1 FROM mail_messages WHERE mail_messages.thread_id = mail_threads.id)`).returning({ id: mailThreads.id });
  try { await recordAudit({ actorEmail: "email-gateway@fidexa.org", action: "retention.cleanup", objectType: "retention", objectId: "scheduled", metadata: { drafts: drafts.length, messages: messages.length, threads: threads.length, resendEvents: reconciledResendEvents } }); } catch (error) { console.error("Failed to write cleanup audit log", error); }
  return Response.json({ ok: true, reconciledResendEvents, deleted: { drafts: drafts.length, messages: messages.length, threads: threads.length } });
}
