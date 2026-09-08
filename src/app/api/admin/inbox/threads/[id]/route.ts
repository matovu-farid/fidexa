import { and, asc, eq, inArray, or } from "drizzle-orm";
import { getDb } from "@/db/client";
import { mailAttachments, mailMessages, mailThreads } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";
import { recordAudit } from "@/lib/email/audit";
import { parseThreadAction } from "@/lib/email/thread-actions";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession(request.headers);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  const threads = await db.select().from(mailThreads).where(eq(mailThreads.id, id)).limit(1);
  if (!threads[0]) return Response.json({ error: "Not found" }, { status: 404 });
  const messages = await db.select().from(mailMessages).where(eq(mailMessages.threadId, id)).orderBy(asc(mailMessages.createdAt));
  const messageIds = messages.map((message) => message.id);
  const attachmentIds = messages.flatMap((message) => message.attachmentIds);
  const attachments = messageIds.length > 0 ? await db.select().from(mailAttachments).where(attachmentIds.length > 0 ? or(inArray(mailAttachments.messageId, messageIds), inArray(mailAttachments.id, attachmentIds)) : inArray(mailAttachments.messageId, messageIds)) : [];
  const attachmentsById = new Map(attachments.map((attachment) => [attachment.id, attachment]));
  const attachmentsByMessage = new Map<string, typeof attachments>();
  for (const attachment of attachments) {
    const current = attachmentsByMessage.get(attachment.messageId) ?? [];
    current.push(attachment);
    attachmentsByMessage.set(attachment.messageId, current);
  }
  const messagesWithAttachments = messages.map((message) => ({ ...message, attachments: message.attachmentIds.length > 0 ? message.attachmentIds.map((attachmentId) => attachmentsById.get(attachmentId)).filter((attachment): attachment is (typeof attachments)[number] => Boolean(attachment)) : attachmentsByMessage.get(message.id) ?? [] }));
  try { await recordAudit({ actorEmail: session.user.email, action: "thread.viewed", objectType: "thread", objectId: id }); } catch (error) { console.error("Failed to write thread view audit log", error); }
  return Response.json({ thread: threads[0], messages: messagesWithAttachments });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession(request.headers);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const action = parseThreadAction(body);
  if (!action) return Response.json({ error: "Invalid action" }, { status: 400 });
  const db = getDb();
  await db.update(mailThreads).set(action === "archive" || action === "restore" ? { state: action === "archive" ? "archived" : "active", updatedAt: new Date() } : { isUnread: action === "unread", updatedAt: new Date() }).where(and(eq(mailThreads.id, id)));
  try { await recordAudit({ actorEmail: session.user.email, action: `thread.${action}`, objectType: "thread", objectId: id }); } catch (error) { console.error("Failed to write thread audit log", error); }
  return Response.json({ ok: true, actor: session.user.email });
}
