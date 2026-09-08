import { getAdminSession } from "@/lib/auth";
import { listInboxThreads } from "@/lib/email/inbox-service";

export async function GET(request: Request) {
  if (!await getAdminSession(request.headers)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const threads = await listInboxThreads({ search: url.searchParams.get("search") ?? undefined, alias: url.searchParams.get("alias") ?? undefined, archived: url.searchParams.get("archived") === "true" });
  return Response.json({ threads });
}
