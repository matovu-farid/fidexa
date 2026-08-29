import { lt, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { mailDrafts, mailMessages, mailThreads } from "@/db/schema";
import { getServerConfig } from "@/lib/config";
import { recordAudit } from "@/lib/email/audit";

export async function POST(request: Request) {
  const config = getServerConfig();
  if (request.headers.get("authorization") !== `Bearer ${config.cleanupSecret}`) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const now = new Date();
  const db = getDb();
  const drafts = await db.delete(mailDrafts).where(lt(mailDrafts.expiresAt, now)).returning({ id: mailDrafts.id });
  const messages = await db.delete(mailMessages).where(lt(mailMessages.contentExpiresAt, now)).returning({ id: mailMessages.id });
  const threads = await db.delete(mailThreads).where(sql`NOT EXISTS (SELECT 1 FROM mail_messages WHERE mail_messages.thread_id = mail_threads.id)`).returning({ id: mailThreads.id });
  try { await recordAudit({ actorEmail: "email-gateway@fidexa.org", action: "retention.cleanup", objectType: "retention", objectId: "scheduled", metadata: { drafts: drafts.length, messages: messages.length, threads: threads.length } }); } catch (error) { console.error("Failed to write cleanup audit log", error); }
  return Response.json({ ok: true, deleted: { drafts: drafts.length, messages: messages.length, threads: threads.length } });
}
