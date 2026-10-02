import "server-only";

import { and, count, desc, eq, inArray, max, min, sum } from "drizzle-orm";
import { getDb } from "@/db/client";
import { campaignLearningActionEvents, campaignLearningActions, campaignObservations, campaignRuns } from "@/db/campaign-learning-schema";
import {
  campaignLearningActionSchema,
  campaignLearningActionTransitionSchema,
  campaignObservationSchema,
  approvedVariantExists,
  selectedVariantsAreRegistered,
  type CampaignLearningActionStatus,
  type CampaignObservation,
  canRecordCampaignEvent,
  deriveComparableLearningEvidence,
  idempotencyPayloadMatches,
  sentObservationSetMatchesCheck,
  sentObservationsAreResolved,
  effectiveVerifiedSentObservationIds,
  hasVerifiedCampaignReply,
  sendResolutionMatchesAttempt,
  summarizeCampaignOutcomeGroups,
  summarizeCampaignOutcomes,
  summarizeComparableCohorts,
  validateCampaignLearningActionTransition,
  validateCampaignRunInput,
} from "@/lib/campaign-learning";

function campaignRunPayloadMatches(existing: typeof campaignRuns.$inferSelect, incoming: {
  name: string;
  cohort: string;
  hypothesis: string;
  responseCheckDueAt: string;
}) {
  return idempotencyPayloadMatches({
    name: existing.name,
    cohort: existing.cohort,
    hypothesis: existing.hypothesis,
    responseCheckDueAt: existing.responseCheckDueAt,
  }, {
    ...incoming,
    responseCheckDueAt: new Date(incoming.responseCheckDueAt),
  });
}

function campaignActionPayloadMatches(existing: typeof campaignLearningActions.$inferSelect, incoming: {
  campaignId: string;
  hypothesis: string;
  action: string;
  expectedMetric: string;
  comparableSignals: number;
  relevantRecords: number;
  risk: string;
  measurementWindowStartAt: string;
  measurementWindowEndAt: string;
  measurementCheckpointAt: string;
  rationale: string;
  evidenceRefs: string[];
  supportingObservationIds: string[];
  decision: string;
}) {
  return idempotencyPayloadMatches({
    campaignId: existing.campaignId,
    hypothesis: existing.hypothesis,
    action: existing.action,
    expectedMetric: existing.expectedMetric,
    comparableSignals: existing.comparableSignals,
    relevantRecords: existing.relevantRecords,
    risk: existing.risk,
    measurementWindowStartAt: existing.measurementWindowStartAt,
    measurementWindowEndAt: existing.measurementWindowEndAt,
    measurementCheckpointAt: existing.measurementCheckpointAt,
    rationale: existing.rationale,
    evidenceRefs: existing.evidenceRefs,
    supportingObservationIds: [...existing.supportingObservationIds].sort(),
    decision: existing.decision,
  }, {
    ...incoming,
    measurementWindowStartAt: new Date(incoming.measurementWindowStartAt),
    measurementWindowEndAt: new Date(incoming.measurementWindowEndAt),
    measurementCheckpointAt: new Date(incoming.measurementCheckpointAt),
    supportingObservationIds: [...incoming.supportingObservationIds].sort(),
  });
}

function transitionPayload(input: {
  actionId: string;
  expectedStatus: string;
  status: string;
  rationale: string;
  evidenceRefs: string[];
  decision: string;
  implementationReference?: string;
  result?: string;
}) {
  return {
    actionId: input.actionId,
    expectedStatus: input.expectedStatus,
    status: input.status,
    rationale: input.rationale,
    evidenceRefs: input.evidenceRefs,
    decision: input.decision,
    implementationReference: input.implementationReference ?? null,
    result: input.result ?? null,
  };
}

function transitionEventMatches(event: typeof campaignLearningActionEvents.$inferSelect, incoming: ReturnType<typeof transitionPayload>) {
  if (event.eventKind !== "transition" || event.actionId !== incoming.actionId) return false;
  if (event.requestPayload) return idempotencyPayloadMatches(event.requestPayload, incoming);
  // Older events predate stored request payloads. Compare every field that can
  // be proven from the append-only event; an explicit optional value must match.
  return event.previousStatus === incoming.expectedStatus &&
    event.status === incoming.status &&
    event.rationale === incoming.rationale &&
    idempotencyPayloadMatches(event.evidenceRefs, incoming.evidenceRefs) &&
    event.decision === incoming.decision &&
    event.implementationReference === incoming.implementationReference &&
    event.result === incoming.result;
}

export async function listCampaignLearning(now = new Date()) {
  const db = getDb();
  const [campaigns, campaignCount, outcomeGroups, observations, observationCount, actions, actionCount, actionEvents, actionEventCount] = await Promise.all([
    db.select().from(campaignRuns).orderBy(desc(campaignRuns.createdAt)).limit(100),
    db.select({ count: count() }).from(campaignRuns),
    db.select({
      campaignId: campaignObservations.campaignId,
      source: campaignObservations.source,
      eventType: campaignObservations.eventType,
      outcome: campaignObservations.outcome,
      attribution: campaignObservations.attribution,
      variantId: campaignObservations.variantId,
      quantity: sum(campaignObservations.quantity),
      minQuantity: min(campaignObservations.quantity),
      maxQuantity: max(campaignObservations.quantity),
    }).from(campaignObservations).groupBy(
      campaignObservations.campaignId,
      campaignObservations.source,
      campaignObservations.eventType,
      campaignObservations.outcome,
      campaignObservations.attribution,
      campaignObservations.variantId,
    ),
    db.select().from(campaignObservations).orderBy(desc(campaignObservations.observedAt)).limit(1_000),
    db.select({ count: count() }).from(campaignObservations),
    db.select().from(campaignLearningActions).orderBy(desc(campaignLearningActions.createdAt)).limit(500),
    db.select({ count: count() }).from(campaignLearningActions),
    db.select().from(campaignLearningActionEvents).orderBy(desc(campaignLearningActionEvents.createdAt)).limit(2_000),
    db.select({ count: count() }).from(campaignLearningActionEvents),
  ]);
  const summaries = summarizeCampaignOutcomeGroups(outcomeGroups.map((group) => ({ ...group, quantity: group.quantity ?? 0 })));
  const comparableCohorts = summarizeComparableCohorts(
    campaigns.map((campaign) => ({ campaignId: campaign.id, cohort: campaign.cohort })),
    outcomeGroups.map((group) => ({
      ...group,
      quantity: group.quantity ?? 0,
      oneMessagePerObservation: group.minQuantity === 1 && group.maxQuantity === 1,
    })),
  );
  const historyByAction = new Map<string, typeof actionEvents>();
  for (const event of actionEvents) {
    const history = historyByAction.get(event.actionId) ?? [];
    history.push(event);
    historyByAction.set(event.actionId, history);
  }

  return {
    campaigns: campaigns.map((campaign) => {
      const events = observations.filter((event) => event.campaignId === campaign.id);
      return {
        ...campaign,
        observations: events,
        summary: summaries[campaign.id] ?? summarizeCampaignOutcomes([]),
        responseCheckDue: campaign.state === "closed" && campaign.responseCheckDueAt <= now,
      };
    }),
    comparableCohorts,
    completeness: {
      campaigns: { shown: campaigns.length, total: campaignCount[0]?.count ?? 0, complete: campaigns.length === (campaignCount[0]?.count ?? 0) },
      observations: { shown: observations.length, total: observationCount[0]?.count ?? 0, complete: observations.length === (observationCount[0]?.count ?? 0) },
      actions: { shown: actions.length, total: actionCount[0]?.count ?? 0, complete: actions.length === (actionCount[0]?.count ?? 0) },
      actionHistory: { shown: actionEvents.length, total: actionEventCount[0]?.count ?? 0, complete: actionEvents.length === (actionEventCount[0]?.count ?? 0) },
      summariesComplete: true,
    },
    actions: actions.map((action) => ({ ...action, history: historyByAction.get(action.id) ?? [] })),
  };
}

export async function createCampaignRun(input: unknown, createdBy: string, now = new Date()) {
  const parsed = validateCampaignRunInput(input, now.getTime());
  if (!parsed.success) throw new Error("invalid_campaign");
  return getDb().transaction(async (tx) => {
    const [existing] = await tx.select().from(campaignRuns).where(eq(campaignRuns.clientRequestId, parsed.data.clientRequestId)).limit(1);
    if (existing) {
      if (!campaignRunPayloadMatches(existing, parsed.data)) throw new Error("campaign_request_conflict");
      return existing;
    }
    const [campaign] = await tx.insert(campaignRuns).values({
      id: crypto.randomUUID(),
      name: parsed.data.name,
      cohort: parsed.data.cohort,
      hypothesis: parsed.data.hypothesis,
      channel: "manual_zoho_browser",
      state: "planned",
      responseCheckDueAt: new Date(parsed.data.responseCheckDueAt),
      clientRequestId: parsed.data.clientRequestId,
      createdBy,
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing({ target: campaignRuns.clientRequestId }).returning();
    if (campaign) return campaign;
    const [retryWinner] = await tx.select().from(campaignRuns).where(eq(campaignRuns.clientRequestId, parsed.data.clientRequestId)).limit(1);
    if (retryWinner) {
      if (!campaignRunPayloadMatches(retryWinner, parsed.data)) throw new Error("campaign_request_conflict");
      return retryWinner;
    }
    throw new Error("campaign_create_failed");
  });
}

function matchesObservation(existing: {
  campaignId: string;
  eventType: string;
  source: string;
  outcome: string;
  attribution: string;
  quantity: number;
  checkedFolders: string[];
  checkedSentObservationIds: string[];
  visibleMessageId: string | null;
  variantId: string | null;
  note: string | null;
  resolvesObservationId: string | null;
  resolutionStatus: string | null;
}, incoming: CampaignObservation) {
  return existing.campaignId === incoming.campaignId &&
    existing.eventType === incoming.eventType &&
    existing.source === incoming.source &&
    existing.outcome === incoming.outcome &&
    existing.attribution === incoming.attribution &&
    existing.quantity === incoming.quantity &&
    JSON.stringify(existing.checkedFolders) === JSON.stringify(incoming.checkedFolders) &&
    JSON.stringify([...existing.checkedSentObservationIds].sort()) === JSON.stringify([...(incoming.checkedSentObservationIds ?? [])].sort()) &&
    existing.visibleMessageId === (incoming.visibleMessageId ?? null) &&
    existing.variantId?.toLowerCase() === incoming.variantId?.toLowerCase() &&
    existing.note === (incoming.note ?? null) &&
    existing.resolvesObservationId === (incoming.resolvesObservationId ?? null) &&
    existing.resolutionStatus === (incoming.resolutionStatus ?? null);
}

export async function recordCampaignObservation(input: unknown, createdBy: string, now = new Date()) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("invalid_observation");
  const record = input as Record<string, unknown>;
  const { clientRequestId, ...observationInput } = record;
  if (typeof clientRequestId !== "string" || !/^[0-9a-f-]{36}$/i.test(clientRequestId)) throw new Error("invalid_observation");
  const parsed = campaignObservationSchema.safeParse(observationInput);
  if (!parsed.success || parsed.data.source !== "manual_zoho_browser") throw new Error("invalid_observation");

  return getDb().transaction(async (tx) => {
    const [existing] = await tx.select().from(campaignObservations).where(eq(campaignObservations.clientRequestId, clientRequestId)).limit(1);
    if (existing) {
      if (!matchesObservation(existing, parsed.data)) throw new Error("observation_duplicate_conflict");
      return existing;
    }

    const [campaign] = await tx.select().from(campaignRuns).where(eq(campaignRuns.id, parsed.data.campaignId)).for("update").limit(1);
    if (!campaign) throw new Error("campaign_not_found");
    const [concurrentRetry] = await tx.select().from(campaignObservations).where(eq(campaignObservations.clientRequestId, clientRequestId)).limit(1);
    if (concurrentRetry) {
      if (!matchesObservation(concurrentRetry, parsed.data)) throw new Error("observation_duplicate_conflict");
      return concurrentRetry;
    }
    if (!canRecordCampaignEvent({
      state: campaign.state as "planned" | "active" | "closed" | "retrospected",
      eventType: parsed.data.eventType,
      dueAt: campaign.responseCheckDueAt.toISOString(),
      now: now.toISOString(),
    })) throw new Error("campaign_event_not_due_or_invalid_state");

    if (parsed.data.variantId && parsed.data.eventType !== "approved_variant") {
      const registrations = await tx.select({ variantId: campaignObservations.variantId }).from(campaignObservations).where(and(
        eq(campaignObservations.campaignId, parsed.data.campaignId),
        eq(campaignObservations.eventType, "approved_variant"),
        eq(campaignObservations.outcome, "verified"),
      ));
      if (!approvedVariantExists({ variantId: parsed.data.variantId, approvedVariants: registrations.map((row) => row.variantId ?? "") })) {
        throw new Error("unregistered_reviewed_variant");
      }
    }

    if (parsed.data.eventType === "send_resolution") {
      const [attempt] = await tx.select({ id: campaignObservations.id, campaignId: campaignObservations.campaignId, eventType: campaignObservations.eventType, source: campaignObservations.source, outcome: campaignObservations.outcome, variantId: campaignObservations.variantId, visibleMessageId: campaignObservations.visibleMessageId }).from(campaignObservations).where(and(
        eq(campaignObservations.id, parsed.data.resolvesObservationId!),
        eq(campaignObservations.campaignId, parsed.data.campaignId),
        eq(campaignObservations.eventType, "sent"),
        eq(campaignObservations.source, "manual_zoho_browser"),
      )).limit(1);
      if (!attempt || attempt.outcome === "verified" || !sendResolutionMatchesAttempt({
        attemptVariantId: attempt.variantId,
        attemptVisibleMessageId: attempt.visibleMessageId,
        resolutionVariantId: parsed.data.variantId ?? null,
        resolutionVisibleMessageId: parsed.data.visibleMessageId ?? null,
      })) {
        throw new Error("send_resolution_attempt_mismatch");
      }
      const [priorResolution] = await tx.select({ id: campaignObservations.id }).from(campaignObservations).where(eq(campaignObservations.resolvesObservationId, attempt.id)).limit(1);
      if (priorResolution) throw new Error("send_resolution_already_exists");
    }

    let checkedSentObservationIds: string[] = [];
    if (parsed.data.eventType === "response_check" && parsed.data.outcome === "no_reply_observed") {
      const priorReplies = await tx.select({ eventType: campaignObservations.eventType, outcome: campaignObservations.outcome, source: campaignObservations.source }).from(campaignObservations).where(and(
        eq(campaignObservations.campaignId, parsed.data.campaignId),
        inArray(campaignObservations.eventType, ["reply", "qualified_reply"]),
        eq(campaignObservations.source, "manual_zoho_browser"),
      ));
      if (hasVerifiedCampaignReply(priorReplies)) throw new Error("response_check_reply_already_observed");

      const sent = await tx.select({ id: campaignObservations.id, campaignId: campaignObservations.campaignId, outcome: campaignObservations.outcome, visibleMessageId: campaignObservations.visibleMessageId, variantId: campaignObservations.variantId }).from(campaignObservations).where(and(
        eq(campaignObservations.campaignId, parsed.data.campaignId),
        eq(campaignObservations.eventType, "sent"),
        eq(campaignObservations.source, "manual_zoho_browser"),
      ));
      const resolutions = await tx.select({ id: campaignObservations.id, campaignId: campaignObservations.campaignId, outcome: campaignObservations.outcome, resolvesObservationId: campaignObservations.resolvesObservationId, resolutionStatus: campaignObservations.resolutionStatus, variantId: campaignObservations.variantId, visibleMessageId: campaignObservations.visibleMessageId, checkedFolders: campaignObservations.checkedFolders }).from(campaignObservations).where(and(
        eq(campaignObservations.campaignId, parsed.data.campaignId),
        eq(campaignObservations.eventType, "send_resolution"),
        eq(campaignObservations.source, "manual_zoho_browser"),
      ));
      checkedSentObservationIds = parsed.data.checkedSentObservationIds ?? [];
      const registrations = await tx.select({ variantId: campaignObservations.variantId }).from(campaignObservations).where(and(
        eq(campaignObservations.campaignId, parsed.data.campaignId),
        eq(campaignObservations.eventType, "approved_variant"),
        eq(campaignObservations.outcome, "verified"),
      ));
      const everySendIsIdentifiedAndReviewed = sentObservationsAreResolved(sent, resolutions) && sent.every((row) => row.variantId && approvedVariantExists({ variantId: row.variantId, approvedVariants: registrations.map((registration) => registration.variantId ?? "") }));
      if (!everySendIsIdentifiedAndReviewed) throw new Error("response_check_unverified_send_evidence");
      const effectiveSentIds = effectiveVerifiedSentObservationIds(sent, resolutions);
      if (!sentObservationSetMatchesCheck({ selectedIds: checkedSentObservationIds, sentObservationIds: effectiveSentIds })) {
        throw new Error("response_check_sent_set_mismatch");
      }
    }

    const [saved] = await tx.insert(campaignObservations).values({
      id: crypto.randomUUID(),
      campaignId: parsed.data.campaignId,
      eventType: parsed.data.eventType,
      source: "manual_zoho_browser",
      outcome: parsed.data.outcome,
      attribution: parsed.data.attribution,
      quantity: parsed.data.quantity,
      observedAt: now,
      checkedFolders: parsed.data.checkedFolders,
      checkedSentObservationIds,
      resolvesObservationId: parsed.data.resolvesObservationId ?? null,
      resolutionStatus: parsed.data.resolutionStatus ?? null,
      visibleMessageId: parsed.data.visibleMessageId ?? null,
      variantId: parsed.data.variantId ?? null,
      note: parsed.data.note ?? null,
      clientRequestId,
      createdBy,
      createdAt: now,
    }).onConflictDoNothing().returning();
    if (!saved) {
      const [retryWinner] = await tx.select().from(campaignObservations).where(eq(campaignObservations.clientRequestId, clientRequestId)).limit(1);
      const [sameMessageEvent] = parsed.data.visibleMessageId
        ? await tx.select().from(campaignObservations).where(and(
          eq(campaignObservations.visibleMessageId, parsed.data.visibleMessageId),
          eq(campaignObservations.eventType, parsed.data.eventType),
        )).limit(1)
        : [];
      const winner = retryWinner ?? sameMessageEvent;
      if (winner) {
        if (!matchesObservation(winner, parsed.data)) throw new Error("observation_duplicate_conflict");
        return winner;
      }
      throw new Error("observation_create_failed");
    }

    const nextState = parsed.data.eventType === "close_out"
      ? "closed"
      : parsed.data.eventType === "response_check" && parsed.data.outcome === "no_reply_observed"
        ? "retrospected"
        : parsed.data.eventType === "sent"
          ? "active"
          : campaign.state;
    if (nextState !== campaign.state) {
      await tx.update(campaignRuns).set({ state: nextState, updatedAt: now }).where(eq(campaignRuns.id, campaign.id));
    }
    return saved;
  });
}

export async function createCampaignLearningAction(input: unknown, createdBy: string, now = new Date()) {
  const parsed = campaignLearningActionSchema.safeParse(input);
  if (!parsed.success) throw new Error("invalid_action");
  const db = getDb();
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(campaignLearningActions).where(eq(campaignLearningActions.clientRequestId, parsed.data.clientRequestId)).limit(1);
    if (existing) {
      const supportRows = parsed.data.supportingObservationIds.length
        ? await tx.select({
          id: campaignObservations.id,
          campaignId: campaignObservations.campaignId,
          cohort: campaignRuns.cohort,
          eventType: campaignObservations.eventType,
          source: campaignObservations.source,
          outcome: campaignObservations.outcome,
          attribution: campaignObservations.attribution,
          quantity: campaignObservations.quantity,
          variantId: campaignObservations.variantId,
        }).from(campaignObservations).innerJoin(campaignRuns, eq(campaignRuns.id, campaignObservations.campaignId)).where(inArray(campaignObservations.id, parsed.data.supportingObservationIds))
        : [];
      const approvedRows = supportRows.length ? await tx.select({ campaignId: campaignObservations.campaignId, variantId: campaignObservations.variantId }).from(campaignObservations).where(and(
        inArray(campaignObservations.campaignId, [...new Set(supportRows.map((row) => row.campaignId))]),
        eq(campaignObservations.eventType, "approved_variant"),
        eq(campaignObservations.outcome, "verified"),
      )) : [];
      if (!selectedVariantsAreRegistered({ observations: supportRows, approvedVariants: approvedRows })) throw new Error("invalid_action_evidence");
      const [origin] = await tx.select({ cohort: campaignRuns.cohort }).from(campaignRuns).where(eq(campaignRuns.id, parsed.data.campaignId)).limit(1);
      if (!origin) throw new Error("campaign_not_found");
      const evidence = deriveComparableLearningEvidence({ selectedObservationIds: parsed.data.supportingObservationIds, originCohort: origin.cohort, observations: supportRows });
      if (!evidence.valid) throw new Error("invalid_action_evidence");
      const expectedEvidenceRefs = [...parsed.data.evidenceRefs, ...parsed.data.supportingObservationIds.map((id) => `campaign_observation:${id}`)];
      if (!campaignActionPayloadMatches(existing, { ...parsed.data, comparableSignals: evidence.comparableSignals, relevantRecords: evidence.relevantRecords, evidenceRefs: expectedEvidenceRefs })) {
        throw new Error("action_request_conflict");
      }
      return existing;
    }
    const [campaign] = await tx.select({ id: campaignRuns.id, cohort: campaignRuns.cohort }).from(campaignRuns).where(eq(campaignRuns.id, parsed.data.campaignId)).limit(1);
    if (!campaign) throw new Error("campaign_not_found");
    const supportRows = parsed.data.supportingObservationIds.length
      ? await tx.select({
        id: campaignObservations.id,
        campaignId: campaignObservations.campaignId,
        cohort: campaignRuns.cohort,
        eventType: campaignObservations.eventType,
        source: campaignObservations.source,
        outcome: campaignObservations.outcome,
        attribution: campaignObservations.attribution,
        quantity: campaignObservations.quantity,
        variantId: campaignObservations.variantId,
      }).from(campaignObservations).innerJoin(campaignRuns, eq(campaignRuns.id, campaignObservations.campaignId)).where(inArray(campaignObservations.id, parsed.data.supportingObservationIds))
      : [];
    const approvedRows = supportRows.length ? await tx.select({ campaignId: campaignObservations.campaignId, variantId: campaignObservations.variantId }).from(campaignObservations).where(and(
      inArray(campaignObservations.campaignId, [...new Set(supportRows.map((row) => row.campaignId))]),
      eq(campaignObservations.eventType, "approved_variant"),
      eq(campaignObservations.outcome, "verified"),
    )) : [];
    if (!selectedVariantsAreRegistered({ observations: supportRows, approvedVariants: approvedRows })) throw new Error("invalid_action_evidence");
    const evidence = deriveComparableLearningEvidence({
      selectedObservationIds: parsed.data.supportingObservationIds,
      originCohort: campaign.cohort,
      observations: supportRows,
    });
    if (!evidence.valid) throw new Error("invalid_action_evidence");
    const evidenceRefs = [
      ...parsed.data.evidenceRefs,
      ...parsed.data.supportingObservationIds.map((id) => `campaign_observation:${id}`),
    ];

    const id = crypto.randomUUID();
    const [action] = await tx.insert(campaignLearningActions).values({
      id,
      campaignId: parsed.data.campaignId,
      hypothesis: parsed.data.hypothesis,
      action: parsed.data.action,
      expectedMetric: parsed.data.expectedMetric,
      comparableSignals: evidence.comparableSignals,
      relevantRecords: evidence.relevantRecords,
      risk: parsed.data.risk,
      status: "proposed",
      result: null,
      implementationReference: null,
      measurementWindowStartAt: new Date(parsed.data.measurementWindowStartAt),
      measurementWindowEndAt: new Date(parsed.data.measurementWindowEndAt),
      measurementCheckpointAt: new Date(parsed.data.measurementCheckpointAt),
      rationale: parsed.data.rationale,
      evidenceRefs,
      supportingObservationIds: parsed.data.supportingObservationIds,
      decision: parsed.data.decision,
      clientRequestId: parsed.data.clientRequestId,
      userDecisionApproved: false,
      createdBy,
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing({ target: campaignLearningActions.clientRequestId }).returning();

    if (!action) {
      const [retryWinner] = await tx.select().from(campaignLearningActions).where(eq(campaignLearningActions.clientRequestId, parsed.data.clientRequestId)).limit(1);
      if (retryWinner) {
        if (!campaignActionPayloadMatches(retryWinner, { ...parsed.data, comparableSignals: evidence.comparableSignals, relevantRecords: evidence.relevantRecords, evidenceRefs })) {
          throw new Error("action_request_conflict");
        }
        return retryWinner;
      }
      throw new Error("action_create_failed");
    }

    await tx.insert(campaignLearningActionEvents).values({
      id: crypto.randomUUID(),
      actionId: id,
      eventKind: "created",
      previousStatus: null,
      status: "proposed",
      rationale: parsed.data.rationale,
      evidenceRefs,
      decision: parsed.data.decision,
      implementationReference: null,
      result: null,
      clientRequestId: parsed.data.clientRequestId,
      createdBy,
      createdAt: now,
    });
    return action;
  });
}

export async function transitionCampaignLearningAction(input: unknown, createdBy: string, now = new Date()) {
  const parsed = campaignLearningActionTransitionSchema.safeParse(input);
  if (!parsed.success) throw new Error("invalid_action_transition");
  const db = getDb();
  const requestedTransition = transitionPayload(parsed.data);
  return db.transaction(async (tx) => {
    const [duplicate] = await tx.select().from(campaignLearningActionEvents).where(eq(campaignLearningActionEvents.clientRequestId, parsed.data.clientRequestId)).limit(1);
    if (duplicate) {
      if (!transitionEventMatches(duplicate, requestedTransition)) throw new Error("action_transition_conflict");
      const [current] = await tx.select().from(campaignLearningActions).where(eq(campaignLearningActions.id, duplicate.actionId)).limit(1);
      if (!current) throw new Error("campaign_action_not_found");
      return { action: current, event: duplicate, duplicate: true };
    }

    const [action] = await tx.select().from(campaignLearningActions).where(eq(campaignLearningActions.id, parsed.data.actionId)).for("update").limit(1);
    if (!action) throw new Error("campaign_action_not_found");
    const [concurrentRetry] = await tx.select().from(campaignLearningActionEvents).where(eq(campaignLearningActionEvents.clientRequestId, parsed.data.clientRequestId)).limit(1);
    if (concurrentRetry) {
      if (!transitionEventMatches(concurrentRetry, requestedTransition)) throw new Error("action_transition_conflict");
      return { action, event: concurrentRetry, duplicate: true };
    }
    let verifiedComparableSignals = 0;
    let verifiedRelevantRecords = 0;
    if (parsed.data.status === "applied" && action.risk === "low") {
      const [originCampaign] = await tx.select({ cohort: campaignRuns.cohort }).from(campaignRuns).where(eq(campaignRuns.id, action.campaignId)).limit(1);
      if (!originCampaign) throw new Error("campaign_not_found");
      const supportRows = action.supportingObservationIds.length
        ? await tx.select({
          id: campaignObservations.id,
          campaignId: campaignObservations.campaignId,
          cohort: campaignRuns.cohort,
          eventType: campaignObservations.eventType,
          source: campaignObservations.source,
          outcome: campaignObservations.outcome,
          attribution: campaignObservations.attribution,
          quantity: campaignObservations.quantity,
          variantId: campaignObservations.variantId,
        }).from(campaignObservations).innerJoin(campaignRuns, eq(campaignRuns.id, campaignObservations.campaignId)).where(inArray(campaignObservations.id, action.supportingObservationIds))
        : [];
      const evidence = deriveComparableLearningEvidence({
        selectedObservationIds: action.supportingObservationIds,
        originCohort: originCampaign.cohort,
        observations: supportRows,
      });
      if (!evidence.valid || evidence.comparableSignals !== action.comparableSignals || evidence.relevantRecords !== action.relevantRecords) {
        throw new Error("action_threshold_evidence_mismatch");
      }
      verifiedComparableSignals = evidence.comparableSignals;
      verifiedRelevantRecords = evidence.relevantRecords;
    } else {
      verifiedComparableSignals = action.comparableSignals;
      verifiedRelevantRecords = action.relevantRecords;
    }
    const transition = validateCampaignLearningActionTransition({
      currentStatus: action.status as CampaignLearningActionStatus,
      expectedStatus: parsed.data.expectedStatus,
      nextStatus: parsed.data.status,
      risk: action.risk as "low" | "high",
      comparableSignals: verifiedComparableSignals,
      relevantRecords: verifiedRelevantRecords,
      measurementCheckpointAt: action.measurementCheckpointAt?.toISOString() ?? null,
      userDecisionApproved: action.userDecisionApproved,
      implementationReference: parsed.data.implementationReference,
      result: parsed.data.result,
      now: now.toISOString(),
    });
    if (!transition.valid) throw new Error(transition.reason);

    const [event] = await tx.insert(campaignLearningActionEvents).values({
      id: crypto.randomUUID(),
      actionId: action.id,
      eventKind: "transition",
      previousStatus: action.status,
      status: parsed.data.status,
      rationale: parsed.data.rationale,
      evidenceRefs: parsed.data.evidenceRefs,
      decision: parsed.data.decision,
      implementationReference: parsed.data.implementationReference ?? action.implementationReference,
      result: parsed.data.result ?? action.result,
      requestPayload: requestedTransition,
      clientRequestId: parsed.data.clientRequestId,
      createdBy,
      createdAt: now,
    }).onConflictDoNothing({ target: campaignLearningActionEvents.clientRequestId }).returning();
    if (!event) {
      const [retryWinner] = await tx.select().from(campaignLearningActionEvents).where(eq(campaignLearningActionEvents.clientRequestId, parsed.data.clientRequestId)).limit(1);
      if (retryWinner && transitionEventMatches(retryWinner, requestedTransition)) return { action, event: retryWinner, duplicate: true };
      throw new Error("action_transition_conflict");
    }

    const [updated] = await tx.update(campaignLearningActions).set({
      status: parsed.data.status,
      userDecisionApproved: action.userDecisionApproved || parsed.data.status === "user_approved",
      implementationReference: parsed.data.implementationReference ?? action.implementationReference,
      result: parsed.data.result ?? action.result,
      updatedAt: now,
    }).where(eq(campaignLearningActions.id, action.id)).returning();
    if (!updated) throw new Error("action_transition_conflict");
    return { action: updated, event, duplicate: false };
  });
}
