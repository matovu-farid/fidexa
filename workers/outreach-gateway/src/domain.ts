export type OutreachState =
  | "discovered"
  | "researching"
  | "researched"
  | "drafted"
  | "in_review"
  | "approved"
  | "sent"
  | "replied"
  | "paused"
  | "suppressed";

const transitions: Record<OutreachState, readonly OutreachState[]> = {
  discovered: ["researching", "paused", "suppressed"],
  researching: ["researched", "paused", "suppressed"],
  researched: ["drafted", "paused", "suppressed"],
  drafted: ["in_review", "paused", "suppressed"],
  in_review: ["approved", "drafted", "paused", "suppressed"],
  approved: ["sent", "paused", "suppressed"],
  sent: ["replied", "paused", "suppressed"],
  replied: ["paused", "suppressed"],
  paused: ["researching", "drafted", "in_review", "approved", "suppressed"],
  suppressed: [],
};

export function canTransition(from: OutreachState, to: OutreachState): boolean {
  return transitions[from].includes(to);
}

export type DraftState = {
  state: OutreachState;
  authorRunId: string;
  reviewerRunId: string | null;
  reviewedAt: string | null;
  approvalMaxAgeMs: number;
  now: string;
  recipientSuppressed: boolean;
  contactVerified: boolean;
  sendIdempotencyUsed: boolean;
};

export function isSendableDraft(input: DraftState): boolean {
  if (input.state !== "approved") return false;
  if (!input.reviewerRunId || input.reviewerRunId === input.authorRunId) return false;
  if (!input.reviewedAt || input.recipientSuppressed || !input.contactVerified || input.sendIdempotencyUsed) return false;

  const reviewedAt = Date.parse(input.reviewedAt);
  const now = Date.parse(input.now);
  return Number.isFinite(reviewedAt) && Number.isFinite(now) && now >= reviewedAt && now - reviewedAt <= input.approvalMaxAgeMs;
}
