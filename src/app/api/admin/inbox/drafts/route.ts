import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db/client";
import { mailDrafts } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";

const draftSchema = z.object({ id: z.string().uuid().optional(), threadId: z.string().uuid().nullable().optional(), fromAddress: z.string().email(), toAddresses: z.array(z.string().email()).default([]), ccAddresses: z.array(z.string().email()).default([]), bccAddresses: z.array(z.string().email()).default([]), subject: z.string().max(998).default(""), textBody: z.string().max(2_000_000).default(""), attachmentIds: z.array(z.string().uuid()).max(20).default([]) });

export async function GET(request: Request) {
  if (!await getAdminSession(request.headers)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const threadId = url.searchParams.get("threadId");
  const drafts = await getDb().select().from(mailDrafts).where(threadId ? eq(mailDrafts.threadId, threadId) : url.searchParams.get("unthreaded") === "true" ? isNull(mailDrafts.threadId) : undefined).orderBy(desc(mailDrafts.updatedAt)).limit(20);
  return Response.json({ drafts });
}

export async function POST(request: Request) {
  if (!await getAdminSession(request.headers)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  let payload: unknown;
  try { payload = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = draftSchema.safeParse(payload);
  if (!parsed.success) return Response.json({ error: "Invalid draft" }, { status: 400 });
  const input = parsed.data;
  const values = { ...input, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), updatedAt: new Date() };
  const db = getDb();
  const draft = input.id ? await db.update(mailDrafts).set(values).where(eq(mailDrafts.id, input.id)).returning() : await db.insert(mailDrafts).values(values).returning();
  return Response.json({ draft: draft[0] }, { status: 201 });
}
