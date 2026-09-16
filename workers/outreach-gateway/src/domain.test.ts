import { describe, expect, it } from "vitest";
import { canTransition, isSendableDraft, type DraftState } from "./domain";

describe("outreach state transitions", () => {
  it("requires research and review before sending", () => {
    expect(canTransition("discovered", "researching")).toBe(true);
    expect(canTransition("researching", "researched")).toBe(true);
    expect(canTransition("discovered", "sent")).toBe(false);
    expect(canTransition("in_review", "sent")).toBe(false);
    expect(canTransition("approved", "sent")).toBe(true);
  });

  it("only considers a distinct, current approval sendable", () => {
    const approved: DraftState = {
      state: "approved",
      authorRunId: "run-author",
      reviewerRunId: "run-reviewer",
      reviewedAt: "2026-09-11T08:00:00.000Z",
      approvalMaxAgeMs: 86_400_000,
      now: "2026-09-11T12:00:00.000Z",
      recipientSuppressed: false,
      contactVerified: true,
      sendIdempotencyUsed: false,
    };

    expect(isSendableDraft(approved)).toBe(true);
    expect(isSendableDraft({ ...approved, reviewerRunId: "run-author" })).toBe(false);
    expect(isSendableDraft({ ...approved, recipientSuppressed: true })).toBe(false);
    expect(isSendableDraft({ ...approved, contactVerified: false })).toBe(false);
    expect(isSendableDraft({ ...approved, sendIdempotencyUsed: true })).toBe(false);
  });
});
