import { describe, expect, it } from "vitest";
import {
  deriveComparableLearningEvidence,
  idempotencyPayloadMatches,
  campaignObservationSchema,
  campaignLearningActionSchema,
  campaignLearningActionTransitionSchema,
  campaignRunInputSchema,
  canRecordCampaignEvent,
  getComparableProcessChangeEligibility,
  validateCampaignLearningActionTransition,
  summarizeCampaignOutcomes,
  summarizeCampaignOutcomeGroups,
  summarizeComparableCohorts,
  validateCampaignRunInput,
  kampalaLocalDateTimeToIso,
  sentObservationSetMatchesCheck,
  sentObservationsAreResolved,
  effectiveVerifiedSentObservationIds,
  hasVerifiedCampaignReply,
  sendResolutionMatchesAttempt,
  approvedVariantExists,
  selectedVariantsAreRegistered,
} from "./campaign-learning";

describe("campaign learning evidence", () => {
  it("rejects no-reply close-out when a verified reply is already recorded", () => {
    expect(hasVerifiedCampaignReply([
      { eventType: "reply", outcome: "verified", source: "manual_zoho_browser" },
    ])).toBe(true);
    expect(hasVerifiedCampaignReply([
      { eventType: "qualified_reply", outcome: "verified", source: "manual_zoho_browser" },
    ])).toBe(true);
    expect(hasVerifiedCampaignReply([
      { eventType: "reply", outcome: "unverified", source: "manual_zoho_browser" },
      { eventType: "reply", outcome: "verified", source: "historical_gateway" },
    ])).toBe(false);
  });

  it("requires the original attempt to contain the message ID before it can be resolved", () => {
    const base = {
      attemptVariantId: "a".repeat(64),
      attemptVisibleMessageId: "zoho-attempt-1",
      resolutionVariantId: "A".repeat(64),
      resolutionVisibleMessageId: "zoho-attempt-1",
    };
    expect(sendResolutionMatchesAttempt(base)).toBe(true);
    expect(sendResolutionMatchesAttempt({ ...base, resolutionVisibleMessageId: "different-zoho-message" })).toBe(false);
    expect(sendResolutionMatchesAttempt({ ...base, attemptVisibleMessageId: null })).toBe(false);
  });

  it("distinguishes exact idempotent retries from the same key with changed input", () => {
    expect(idempotencyPayloadMatches({ name: "Wave 1", cohort: "A", dates: ["start", "end"] }, { dates: ["start", "end"], cohort: "A", name: "Wave 1" })).toBe(true);
    expect(idempotencyPayloadMatches({ name: "Wave 1", cohort: "A" }, { name: "Wave 1 revised", cohort: "A" })).toBe(false);
  });

  it("requires an action to state its measurement window, checkpoint, decision, and source evidence", () => {
    const action = {
      campaignId: "8ca9fb11-6cc8-4ead-9236-808923cc8b85",
      hypothesis: "A focused workflow question will yield more relevant replies.",
      action: "Use one company-specific operations question in the next cohort.",
      expectedMetric: "qualified replies per delivered eligible prospect",
      supportingObservationIds: ["39a9fb11-6cc8-4ead-9236-808923cc8b85"],
      risk: "low",
      measurementWindowStartAt: "2026-10-01T00:00:00.000Z",
      measurementWindowEndAt: "2026-10-31T23:59:59.000Z",
      measurementCheckpointAt: "2026-10-31T23:59:59.000Z",
      rationale: "Three comparable review outcomes support testing this change.",
      evidenceRefs: ["docs/superpowers/specs/campaign-wave-1.md#review-outcomes"],
      decision: "Propose the reversible copy test for the next comparable cohort.",
      clientRequestId: "5ff107dd-faa6-497c-8d3a-2d75d8b15baa",
    };

    expect(campaignLearningActionSchema.safeParse(action).success).toBe(true);
    expect(campaignLearningActionSchema.safeParse({ ...action, comparableSignals: 3, relevantRecords: 12 }).success).toBe(false);
    expect(campaignLearningActionSchema.safeParse({ ...action, measurementWindowEndAt: action.measurementWindowStartAt }).success).toBe(false);
    expect(campaignLearningActionSchema.safeParse({ ...action, measurementCheckpointAt: "2026-11-01T00:00:00.000Z" }).success).toBe(false);
    expect(campaignLearningActionSchema.safeParse({ ...action, evidenceRefs: [] }).success).toBe(false);
    expect(campaignLearningActionSchema.safeParse({ ...action, rationale: "Contact person@example.org" }).success).toBe(false);
  });

  it("requires a fresh append-only decision record for action status transitions", () => {
    const transition = {
      actionId: "5ff107dd-faa6-497c-8d3a-2d75d8b15baa",
      expectedStatus: "proposed",
      status: "applied",
      rationale: "The reversible change was added to the policy for the next cohort.",
      evidenceRefs: ["docs/superpowers/specs/campaign-wave-1.md#review-outcomes"],
      decision: "Apply the low-risk change after the evidence threshold was met.",
      clientRequestId: "cc11119d-a8c4-4ce7-9aca-0755a074c71d",
      implementationReference: "docs/superpowers/specs/2026-09-30-fidexa-campaign-process-improvement-design.md#message-experiments",
    };
    expect(campaignLearningActionTransitionSchema.safeParse(transition).success).toBe(true);
    expect(campaignLearningActionTransitionSchema.safeParse({ ...transition, decision: "person@example.org" }).success).toBe(false);
    expect(campaignLearningActionTransitionSchema.safeParse({ ...transition, evidenceRefs: [] }).success).toBe(false);
  });

  it("only evaluates an applied action after its measurement checkpoint and with a measured result", () => {
    const input = {
      currentStatus: "applied" as const,
      expectedStatus: "applied" as const,
      nextStatus: "evaluated" as const,
      risk: "low" as const,
      comparableSignals: 3,
      relevantRecords: 10,
      measurementCheckpointAt: "2026-10-31T00:00:00.000Z",
      userDecisionApproved: false,
      now: "2026-10-30T00:00:00.000Z",
    };
    expect(validateCampaignLearningActionTransition(input)).toEqual({ valid: false, reason: "checkpoint_not_reached" });
    expect(validateCampaignLearningActionTransition({ ...input, now: "2026-11-01T00:00:00.000Z" })).toEqual({ valid: false, reason: "result_required" });
    expect(validateCampaignLearningActionTransition({ ...input, now: "2026-11-01T00:00:00.000Z", result: "Qualified replies increased in the comparable cohort." })).toEqual({ valid: true });
  });

  it("rejects stale action status and prevents a high-impact action from being marked applied", () => {
    const input = {
      currentStatus: "proposed" as const,
      expectedStatus: "needs_user_decision" as const,
      nextStatus: "applied" as const,
      risk: "high" as const,
      comparableSignals: 30,
      relevantRecords: 100,
      measurementCheckpointAt: "2026-10-31T00:00:00.000Z",
      userDecisionApproved: false,
      now: "2026-10-01T00:00:00.000Z",
      implementationReference: "manual-change",
    };
    expect(validateCampaignLearningActionTransition(input)).toEqual({ valid: false, reason: "stale_status" });
    expect(validateCampaignLearningActionTransition({ ...input, expectedStatus: "proposed" })).toEqual({ valid: false, reason: "high_impact_requires_user_decision" });
  });

  it("allows a high-impact action to be marked applied only after a recorded user approval", () => {
    const input = {
      currentStatus: "user_approved" as const,
      expectedStatus: "user_approved" as const,
      nextStatus: "applied" as const,
      risk: "high" as const,
      comparableSignals: 0,
      relevantRecords: 0,
      measurementCheckpointAt: "2026-10-31T00:00:00.000Z",
      implementationReference: "docs/policy.md#approved-change",
      now: "2026-10-01T00:00:00.000Z",
    };
    expect(validateCampaignLearningActionTransition({ ...input, userDecisionApproved: false })).toEqual({ valid: false, reason: "high_impact_requires_user_decision" });
    expect(validateCampaignLearningActionTransition({ ...input, userDecisionApproved: true })).toEqual({ valid: true });
    expect(validateCampaignLearningActionTransition({
      ...input,
      currentStatus: "needs_user_decision",
      expectedStatus: "needs_user_decision",
      nextStatus: "user_approved",
      userDecisionApproved: false,
    })).toEqual({ valid: true });
  });

  it("requires close-out before a due Zoho response check", () => {
    expect(canRecordCampaignEvent({ state: "planned", eventType: "response_check", dueAt: "2026-09-29T00:00:00Z", now: "2026-09-30T00:00:00Z" })).toBe(false);
    expect(canRecordCampaignEvent({ state: "closed", eventType: "response_check", dueAt: "2026-10-02T00:00:00Z", now: "2026-09-30T00:00:00Z" })).toBe(false);
    expect(canRecordCampaignEvent({ state: "closed", eventType: "response_check", dueAt: "2026-09-29T00:00:00Z", now: "2026-09-30T00:00:00Z" })).toBe(true);
    expect(canRecordCampaignEvent({ state: "retrospected", eventType: "reply", dueAt: "2026-09-29T00:00:00Z", now: "2026-09-30T00:00:00Z" })).toBe(true);
    expect(canRecordCampaignEvent({ state: "retrospected", eventType: "opt_out", dueAt: "2026-09-29T00:00:00Z", now: "2026-09-30T00:00:00Z" })).toBe(true);
    expect(canRecordCampaignEvent({ state: "retrospected", eventType: "sent", dueAt: "2026-09-29T00:00:00Z", now: "2026-09-30T00:00:00Z" })).toBe(false);
    expect(canRecordCampaignEvent({ state: "closed", eventType: "send_resolution", dueAt: "2026-09-29T00:00:00Z", now: "2026-09-30T00:00:00Z" })).toBe(true);
    expect(canRecordCampaignEvent({ state: "retrospected", eventType: "send_resolution", dueAt: "2026-09-29T00:00:00Z", now: "2026-09-30T00:00:00Z" })).toBe(false);
  });

  it("requires an explicit future response-check date before a campaign can be created", () => {
    const input = {
      clientRequestId: "9ff107dd-faa6-497c-8d3a-2d75d8b15baa",
      name: "Wave 466",
      cohort: "Uganda logistics operators",
      hypothesis: "A verified unresolved stock-to-invoice handoff will produce more qualified replies.",
      responseCheckDueAt: "2026-10-10T09:00:00.000Z",
    };
    expect(validateCampaignRunInput(input, Date.parse("2026-09-30T09:00:00.000Z")).success).toBe(true);
    expect(validateCampaignRunInput(input, Date.parse("2026-10-11T09:00:00.000Z")).success).toBe(false);
    expect(validateCampaignRunInput({ ...input, responseCheckDueAt: "" }).success).toBe(false);
  });

  it("requires a stable request identifier for idempotent campaign creation", () => {
    const input = {
      name: "Wave 467",
      cohort: "Verified regional distributors",
      hypothesis: "Current buyer-side workflow evidence will improve qualified replies.",
      responseCheckDueAt: "2026-10-10T09:00:00.000Z",
    };
    expect(campaignRunInputSchema.safeParse(input).success).toBe(false);
    expect(campaignRunInputSchema.safeParse({ ...input, clientRequestId: "5ff107dd-faa6-497c-8d3a-2d75d8b15baa" }).success).toBe(true);
  });

  it("interprets the datetime-local form as Kampala time, not the operator laptop timezone", () => {
    expect(kampalaLocalDateTimeToIso("2026-10-01T09:30")).toBe("2026-10-01T06:30:00.000Z");
    expect(kampalaLocalDateTimeToIso("invalid")).toBeNull();
  });

  it("does not apply an under-evidenced or high-impact process action", () => {
    const base = {
      currentStatus: "proposed" as const,
      expectedStatus: "proposed" as const,
      nextStatus: "applied" as const,
      risk: "low" as const,
      comparableSignals: 2,
      relevantRecords: 9,
      measurementCheckpointAt: "2026-10-31T00:00:00.000Z",
      userDecisionApproved: false,
      now: "2026-10-01T00:00:00.000Z",
      implementationReference: "docs/policy.md#targeting",
    };
    expect(validateCampaignLearningActionTransition(base)).toEqual({ valid: false, reason: "action_threshold_not_met" });
    expect(validateCampaignLearningActionTransition({ ...base, comparableSignals: 3 })).toEqual({ valid: true });
    expect(validateCampaignLearningActionTransition({ ...base, comparableSignals: 3, risk: "high" })).toEqual({ valid: false, reason: "high_impact_requires_user_decision" });
    expect(validateCampaignLearningActionTransition({ ...base, nextStatus: "evaluated", comparableSignals: 3 })).toEqual({ valid: false, reason: "invalid_status_transition" });
  });

  it("requires a prospective measurement window and an evidence-backed initial decision", () => {
    const action = {
      campaignId: "8ca9fb11-6cc8-4ead-9236-808923cc8b85",
      hypothesis: "A specific workflow framing may improve qualified replies.",
      action: "Test the workflow framing with the next comparable cohort.",
      expectedMetric: "qualified replies per delivered eligible prospect",
      supportingObservationIds: ["39a9fb11-6cc8-4ead-9236-808923cc8b85"],
      risk: "low",
      measurementWindowStartAt: "2026-10-01T00:00:00.000Z",
      measurementWindowEndAt: "2026-10-21T00:00:00.000Z",
      measurementCheckpointAt: "2026-10-21T00:00:00.000Z",
      rationale: "Three comparable waves had stronger replies when the workflow was named.",
      evidenceRefs: ["campaign-wave-411", "campaign-wave-418", "campaign-wave-422"],
      decision: "Recommend a reversible test; do not apply it automatically.",
      clientRequestId: "954d089a-0d88-4c4b-98b3-bbf052109b84",
    };

    expect(campaignLearningActionSchema.safeParse(action).success).toBe(true);
    expect(campaignLearningActionSchema.safeParse({ ...action, evidenceRefs: [] }).success).toBe(false);
    expect(campaignLearningActionSchema.safeParse({ ...action, measurementCheckpointAt: "2026-10-22T00:00:00.000Z" }).success).toBe(false);
    expect(campaignLearningActionSchema.safeParse({ ...action, clientRequestId: "not-a-uuid" }).success).toBe(false);
    expect(campaignLearningActionSchema.safeParse({ ...action, rationale: "Contact: person@example.org" }).success).toBe(false);
  });

  it("requires a checked Zoho folder before recording observed silence", () => {
    expect(campaignObservationSchema.safeParse({
      campaignId: "wave-1",
      eventType: "response_check",
      source: "manual_zoho_browser",
      outcome: "no_reply_observed",
      attribution: "unknown",
      checkedFolders: [],
    }).success).toBe(false);

    expect(campaignObservationSchema.safeParse({
      campaignId: "wave-1",
      eventType: "response_check",
      source: "manual_zoho_browser",
      outcome: "no_reply_observed",
      attribution: "unknown",
      checkedFolders: ["inbox"],
    }).success).toBe(false);

    expect(campaignObservationSchema.safeParse({
      campaignId: "wave-1",
      eventType: "response_check",
      source: "manual_zoho_browser",
      outcome: "no_reply_observed",
      attribution: "unknown",
      checkedFolders: ["inbox", "spam", "sent"],
      checkedSentObservationIds: ["2c1c9f15-9d8a-4bd9-8db9-19b7563f35c1"],
    }).success).toBe(true);
  });

  it("ties no-reply to the complete verified send set", () => {
    const sentObservationIds = ["2c1c9f15-9d8a-4bd9-8db9-19b7563f35c1", "f85b0a7d-f43d-4de2-a220-7e4a705a80d2"];
    expect(sentObservationSetMatchesCheck({ selectedIds: sentObservationIds, sentObservationIds })).toBe(true);
    expect(sentObservationSetMatchesCheck({ selectedIds: sentObservationIds.slice(0, 1), sentObservationIds })).toBe(false);
    expect(sentObservationSetMatchesCheck({ selectedIds: [], sentObservationIds: [] })).toBe(false);
  });

  it("requires every possible send attempt to be resolved before checking for no reply", () => {
    expect(sentObservationsAreResolved([{ outcome: "verified" }, { outcome: "verified" }])).toBe(true);
    expect(sentObservationsAreResolved([{ outcome: "verified" }, { outcome: "unverified" }])).toBe(false);
    expect(sentObservationsAreResolved([{ outcome: "unavailable" }])).toBe(false);
    expect(sentObservationsAreResolved([])).toBe(true);
  });

  it("requires append-only exact evidence to resolve an uncertain manual Zoho send", () => {
    const base = {
      campaignId: "wave-1",
      eventType: "send_resolution",
      source: "manual_zoho_browser",
      outcome: "verified",
      attribution: "unknown",
      quantity: 0,
      resolvesObservationId: "2c1c9f15-9d8a-4bd9-8db9-19b7563f35c1",
      checkedFolders: ["sent"],
      resolutionStatus: "verified_sent",
      visibleMessageId: "zoho-visible-message-123",
      variantId: "a".repeat(64),
      note: "Exact message is visible in Sent and matches the reviewed packet hash.",
    };
    expect(campaignObservationSchema.safeParse({ ...base, resolvesObservationId: undefined }).success).toBe(false);
    expect(campaignObservationSchema.safeParse(base).success).toBe(true);
    expect(campaignObservationSchema.safeParse({
      ...base,
      resolutionStatus: "verified_not_sent",
      checkedFolders: ["sent", "outbox", "drafts"],
      visibleMessageId: "zoho-matching-draft-123",
      note: "Matching draft remains in Drafts; no sent copy or outbox item is visible.",
    }).success).toBe(true);
    expect(campaignObservationSchema.safeParse({
      ...base,
      resolutionStatus: "verified_not_sent",
      checkedFolders: ["sent", "drafts"],
    }).success).toBe(false);
  });

  it("only clears uncertain send attempts with a linked, hash-matched resolution", () => {
    const sends = [
      { id: "send-1", outcome: "verified", campaignId: "wave-1", variantId: "a".repeat(64) },
      { id: "send-2", outcome: "unavailable", campaignId: "wave-1", variantId: "b".repeat(64) },
    ];
    const resolution = {
      id: "resolution-2", resolvesObservationId: "send-2", campaignId: "wave-1", outcome: "verified",
      resolutionStatus: "verified_sent", variantId: "b".repeat(64), visibleMessageId: "zoho-2", checkedFolders: ["sent"],
    };
    expect(sentObservationsAreResolved(sends, [resolution])).toBe(true);
    expect(sentObservationsAreResolved(sends, [])).toBe(false);
    expect(sentObservationsAreResolved(sends, [{ ...resolution, variantId: "c".repeat(64) }])).toBe(false);
    expect(sentObservationsAreResolved(sends, [{ ...resolution, resolvesObservationId: "send-1" }])).toBe(false);
    expect(effectiveVerifiedSentObservationIds(sends, [resolution])).toEqual(["send-1", "resolution-2"]);
    expect(effectiveVerifiedSentObservationIds(sends, [{ ...resolution, resolutionStatus: "verified_not_sent" }])).toEqual(["send-1"]);
  });

  it("does not accept caller-supplied observation timestamps", () => {
    expect(campaignObservationSchema.safeParse({
      campaignId: "wave-1",
      eventType: "sent",
      source: "manual_zoho_browser",
      outcome: "verified",
      attribution: "unknown",
      observedAt: "2000-01-01T00:00:00Z",
      checkedFolders: [],
    }).success).toBe(false);
  });

  it("requires a factual close-out checkpoint before a wave can be marked closed", () => {
    const closeOut = {
      campaignId: "wave-1",
      eventType: "close_out",
      source: "manual_zoho_browser",
      outcome: "verified",
      attribution: "unknown",
      checkedFolders: [],
    };
    expect(campaignObservationSchema.safeParse(closeOut).success).toBe(false);
    expect(campaignObservationSchema.safeParse({
      ...closeOut,
      note: "Facts: three sent, two delivered, one bounce; inbox reply status remains unverified.",
    }).success).toBe(true);
  });

  it("does not infer a negative response when mailbox access is unavailable", () => {
    const result = campaignObservationSchema.safeParse({
      campaignId: "wave-1",
      eventType: "response_check",
      source: "manual_zoho_browser",
      outcome: "unavailable",
      attribution: "unknown",
      checkedFolders: [],
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.outcome).toBe("unavailable");
  });

  it("rejects recipient email addresses in free-text notes", () => {
    const input = {
      campaignId: "wave-1",
      eventType: "reply",
      source: "manual_zoho_browser",
      outcome: "verified",
      attribution: "unknown",
      checkedFolders: ["inbox"],
      note: "Reply visible from person@example.org",
    };
    expect(campaignObservationSchema.safeParse(input).success).toBe(false);
  });

  it("requires an exact reviewed message version before attributing a Zoho outcome", () => {
    const input = {
      campaignId: "wave-1",
      eventType: "sent",
      source: "manual_zoho_browser",
      outcome: "verified",
      attribution: "attributable",
      checkedFolders: ["sent"],
      visibleMessageId: "zoho-visible-id",
    };
    expect(campaignObservationSchema.safeParse(input).success).toBe(false);
    expect(campaignObservationSchema.safeParse({ ...input, variantId: "a".repeat(64) }).success).toBe(true);
    expect(campaignObservationSchema.safeParse({ ...input, variantId: "packet-v1-sha256" }).success).toBe(false);
    expect(campaignObservationSchema.safeParse({ ...input, quantity: 2, variantId: "a".repeat(64) }).success).toBe(false);
  });

  it("requires a separately registered independent PASS packet before message hashes can be used", () => {
    const registration = {
      campaignId: "wave-1",
      eventType: "approved_variant",
      source: "manual_zoho_browser",
      outcome: "verified",
      attribution: "unknown",
      quantity: 0,
      checkedFolders: [],
      visibleMessageId: "pre-review-packet-123",
      variantId: "a".repeat(64),
      note: "PASS confirmed by independent review of the exact packet and hash.",
    };
    expect(campaignObservationSchema.safeParse(registration).success).toBe(true);
    expect(campaignObservationSchema.safeParse({ ...registration, quantity: 1 }).success).toBe(false);
    expect(approvedVariantExists({ variantId: "A".repeat(64), approvedVariants: ["a".repeat(64)] })).toBe(true);
    expect(approvedVariantExists({ variantId: "b".repeat(64), approvedVariants: ["a".repeat(64)] })).toBe(false);
    expect(selectedVariantsAreRegistered({
      observations: [{ campaignId: "wave-1", variantId: "a".repeat(64) }],
      approvedVariants: [{ campaignId: "wave-1", variantId: "a".repeat(64) }],
    })).toBe(true);
    expect(selectedVariantsAreRegistered({
      observations: [{ campaignId: "wave-1", variantId: "a".repeat(64) }],
      approvedVariants: [{ campaignId: "wave-2", variantId: "a".repeat(64) }],
    })).toBe(false);
  });

  it("excludes unattributed replies and non-Zoho events from campaign outcomes", () => {
    const summary = summarizeCampaignOutcomes([
      { source: "manual_zoho_browser", eventType: "sent", outcome: "verified", attribution: "attributable", quantity: 9 },
      { source: "manual_zoho_browser", eventType: "delivered", outcome: "verified", attribution: "attributable", quantity: 8 },
      { source: "manual_zoho_browser", eventType: "bounce", outcome: "verified", attribution: "attributable", quantity: 1 },
      { source: "manual_zoho_browser", eventType: "reply", outcome: "verified", attribution: "unattributed", quantity: 1 },
      { source: "gateway", eventType: "reply", outcome: "verified", attribution: "attributable", quantity: 4 },
    ]);

    expect(summary.sent).toBe(9);
    expect(summary.delivered).toBe(8);
    expect(summary.bounced).toBe(1);
    expect(summary.attributableReplies).toBe(0);
    expect(summary.unattributedReplies).toBe(1);
  });

  it("builds complete campaign totals from grouped database aggregates", () => {
    const summaries = summarizeCampaignOutcomeGroups([
      { campaignId: "wave-a", source: "manual_zoho_browser", eventType: "sent", outcome: "verified", attribution: "attributable", quantity: "100" },
      { campaignId: "wave-a", source: "manual_zoho_browser", eventType: "reply", outcome: "verified", attribution: "attributable", quantity: "4" },
      { campaignId: "wave-b", source: "gateway", eventType: "sent", outcome: "verified", attribution: "attributable", quantity: "40" },
    ]);
    expect(summaries["wave-a"].sent).toBe(100);
    expect(summaries["wave-a"].attributableReplies).toBe(4);
    expect(summaries["wave-b"].sent).toBe(0);
  });

  it("compares only the same declared cohort and exact reviewed message version", () => {
    const rows = summarizeComparableCohorts(
      [
        { campaignId: "wave-a", cohort: "Uganda logistics operators" },
        { campaignId: "wave-b", cohort: "  uganda logistics operators  " },
        { campaignId: "wave-c", cohort: "Uganda logistics operators" },
      ],
      [
        { campaignId: "wave-a", source: "manual_zoho_browser", eventType: "sent", outcome: "verified", attribution: "attributable", quantity: 10, oneMessagePerObservation: true, variantId: "a".repeat(64) },
        { campaignId: "wave-a", source: "manual_zoho_browser", eventType: "delivered", outcome: "verified", attribution: "attributable", quantity: 9, oneMessagePerObservation: true, variantId: "a".repeat(64) },
        { campaignId: "wave-a", source: "manual_zoho_browser", eventType: "bounce", outcome: "verified", attribution: "attributable", quantity: 1, oneMessagePerObservation: true, variantId: "a".repeat(64) },
        { campaignId: "wave-a", source: "manual_zoho_browser", eventType: "qualified_reply", outcome: "verified", attribution: "attributable", quantity: 1, oneMessagePerObservation: true, variantId: "a".repeat(64) },
        { campaignId: "wave-b", source: "manual_zoho_browser", eventType: "delivered", outcome: "verified", attribution: "attributable", quantity: 10, oneMessagePerObservation: true, variantId: "a".repeat(64) },
        { campaignId: "wave-b", source: "manual_zoho_browser", eventType: "qualified_reply", outcome: "verified", attribution: "attributable", quantity: 2, oneMessagePerObservation: true, variantId: "a".repeat(64) },
        { campaignId: "wave-c", source: "manual_zoho_browser", eventType: "delivered", outcome: "verified", attribution: "attributable", quantity: 4, oneMessagePerObservation: true, variantId: "b".repeat(64) },
        { campaignId: "wave-c", source: "manual_zoho_browser", eventType: "qualified_reply", outcome: "verified", attribution: "attributable", quantity: 1, oneMessagePerObservation: true, variantId: "b".repeat(64) },
        { campaignId: "wave-b", source: "manual_zoho_browser", eventType: "reply", outcome: "verified", attribution: "unknown", quantity: 1, oneMessagePerObservation: false, variantId: null },
        { campaignId: "wave-c", source: "manual_zoho_browser", eventType: "delivered", outcome: "unverified", attribution: "unknown", quantity: 1, oneMessagePerObservation: false, variantId: "a".repeat(64) },
        { campaignId: "wave-b", source: "gateway", eventType: "delivered", outcome: "verified", attribution: "attributable", quantity: 500, oneMessagePerObservation: false, variantId: "a".repeat(64) },
      ],
    );

    expect(rows).toHaveLength(3);
    expect(rows.find((row) => row.variantId === "a".repeat(64))).toMatchObject({
      cohort: "Uganda logistics operators",
      campaignCount: 2,
      sent: 10,
      delivered: 19,
      bounced: 1,
      qualifiedReplies: 3,
      qualifiedReplyRate: 3 / 19,
      unknownEvents: 1,
    });
    expect(rows.find((row) => row.variantId === "b".repeat(64))).toMatchObject({ campaignCount: 1, delivered: 4, qualifiedReplies: 1 });
    expect(rows.find((row) => row.variantId === null)).toMatchObject({ unknownEvents: 1, delivered: 0, qualifiedReplies: 0, qualifiedReplyRate: null });
  });

  it("does not count unmatched qualified replies as campaign success or a no-reply check as unknown", () => {
    const summary = summarizeCampaignOutcomes([
      { source: "manual_zoho_browser", eventType: "qualified_reply", outcome: "verified", attribution: "unknown", quantity: 1 },
      { source: "manual_zoho_browser", eventType: "booked", outcome: "verified", attribution: "unattributed", quantity: 1 },
      { source: "manual_zoho_browser", eventType: "response_check", outcome: "no_reply_observed", attribution: "unknown", quantity: 1 },
      { source: "manual_zoho_browser", eventType: "response_check", outcome: "unavailable", attribution: "unknown", quantity: 1 },
    ]);
    expect(summary.qualifiedReplies).toBe(0);
    expect(summary.booked).toBe(0);
    expect(summary.unknownEvents).toBe(3);
  });

  it("keeps legacy multi-message quantities out of comparable delivery and reply rates", () => {
    const row = summarizeComparableCohorts(
      [{ campaignId: "legacy-wave", cohort: "Cohort A" }],
      [
        { campaignId: "legacy-wave", source: "manual_zoho_browser", eventType: "delivered", outcome: "verified", attribution: "attributable", quantity: 25, oneMessagePerObservation: false, variantId: "a".repeat(64) },
      ],
    )[0];
    expect(row).toMatchObject({ delivered: 0, unknownEvents: 25, qualifiedReplyRate: null, campaignCount: 0 });
  });

  it("derives action thresholds from selected verified, version-linked deliveries", () => {
    const version = "a".repeat(64);
    expect(deriveComparableLearningEvidence({
      selectedObservationIds: ["obs-1", "obs-2", "obs-3"],
      originCohort: "Uganda logistics operators",
      observations: [
        { id: "obs-1", campaignId: "wave-a", cohort: "Uganda logistics operators", eventType: "delivered", source: "manual_zoho_browser", outcome: "verified", attribution: "attributable", quantity: 1, variantId: version },
        { id: "obs-2", campaignId: "wave-a", cohort: "uganda logistics operators", eventType: "delivered", source: "manual_zoho_browser", outcome: "verified", attribution: "attributable", quantity: 1, variantId: version },
        { id: "obs-3", campaignId: "wave-b", cohort: "  UGANDA LOGISTICS OPERATORS ", eventType: "delivered", source: "manual_zoho_browser", outcome: "verified", attribution: "attributable", quantity: 1, variantId: version },
      ],
    })).toEqual({ valid: true, comparableSignals: 2, relevantRecords: 3, variantId: version });
  });

  it("rejects selected action evidence with unknown attribution or incomparable cohorts or versions", () => {
    const version = "a".repeat(64);
    const base = { eventType: "delivered", source: "manual_zoho_browser", outcome: "verified", attribution: "attributable", quantity: 1, variantId: version };
    const observations = [
      { id: "good", campaignId: "wave-a", cohort: "Cohort A", ...base },
      { id: "other-cohort", campaignId: "wave-b", cohort: "Cohort B", ...base },
      { id: "other-copy", campaignId: "wave-c", cohort: "Cohort A", ...base, variantId: "b".repeat(64) },
      { id: "not-verified", campaignId: "wave-d", cohort: "Cohort A", ...base, outcome: "unverified" },
      { id: "not-attributed", campaignId: "wave-e", cohort: "Cohort A", ...base, attribution: "unknown" },
    ];
    for (const invalidId of ["other-cohort", "other-copy", "not-verified", "not-attributed", "missing"]) {
      expect(deriveComparableLearningEvidence({ selectedObservationIds: ["good", invalidId], originCohort: "Cohort A", observations }).valid).toBe(false);
    }
  });

  it("requires at least three comparable signals or ten relevant records for a low-risk change", () => {
    expect(getComparableProcessChangeEligibility({ risk: "low", comparableSignals: 2, relevantRecords: 9 }).eligible).toBe(false);
    expect(getComparableProcessChangeEligibility({ risk: "low", comparableSignals: 3, relevantRecords: 3 }).eligible).toBe(true);
    expect(getComparableProcessChangeEligibility({ risk: "low", comparableSignals: 1, relevantRecords: 10 }).eligible).toBe(true);
    expect(getComparableProcessChangeEligibility({ risk: "high", comparableSignals: 30, relevantRecords: 100 }).eligible).toBe(false);
  });
});
