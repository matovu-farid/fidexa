import { Webhook } from "svix";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { mailEvents, mailMessages } from "@/db/schema";
import { getServerConfig } from "@/lib/config";
import { canAdvanceMessageStatus, mapResendEventStatus } from "@/lib/email/resend-events";

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  const config = getServerConfig();
  const body = await request.text();
  const headers = Object.fromEntries(request.headers.entries());
  let event: { type?: string; data?: { email_id?: string } };
  try { event = new Webhook(config.resendWebhookSecret).verify(body, headers) as typeof event; } catch { return Response.json({ error: "Invalid webhook" }, { status: 400 }); }
  const status = mapResendEventStatus(event.type ?? "");
  if (!status || !event.data?.email_id) return Response.json({ ok: true, ignored: true });
  const providerEventId = request.headers.get("svix-id") ?? `${event.type}:${event.data.email_id}:${request.headers.get("svix-timestamp") ?? ""}`;
  const db = getDb();
  const inserted = await db.insert(mailEvents).values({ source: "resend", providerEventId, payloadHash: await sha256Hex(body) }).onConflictDoNothing().returning({ id: mailEvents.id });
  if (inserted.length === 0) return Response.json({ ok: true, duplicate: true });
  const current = await db.select({ status: mailMessages.status }).from(mailMessages).where(eq(mailMessages.providerMessageId, event.data.email_id)).limit(1);
  const currentStatus = current[0]?.status;
  if (currentStatus && canAdvanceMessageStatus(currentStatus === "received" ? "pending" : currentStatus, status)) await db.update(mailMessages).set({ status, updatedAt: new Date(), sentAt: status === "sent" ? new Date() : undefined }).where(eq(mailMessages.providerMessageId, event.data.email_id));
  return Response.json({ ok: true });
}
