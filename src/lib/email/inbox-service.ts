import { desc, eq, sql } from "drizzle-orm";
import { mailMessages, mailThreads } from "@/db/schema";
import { splitAddresses } from "./recipients";

export { splitAddresses } from "./recipients";

export function buildSearchTerm(value: string | null | undefined): string | null {
  const term = value?.trim().replace(/[^\p{L}\p{N}@._+-]+/gu, " ").trim();
  return term ? term : null;
}

export async function listInboxThreads(options: { search?: string; alias?: string; archived?: boolean; limit?: number }) {
  const { getDb } = await import("@/db/client");
  const db = getDb();
  const filters = [eq(mailThreads.state, options.archived ? "archived" : "active")];
  if (options.alias) filters.push(eq(mailThreads.receivingAlias, options.alias));
  const search = buildSearchTerm(options.search);
  const rows = await db.selectDistinctOn([mailThreads.id], { id: mailThreads.id, subject: mailThreads.subject, receivingAlias: mailThreads.receivingAlias, isUnread: mailThreads.isUnread, lastMessageAt: mailThreads.lastMessageAt, sender: mailMessages.fromAddress, preview: mailMessages.textBody }).from(mailThreads).leftJoin(mailMessages, eq(mailMessages.threadId, mailThreads.id)).where(search ? sql`${filters[0]} AND ${sql.join(filters.slice(1), sql` AND `)} AND to_tsvector('simple', coalesce(${mailMessages.fromAddress}, '') || ' ' || coalesce(${mailMessages.subject}, '') || ' ' || coalesce(${mailMessages.textBody}, '') || ' ' || coalesce(${mailMessages.sanitizedHtml}, '')) @@ plainto_tsquery('simple', ${search})` : sql.join(filters, sql` AND `)).orderBy(mailThreads.id, desc(mailMessages.createdAt)).limit(Math.min(Math.max(options.limit ?? 50, 1), 100));
  return rows;
}
