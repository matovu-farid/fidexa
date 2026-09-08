import { desc, ilike } from "drizzle-orm";
import { getDb } from "@/db/client";
import { mailContacts } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";

export async function GET(request: Request) {
  if (!await getAdminSession(request.headers)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const search = new URL(request.url).searchParams.get("search")?.trim();
  const contacts = await getDb().select().from(mailContacts).where(search ? ilike(mailContacts.email, `%${search}%`) : undefined).orderBy(desc(mailContacts.updatedAt)).limit(100);
  return Response.json({ contacts });
}
