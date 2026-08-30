export type OutboundMessageForComparison = {
  fromAddress: string;
  toAddresses: string[];
  ccAddresses: string[];
  bccAddresses: string[];
  subject: string;
  textBody: string;
  sanitizedHtml: string;
  inReplyTo?: string | null;
  references?: string | null;
  threadId?: string | null;
  draftId?: string | null;
  attachmentIds?: string[];
};

export const RESEND_IDEMPOTENCY_WINDOW_MS = 24 * 60 * 60 * 1000;

export function isSameOutboundMessage(expected: OutboundMessageForComparison, actual: OutboundMessageForComparison): boolean {
  return expected.fromAddress === actual.fromAddress
    && JSON.stringify(expected.toAddresses) === JSON.stringify(actual.toAddresses)
    && JSON.stringify(expected.ccAddresses) === JSON.stringify(actual.ccAddresses)
    && JSON.stringify(expected.bccAddresses) === JSON.stringify(actual.bccAddresses)
    && expected.subject === actual.subject
    && expected.textBody === actual.textBody
    && expected.sanitizedHtml === actual.sanitizedHtml
    && (expected.inReplyTo ?? null) === (actual.inReplyTo ?? null)
    && (expected.references ?? null) === (actual.references ?? null)
    && (expected.threadId ?? null) === (actual.threadId ?? null)
    && (expected.draftId ?? null) === (actual.draftId ?? null)
    && JSON.stringify(expected.attachmentIds ?? []) === JSON.stringify(actual.attachmentIds ?? []);
}

export function isIdempotencyWindowExpired(createdAt: Date, now: Date): boolean {
  return now.getTime() - createdAt.getTime() >= RESEND_IDEMPOTENCY_WINDOW_MS;
}

export function isResendConcurrencyConflict(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { name?: unknown; code?: unknown; message?: unknown };
  return [candidate.name, candidate.code, candidate.message].some((value) => typeof value === "string" && value.includes("concurrent_idempotent_requests"));
}
