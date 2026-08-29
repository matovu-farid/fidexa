import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { mailAttachments } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";
import { getServerConfig } from "@/lib/config";
import { createAttachmentToken } from "@/lib/email/attachment-token";
import { recordAudit } from "@/lib/email/audit";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession(request.headers);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params; const config = getServerConfig();
  const attachment = (await getDb().select().from(mailAttachments).where(eq(mailAttachments.id, id)).limit(1))[0];
  if (!attachment || attachment.expiresAt <= new Date()) return Response.json({ error: "Attachment unavailable" }, { status: 404 });
  const expiresAt = Math.min(attachment.expiresAt.getTime(), Date.now() + 10 * 60 * 1000);
  const token = await createAttachmentToken({ id: attachment.id, storageKey: attachment.storageKey, filename: attachment.filename, expiresAt }, config.inboxAttachmentSecret);
  const response = await fetch(`${config.inboxWorkerUrl.replace(/\/$/, "")}/attachments/${encodeURIComponent(attachment.id)}?token=${encodeURIComponent(token)}`);
  if (!response.ok || !response.body) return Response.json({ error: "Attachment unavailable" }, { status: 404 });
  try { await recordAudit({ actorEmail: session.user.email, action: "attachment.downloaded", objectType: "attachment", objectId: attachment.id, metadata: { filename: attachment.filename } }); } catch (error) { console.error("Failed to write attachment audit log", error); }
  return new Response(response.body, { headers: { "content-type": attachment.mimeType, "content-disposition": `attachment; filename="${attachment.filename.replace(/["\r\n]/g, "_")}"`, "cache-control": "private, no-store" } });
}
