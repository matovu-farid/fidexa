import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { mailMessages, mailThreads } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";
import { recordAudit } from "@/lib/email/audit";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession(request.headers);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  const threads = await db.select().from(mailThreads).where(eq(mailThreads.id, id)).limit(1);
  if (!threads[0]) return Response.json({ error: "Not found" }, { status: 404 });
  const messages = await db.select().from(mailMessages).where(eq(mailMessages.threadId, id)).orderBy(asc(mailMessages.createdAt));
  try { await recordAudit({ actorEmail: session.user.email, action: "thread.viewed", objectType: "thread", objectId: id }); } catch (error) { console.error("Failed to write thread view audit log", error); }
  return Response.json({ thread: threads[0], messages });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession(request.headers);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  let body: { action?: "read" | "unread" | "archive" | "restore" };
  try { body = await request.json() as typeof body; } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const action = body.action;
  if (!action) return Response.json({ error: "Invalid action" }, { status: 400 });
  const db = getDb();
  await db.update(mailThreads).set(action === "archive" || action === "restore" ? { state: action === "archive" ? "archived" : "active", updatedAt: new Date() } : { isUnread: action === "unread", updatedAt: new Date() }).where(and(eq(mailThreads.id, id)));
  try { await recordAudit({ actorEmail: session.user.email, action: `thread.${action}`, objectType: "thread", objectId: id }); } catch (error) { console.error("Failed to write thread audit log", error); }
  return Response.json({ ok: true, actor: session.user.email });
}
