export type InboxMessageStatus = "pending" | "sent" | "delivered" | "delayed" | "bounced" | "failed" | "suppressed" | "complained";

const eventStatus: Record<string, InboxMessageStatus> = {
  "email.sent": "sent",
  "email.delivered": "delivered",
  "email.delivery_delayed": "delayed",
  "email.bounced": "bounced",
  "email.failed": "failed",
  "email.suppressed": "suppressed",
  "email.complained": "complained",
};

const rank: Record<InboxMessageStatus, number> = {
  pending: 0,
  sent: 1,
  delayed: 2,
  delivered: 3,
  bounced: 3,
  failed: 3,
  suppressed: 3,
  complained: 3,
};

export function mapResendEventStatus(eventType: string): InboxMessageStatus | null {
  return eventStatus[eventType] ?? null;
}

export function canAdvanceMessageStatus(current: InboxMessageStatus, next: InboxMessageStatus): boolean {
  if (current === next) return true;
  if (current === "delivered" || current === "bounced" || current === "failed" || current === "suppressed" || current === "complained") return false;
  return rank[next] >= rank[current];
}
