import { Webhook } from "svix";
import { and, eq } from "drizzle-orm";
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
  try {
    const outcome = await db.transaction(async (tx) => {
      const existingEvent = await tx.select({ id: mailEvents.id, processedAt: mailEvents.processedAt }).from(mailEvents).where(and(eq(mailEvents.source, "resend"), eq(mailEvents.providerEventId, providerEventId))).limit(1);
      if (existingEvent[0]?.processedAt) return "duplicate" as const;
      if (!existingEvent[0]) {
        await tx.insert(mailEvents).values({ source: "resend", providerEventId, eventType: event.type ?? null, providerMessageId: event.data!.email_id!, payloadHash: await sha256Hex(body) });
      } else {
        await tx.update(mailEvents).set({ eventType: event.type ?? null, providerMessageId: event.data!.email_id!, payloadHash: await sha256Hex(body), updatedAt: new Date() }).where(eq(mailEvents.id, existingEvent[0].id));
      }
      const current = await tx.select({ status: mailMessages.status }).from(mailMessages).where(eq(mailMessages.providerMessageId, event.data!.email_id!)).for("update").limit(1);
      if (!current[0]) return "deferred" as const;
      const currentStatus = current[0].status;
      if (canAdvanceMessageStatus(currentStatus === "received" ? "pending" : currentStatus, status)) await tx.update(mailMessages).set({ status, updatedAt: new Date(), sentAt: status === "sent" ? new Date() : undefined }).where(eq(mailMessages.providerMessageId, event.data!.email_id!));
      await tx.update(mailEvents).set({ processedAt: new Date(), updatedAt: new Date() }).where(eq(mailEvents.providerEventId, providerEventId));
      return "processed" as const;
    });
    if (outcome === "deferred") return Response.json({ error: "Message is not ready for this event" }, { status: 503 });
    return Response.json({ ok: true, ...(outcome === "duplicate" ? { duplicate: true } : {}) });
  } catch (error) {
    console.error("Failed to process Resend webhook", error);
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
