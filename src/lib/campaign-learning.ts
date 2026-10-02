import { z } from "zod";

const campaignFolders = ["inbox", "sent", "spam", "drafts", "outbox"] as const;

export const campaignRunInputSchema = z.object({
  clientRequestId: z.string().uuid(),
  name: z.string().trim().min(1).max(160),
  cohort: z.string().trim().min(1).max(160),
  hypothesis: z.string().trim().min(1).max(2_000),
  responseCheckDueAt: z.string().datetime({ offset: true }),
}).strict();

export function kampalaLocalDateTimeToIso(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const [year, month, day, hour, minute] = [yearText, monthText, dayText, hourText, minuteText].map(Number);
  if (year < 100 || month < 1 || month > 12 || hour > 23 || minute > 59) return null;
  const wallClockAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  const wallClockDate = new Date(wallClockAsUtc);
  if (wallClockDate.getUTCFullYear() !== year || wallClockDate.getUTCMonth() !== month - 1 || wallClockDate.getUTCDate() !== day) return null;
  return new Date(wallClockAsUtc - 3 * 60 * 60 * 1_000).toISOString();
}

const privateEmailPattern = /[\w.!#$%&'*+/=?^`{|}~-]+@[\w-]+(?:\.[\w-]+)+/i;

function canonicalRequestValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(canonicalRequestValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, entry]) => [key, canonicalRequestValue(entry)]));
  }
  return value;
}

export function idempotencyPayloadMatches(existing: unknown, incoming: unknown): boolean {
  return JSON.stringify(canonicalRequestValue(existing)) === JSON.stringify(canonicalRequestValue(incoming));
}

export const campaignLearningActionSchema = z.object({
  campaignId: z.string().uuid(),
  hypothesis: z.string().trim().min(1).max(2_000),
  action: z.string().trim().min(1).max(2_000),
  expectedMetric: z.string().trim().min(1).max(300),
  supportingObservationIds: z.array(z.string().uuid()).max(200),
  risk: z.enum(["low", "high"]),
  measurementWindowStartAt: z.string().datetime({ offset: true }),
  measurementWindowEndAt: z.string().datetime({ offset: true }),
  measurementCheckpointAt: z.string().datetime({ offset: true }),
  rationale: z.string().trim().min(1).max(2_000).refine((value) => !privateEmailPattern.test(value), "Do not store email addresses in action rationale"),
  evidenceRefs: z.array(z.string().trim().min(1).max(500).refine((value) => !privateEmailPattern.test(value), "Use evidence references, not email addresses")).min(1).max(20),
  decision: z.string().trim().min(1).max(1_000).refine((value) => !privateEmailPattern.test(value), "Do not store email addresses in action decisions"),
  clientRequestId: z.string().uuid(),
}).strict().superRefine((action, context) => {
  const start = Date.parse(action.measurementWindowStartAt);
  const end = Date.parse(action.measurementWindowEndAt);
  const checkpoint = Date.parse(action.measurementCheckpointAt);
  if (start >= end) context.addIssue({ code: "custom", path: ["measurementWindowEndAt"], message: "Measurement window end must be after its start" });
  if (checkpoint < start || checkpoint > end) context.addIssue({ code: "custom", path: ["measurementCheckpointAt"], message: "Checkpoint must fall inside the stated measurement window" });
});

const campaignLearningActionStatusSchema = z.enum(["proposed", "applied", "needs_user_decision", "user_approved", "rejected", "evaluated"]);
export type CampaignLearningActionStatus = z.infer<typeof campaignLearningActionStatusSchema>;

export const campaignLearningActionTransitionSchema = z.object({
  actionId: z.string().uuid(),
  expectedStatus: campaignLearningActionStatusSchema,
  status: campaignLearningActionStatusSchema,
  rationale: z.string().trim().min(1).max(2_000).refine((value) => !privateEmailPattern.test(value), "Do not store email addresses in action rationale"),
  evidenceRefs: z.array(z.string().trim().min(1).max(500).refine((value) => !privateEmailPattern.test(value), "Use evidence references, not email addresses")).min(1).max(20),
  decision: z.string().trim().min(1).max(1_000).refine((value) => !privateEmailPattern.test(value), "Do not store email addresses in action decisions"),
  clientRequestId: z.string().uuid(),
  implementationReference: z.string().trim().min(1).max(500).optional(),
  result: z.string().trim().min(1).max(2_000).refine((value) => !privateEmailPattern.test(value), "Do not store email addresses in observed results").optional(),
}).strict();

export type CampaignLearningActionTransition = z.infer<typeof campaignLearningActionTransitionSchema>;

export function validateCampaignLearningActionTransition(input: {
  currentStatus: CampaignLearningActionStatus;
  expectedStatus: CampaignLearningActionStatus;
  nextStatus: CampaignLearningActionStatus;
  risk: "low" | "high";
  comparableSignals: number;
  relevantRecords: number;
  measurementCheckpointAt: string | null;
  userDecisionApproved: boolean;
  implementationReference?: string;
  result?: string;
  now: string;
}): { valid: true } | { valid: false; reason: "stale_status" | "invalid_status_transition" | "action_threshold_not_met" | "high_impact_requires_user_decision" | "implementation_reference_required" | "checkpoint_not_reached" | "result_required" } {
  if (input.currentStatus !== input.expectedStatus) return { valid: false, reason: "stale_status" };
  const allowed: Record<CampaignLearningActionStatus, CampaignLearningActionStatus[]> = {
    proposed: ["applied", "needs_user_decision", "rejected"],
    needs_user_decision: ["proposed", "user_approved", "rejected"],
    user_approved: ["applied", "rejected"],
    applied: ["evaluated"],
    rejected: [],
    evaluated: [],
  };
  if (!allowed[input.currentStatus].includes(input.nextStatus)) return { valid: false, reason: "invalid_status_transition" };
  if (input.risk === "high" && ["applied", "evaluated"].includes(input.nextStatus) && !input.userDecisionApproved) return { valid: false, reason: "high_impact_requires_user_decision" };
  if (input.nextStatus === "applied") {
    if (input.risk === "low" && !getComparableProcessChangeEligibility(input).eligible) return { valid: false, reason: "action_threshold_not_met" };
    if (!input.implementationReference) return { valid: false, reason: "implementation_reference_required" };
  }
  if (input.nextStatus === "evaluated") {
    if (!input.measurementCheckpointAt || Date.parse(input.measurementCheckpointAt) > Date.parse(input.now)) return { valid: false, reason: "checkpoint_not_reached" };
    if (!input.result) return { valid: false, reason: "result_required" };
  }
  return { valid: true };
}

export function validateCampaignRunInput(input: unknown, now = Date.now()) {
  const parsed = campaignRunInputSchema.safeParse(input);
  if (!parsed.success) return parsed;
  if (Date.parse(parsed.data.responseCheckDueAt) <= now) {
    return {
      success: false as const,
      error: new z.ZodError([{
        code: "custom",
        path: ["responseCheckDueAt"],
        message: "Response-check due date must be in the future when the campaign is created",
      }]),
    };
  }
  return parsed;
}

export const campaignObservationSchema = z.object({
  campaignId: z.string().trim().min(1).max(160),
  eventType: z.enum(["approved_variant", "sent", "send_resolution", "delivered", "bounce", "reply", "qualified_reply", "opt_out", "booked", "attended", "follow_up", "close_out", "response_check"]),
  source: z.enum(["manual_zoho_browser", "gateway"]),
  outcome: z.enum(["verified", "no_reply_observed", "unavailable", "unverified"]),
  attribution: z.enum(["attributable", "unattributed", "unknown"]),
  checkedSentObservationIds: z.array(z.string().uuid()).max(10_000).optional(),
  resolvesObservationId: z.string().uuid().optional(),
  resolutionStatus: z.enum(["verified_sent", "verified_not_sent"]).optional(),
  checkedFolders: z.array(z.enum(campaignFolders)).max(campaignFolders.length),
  quantity: z.number().int().min(0).max(10_000).default(1),
  visibleMessageId: z.string().trim().min(1).max(240).optional(),
  variantId: z.string().trim().min(1).max(120).optional(),
  note: z.string().trim().max(2_000).refine((value) => !privateEmailPattern.test(value), "Do not store recipient email addresses in notes").optional(),
}).strict().superRefine((observation, context) => {
  if (observation.outcome === "no_reply_observed" && observation.eventType !== "response_check") {
    context.addIssue({ code: "custom", path: ["outcome"], message: "No reply can only be recorded as a response check" });
  }
  if (observation.eventType === "response_check" && observation.outcome === "no_reply_observed" && observation.checkedFolders.length === 0) {
    context.addIssue({ code: "custom", path: ["checkedFolders"], message: "At least one Zoho folder must be checked before recording no reply observed" });
  }
  if (observation.eventType === "response_check" && observation.outcome === "no_reply_observed" && (!observation.checkedFolders.includes("inbox") || !observation.checkedFolders.includes("spam"))) {
    context.addIssue({ code: "custom", path: ["checkedFolders"], message: "Check both Zoho Inbox and Spam before recording no reply observed; otherwise use unavailable or unverified" });
  }
  if (observation.eventType === "response_check" && observation.outcome === "no_reply_observed" && !observation.checkedFolders.includes("sent")) {
    context.addIssue({ code: "custom", path: ["checkedFolders"], message: "Check Sent as well as Inbox and Spam before finalizing a no-reply result" });
  }
  if (observation.eventType === "response_check" && observation.outcome === "no_reply_observed" && !observation.checkedSentObservationIds?.length) {
    context.addIssue({ code: "custom", path: ["checkedSentObservationIds"], message: "Select the verified sent-message observations covered by this response check" });
  }
  if (observation.checkedSentObservationIds && new Set(observation.checkedSentObservationIds).size !== observation.checkedSentObservationIds.length) {
    context.addIssue({ code: "custom", path: ["checkedSentObservationIds"], message: "A sent-message observation can only be selected once" });
  }
  if (observation.checkedSentObservationIds && !(observation.eventType === "response_check" && observation.outcome === "no_reply_observed")) {
    context.addIssue({ code: "custom", path: ["checkedSentObservationIds"], message: "Sent-message references are only valid for a final no-reply check" });
  }
  if (observation.eventType === "close_out" && !observation.note?.trim()) {
    context.addIssue({ code: "custom", path: ["note"], message: "A campaign close-out requires a factual checkpoint note and any material unknowns" });
  }
  if (observation.eventType === "approved_variant" && (observation.outcome !== "verified" || observation.attribution !== "unknown" || observation.quantity !== 0 || !observation.visibleMessageId || !observation.variantId || !/^[a-f0-9]{64}$/i.test(observation.variantId) || !observation.note?.trim())) {
    context.addIssue({ code: "custom", path: ["variantId"], message: "Register a reviewed variant only with its immutable PASS packet reference, exact SHA-256, factual note, verified status, unknown attribution, and zero outcome count" });
  }
  if (observation.eventType === "send_resolution") {
    if (!observation.resolvesObservationId || observation.outcome !== "verified" || observation.attribution !== "unknown" || observation.quantity !== 0 || !observation.resolutionStatus || !observation.variantId || !/^[a-f0-9]{64}$/i.test(observation.variantId) || !observation.visibleMessageId || !observation.note?.trim()) {
      context.addIssue({ code: "custom", path: ["resolvesObservationId"], message: "A send resolution must link one uncertain attempt and include its exact reviewed hash, visible Zoho message identifier, factual note, verified outcome, unknown attribution, and zero count" });
    }
    if (observation.resolutionStatus === "verified_sent" && !observation.checkedFolders.includes("sent")) {
      context.addIssue({ code: "custom", path: ["checkedFolders"], message: "A sent resolution requires the exact message to be visible in Zoho Sent" });
    }
    if (observation.resolutionStatus === "verified_not_sent" && (!observation.checkedFolders.includes("sent") || !observation.checkedFolders.includes("outbox") || !observation.checkedFolders.includes("drafts"))) {
      context.addIssue({ code: "custom", path: ["checkedFolders"], message: "A not-sent resolution requires Sent, Outbox, and Drafts checks against the exact matching attempt" });
    }
  } else if (observation.resolvesObservationId || observation.resolutionStatus) {
    context.addIssue({ code: "custom", path: ["resolutionStatus"], message: "Send-resolution fields are only valid on a send_resolution observation" });
  }
  if (observation.eventType === "sent" && observation.outcome === "verified" && (!observation.visibleMessageId || !observation.variantId || !/^[a-f0-9]{64}$/i.test(observation.variantId))) {
    context.addIssue({ code: "custom", path: ["visibleMessageId"], message: "A verified campaign send requires its visible Zoho message ID and exact reviewed-version SHA-256" });
  }
  if (observation.source === "manual_zoho_browser" && observation.outcome !== "unavailable" && observation.eventType !== "response_check" && observation.attribution === "attributable" && !observation.visibleMessageId) {
    context.addIssue({ code: "custom", path: ["visibleMessageId"], message: "An attributable Zoho event requires its visible message identifier" });
  }
  const messageOutcomeEvents = new Set(["sent", "delivered", "bounce", "reply", "qualified_reply", "opt_out", "booked", "attended", "follow_up"]);
  if (observation.source === "manual_zoho_browser" && observation.outcome === "verified" && observation.attribution === "attributable" && messageOutcomeEvents.has(observation.eventType) && !observation.variantId) {
    context.addIssue({ code: "custom", path: ["variantId"], message: "Attributable outcomes must point to the exact reviewed packet or immutable message variant" });
  }
  if (observation.source === "manual_zoho_browser" && observation.outcome === "verified" && observation.attribution === "attributable" && messageOutcomeEvents.has(observation.eventType) && observation.variantId && !/^[a-f0-9]{64}$/i.test(observation.variantId)) {
    context.addIssue({ code: "custom", path: ["variantId"], message: "Use the exact approved packet content SHA-256, not an unverified label" });
  }
  if (observation.source === "manual_zoho_browser" && observation.outcome === "verified" && observation.attribution === "attributable" && messageOutcomeEvents.has(observation.eventType) && observation.quantity !== 1) {
    context.addIssue({ code: "custom", path: ["quantity"], message: "Log attributable message outcomes one visible Zoho message at a time so identifiers remain auditable" });
  }
});

export type CampaignRunState = "planned" | "active" | "closed" | "retrospected";
export type CampaignLifecycleEvent = "approved_variant" | "sent" | "send_resolution" | "close_out" | "response_check" | "delivered" | "bounce" | "reply" | "qualified_reply" | "opt_out" | "booked" | "attended" | "follow_up";

export function canRecordCampaignEvent(input: {
  state: CampaignRunState;
  eventType: CampaignLifecycleEvent;
  dueAt: string;
  now: string;
}): boolean {
  if (input.eventType === "send_resolution") return input.state !== "retrospected";
  if (input.eventType === "response_check") {
    return input.state === "closed" && Date.parse(input.dueAt) <= Date.parse(input.now);
  }
  if (input.state === "retrospected") {
    return ["delivered", "bounce", "reply", "qualified_reply", "opt_out", "booked", "attended"].includes(input.eventType);
  }
  if (input.eventType === "close_out") return input.state === "planned" || input.state === "active";
  return input.state === "planned" || input.state === "active";
}

export type CampaignObservation = z.infer<typeof campaignObservationSchema>;

export function sentObservationSetMatchesCheck(input: {
  selectedIds: readonly string[];
  sentObservationIds: readonly string[];
}): boolean {
  if (new Set(input.selectedIds).size !== input.selectedIds.length || new Set(input.sentObservationIds).size !== input.sentObservationIds.length) return false;
  const selected = [...input.selectedIds].sort();
  const sent = [...input.sentObservationIds].sort();
  return sent.length > 0 && selected.length === sent.length && selected.every((id, index) => id === sent[index]);
}

type SendResolution = {
  id?: string;
  campaignId?: string;
  outcome: string;
  resolvesObservationId?: string | null;
  resolutionStatus?: string | null;
  variantId?: string | null;
  visibleMessageId?: string | null;
  checkedFolders?: readonly string[];
};

type PossibleSend = { id?: string; campaignId?: string; outcome: string; variantId?: string | null };

export function sendResolutionMatchesAttempt(input: {
  attemptVariantId: string | null;
  attemptVisibleMessageId: string | null;
  resolutionVariantId: string | null;
  resolutionVisibleMessageId: string | null;
}): boolean {
  return Boolean(input.attemptVariantId) &&
    Boolean(input.attemptVisibleMessageId) &&
    input.resolutionVariantId?.toLowerCase() === input.attemptVariantId?.toLowerCase() &&
    /^[a-f0-9]{64}$/i.test(input.attemptVariantId ?? "") &&
    Boolean(input.resolutionVisibleMessageId) &&
    input.attemptVisibleMessageId === input.resolutionVisibleMessageId;
}

export function hasVerifiedCampaignReply(observations: readonly { eventType: string; outcome: string; source: string }[]): boolean {
  return observations.some((observation) =>
    observation.source === "manual_zoho_browser" &&
    observation.outcome === "verified" &&
    (observation.eventType === "reply" || observation.eventType === "qualified_reply"),
  );
}

function validLinkedSendResolution(send: PossibleSend, resolution: SendResolution): boolean {
  if (send.outcome === "verified") return false;
  if (!send.id || resolution.resolvesObservationId !== send.id || resolution.outcome !== "verified" || !resolution.id) return false;
  if (send.campaignId && resolution.campaignId !== send.campaignId) return false;
  if (!send.variantId || resolution.variantId?.toLowerCase() !== send.variantId.toLowerCase() || !/^[a-f0-9]{64}$/i.test(send.variantId)) return false;
  if (!resolution.visibleMessageId || !resolution.checkedFolders) return false;
  if (resolution.resolutionStatus === "verified_sent") return resolution.checkedFolders.includes("sent");
  if (resolution.resolutionStatus === "verified_not_sent") return ["sent", "outbox", "drafts"].every((folder) => resolution.checkedFolders?.includes(folder));
  return false;
}

export function sentObservationsAreResolved(sent: PossibleSend[], resolutions: SendResolution[] = []): boolean {
  return sent.every((observation) => observation.outcome === "verified" || resolutions.filter((resolution) => resolution.resolvesObservationId === observation.id).length === 1 && validLinkedSendResolution(observation, resolutions.find((resolution) => resolution.resolvesObservationId === observation.id)!));
}

export function effectiveVerifiedSentObservationIds(sent: PossibleSend[], resolutions: SendResolution[]): string[] {
  const ids = sent.filter((observation) => observation.outcome === "verified" && observation.id).map((observation) => observation.id!);
  for (const observation of sent) {
    if (observation.outcome === "verified") continue;
    const linked = resolutions.filter((resolution) => resolution.resolvesObservationId === observation.id);
    if (linked.length === 1 && validLinkedSendResolution(observation, linked[0]!) && linked[0]?.resolutionStatus === "verified_sent") ids.push(linked[0].id!);
  }
  return ids;
}

export function approvedVariantExists(input: {
  variantId: string;
  approvedVariants: readonly string[];
}): boolean {
  return input.approvedVariants.some((variantId) => variantId.toLowerCase() === input.variantId.toLowerCase());
}

export function selectedVariantsAreRegistered(input: {
  observations: readonly { campaignId: string; variantId: string | null }[];
  approvedVariants: readonly { campaignId: string; variantId: string | null }[];
}): boolean {
  const registered = new Set(input.approvedVariants.filter((item) => item.variantId).map((item) => `${item.campaignId}:${item.variantId?.toLowerCase()}`));
  return input.observations.every((item) => item.variantId && registered.has(`${item.campaignId}:${item.variantId.toLowerCase()}`));
}

export function deriveComparableLearningEvidence(input: {
  selectedObservationIds: readonly string[];
  originCohort: string;
  observations: readonly {
    id: string;
    campaignId: string;
    cohort: string;
    eventType: string;
    source: string;
    outcome: string;
    attribution: string;
    quantity: number;
    variantId: string | null;
  }[];
}): { valid: true; comparableSignals: number; relevantRecords: number; variantId: string | null } | { valid: false; reason: "duplicate_evidence_id" | "evidence_not_found" | "evidence_not_comparable" } {
  if (new Set(input.selectedObservationIds).size !== input.selectedObservationIds.length) return { valid: false, reason: "duplicate_evidence_id" };
  if (!input.selectedObservationIds.length) return { valid: true, comparableSignals: 0, relevantRecords: 0, variantId: null };
  const byId = new Map(input.observations.map((observation) => [observation.id, observation]));
  const selected = input.selectedObservationIds.map((id) => byId.get(id));
  if (selected.some((observation) => !observation)) return { valid: false, reason: "evidence_not_found" };
  const records = selected as NonNullable<(typeof selected)[number]>[];
  const normalize = (value: string) => value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
  const originCohort = normalize(input.originCohort);
  const variantId = records[0]?.variantId?.toLowerCase() ?? null;
  const allComparable = records.every((observation) =>
    observation.source === "manual_zoho_browser" &&
    observation.eventType === "delivered" &&
    observation.outcome === "verified" &&
    observation.attribution === "attributable" &&
    observation.quantity === 1 &&
    normalize(observation.cohort) === originCohort &&
    Boolean(variantId) &&
    /^[a-f0-9]{64}$/.test(observation.variantId ?? "") &&
    observation.variantId?.toLowerCase() === variantId,
  );
  if (!allComparable) return { valid: false, reason: "evidence_not_comparable" };
  return {
    valid: true,
    comparableSignals: new Set(records.map((observation) => observation.campaignId)).size,
    relevantRecords: records.length,
    variantId,
  };
}

export type CampaignOutcomeSummary = {
  sent: number;
  delivered: number;
  bounced: number;
  attributableReplies: number;
  unattributedReplies: number;
  qualifiedReplies: number;
  optOuts: number;
  booked: number;
  attended: number;
  followUps: number;
  unknownEvents: number;
};

type SummaryEvent = Pick<CampaignObservation, "source" | "eventType" | "outcome" | "attribution" | "quantity">;

export function summarizeCampaignOutcomes(events: readonly SummaryEvent[]): CampaignOutcomeSummary {
  const summary: CampaignOutcomeSummary = {
    sent: 0,
    delivered: 0,
    bounced: 0,
    attributableReplies: 0,
    unattributedReplies: 0,
    qualifiedReplies: 0,
    optOuts: 0,
    booked: 0,
    attended: 0,
    followUps: 0,
    unknownEvents: 0,
  };

  for (const event of events) {
    if (event.source !== "manual_zoho_browser") continue;
    if (event.eventType === "response_check") {
      if (event.outcome === "unavailable" || event.outcome === "unverified") summary.unknownEvents += event.quantity;
      continue;
    }
    if (event.outcome !== "verified") {
      summary.unknownEvents += event.quantity;
      continue;
    }

    switch (event.eventType) {
      case "sent": summary.sent += event.quantity; break;
      case "delivered": summary.delivered += event.quantity; break;
      case "bounce": summary.bounced += event.quantity; break;
      case "reply":
        if (event.attribution === "attributable") summary.attributableReplies += event.quantity;
        else summary.unattributedReplies += event.quantity;
        break;
      case "qualified_reply":
        if (event.attribution === "attributable") summary.qualifiedReplies += event.quantity;
        else summary.unknownEvents += event.quantity;
        break;
      case "opt_out": summary.optOuts += event.quantity; break;
      case "booked":
        if (event.attribution === "attributable") summary.booked += event.quantity;
        else summary.unknownEvents += event.quantity;
        break;
      case "attended":
        if (event.attribution === "attributable") summary.attended += event.quantity;
        else summary.unknownEvents += event.quantity;
        break;
      case "follow_up": summary.followUps += event.quantity; break;
      case "close_out": break;
    }
  }
  return summary;
}

export function summarizeCampaignOutcomeGroups(groups: readonly {
  campaignId: string;
  source: string;
  eventType: string;
  outcome: string;
  attribution: string;
  quantity: number | string | null;
}[]): Record<string, CampaignOutcomeSummary> {
  const eventsByCampaign = new Map<string, SummaryEvent[]>();
  for (const group of groups) {
    const events = eventsByCampaign.get(group.campaignId) ?? [];
    events.push({
      source: group.source as CampaignObservation["source"],
      eventType: group.eventType as CampaignObservation["eventType"],
      outcome: group.outcome as CampaignObservation["outcome"],
      attribution: group.attribution as CampaignObservation["attribution"],
      quantity: Number(group.quantity ?? 0),
    });
    eventsByCampaign.set(group.campaignId, events);
  }
  return Object.fromEntries([...eventsByCampaign].map(([campaignId, events]) => [campaignId, summarizeCampaignOutcomes(events)]));
}

export type ComparableCohortSummary = {
  cohort: string;
  variantId: string | null;
  campaignCount: number;
  sent: number;
  delivered: number;
  bounced: number;
  attributableReplies: number;
  qualifiedReplies: number;
  optOuts: number;
  booked: number;
  attended: number;
  unknownEvents: number;
  qualifiedReplyRate: number | null;
  attendedRate: number | null;
};

/**
 * Aggregate manual Zoho observations only when both the declared cohort and
 * exact reviewed message hash match. Unmatched versions are kept in a visible
 * null-version bucket, never folded into a copy-performance rate.
 */
export function summarizeComparableCohorts(
  campaigns: readonly { campaignId: string; cohort: string }[],
  groups: readonly {
    campaignId: string;
    source: string;
    eventType: string;
    outcome: string;
    attribution: string;
    quantity: number | string | null;
    oneMessagePerObservation: boolean;
    variantId: string | null;
  }[],
): ComparableCohortSummary[] {
  const cohortByCampaign = new Map(campaigns.map(({ campaignId, cohort }) => [campaignId, cohort.trim()]));
  const buckets = new Map<string, ComparableCohortSummary & { campaignIds: Set<string> }>();

  for (const group of groups) {
    if (group.source !== "manual_zoho_browser") continue;
    const cohort = cohortByCampaign.get(group.campaignId);
    if (!cohort) continue;
    const normalizedCohort = cohort.toLocaleLowerCase().replace(/\s+/g, " ");
    const variantId = group.variantId && /^[a-f0-9]{64}$/i.test(group.variantId) ? group.variantId.toLowerCase() : null;
    const key = `${normalizedCohort}\u0000${variantId ?? "unlinked"}`;
    let summary = buckets.get(key);
    if (!summary) {
      summary = {
        cohort,
        variantId,
        campaignCount: 0,
        sent: 0,
        delivered: 0,
        bounced: 0,
        attributableReplies: 0,
        qualifiedReplies: 0,
        optOuts: 0,
        booked: 0,
        attended: 0,
        unknownEvents: 0,
        qualifiedReplyRate: null,
        attendedRate: null,
        campaignIds: new Set(),
      };
      buckets.set(key, summary);
    }
    const quantity = Number(group.quantity ?? 0);
    if (group.eventType === "response_check") {
      if (group.outcome === "unavailable" || group.outcome === "unverified") summary.unknownEvents += quantity;
      continue;
    }
    if (group.outcome !== "verified" || group.attribution !== "attributable" || !variantId || !group.oneMessagePerObservation) {
      if (group.outcome !== "no_reply_observed") summary.unknownEvents += quantity;
      continue;
    }
    summary.campaignIds.add(group.campaignId);

    switch (group.eventType) {
      case "sent": summary.sent += quantity; break;
      case "delivered": summary.delivered += quantity; break;
      case "bounce": summary.bounced += quantity; break;
      case "reply": summary.attributableReplies += quantity; break;
      case "qualified_reply": summary.qualifiedReplies += quantity; break;
      case "opt_out": summary.optOuts += quantity; break;
      case "booked": summary.booked += quantity; break;
      case "attended": summary.attended += quantity; break;
      case "follow_up": break;
      case "close_out": break;
    }
  }

  return [...buckets.values()].map(({ campaignIds, ...summary }) => {
    const delivered = summary.variantId ? summary.delivered : 0;
    return {
      ...summary,
      campaignCount: campaignIds.size,
      qualifiedReplyRate: delivered > 0 ? summary.qualifiedReplies / delivered : null,
      attendedRate: delivered > 0 ? summary.attended / delivered : null,
    };
  }).sort((left, right) => left.cohort.localeCompare(right.cohort) || (left.variantId ?? "").localeCompare(right.variantId ?? ""));
}

export function getComparableProcessChangeEligibility(input: {
  risk: "low" | "high";
  comparableSignals: number;
  relevantRecords: number;
}): { eligible: boolean; reason: "high_impact_requires_user_decision" | "insufficient_evidence" | "threshold_met" } {
  if (input.risk === "high") return { eligible: false, reason: "high_impact_requires_user_decision" };
  if (input.comparableSignals >= 3 || input.relevantRecords >= 10) return { eligible: true, reason: "threshold_met" };
  return { eligible: false, reason: "insufficient_evidence" };
}
