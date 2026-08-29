import { getDb } from "@/db/client";
import { mailAuditLogs } from "@/db/schema";

export async function recordAudit(input: {
  actorEmail: string;
  action: string;
  objectType: string;
  objectId: string;
  metadata?: Record<string, string | number | boolean | null>;
}) {
  await getDb().insert(mailAuditLogs).values({
    actorEmail: input.actorEmail,
    action: input.action,
    objectType: input.objectType,
    objectId: input.objectId,
    metadata: input.metadata ?? {},
  });
}
