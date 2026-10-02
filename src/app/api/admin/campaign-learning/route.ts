import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getServerConfig } from "@/lib/config";
import {
  createCampaignLearningAction,
  createCampaignRun,
  listCampaignLearning,
  recordCampaignObservation,
  transitionCampaignLearningAction,
} from "@/lib/campaign-learning-store";
import { campaignObservationSchema, validateCampaignRunInput } from "../../../../lib/campaign-learning";

export const dynamic = "force-dynamic";

const maxBodyBytes = 24_000;

type BodyRead = { ok: true; value: unknown } | { ok: false; reason: "too_large" | "invalid_json" };

async function readBoundedJson(request: Request): Promise<BodyRead> {
  if (!request.body) return { ok: false, reason: "invalid_json" };
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let raw = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBodyBytes) {
        await reader.cancel();
        return { ok: false, reason: "too_large" };
      }
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
    return { ok: true, value: JSON.parse(raw) as unknown };
  } catch {
    return { ok: false, reason: "invalid_json" };
  } finally {
    reader.releaseLock();
  }
}

function errorResponse(code: string, status: number) {
  return NextResponse.json({ error: code }, { status, headers: { "cache-control": "no-store" } });
}

export async function GET() {
  const session = await getAdminSession(await headers());
  if (!session) return errorResponse("unauthorized", 401);
  try {
    return NextResponse.json(await listCampaignLearning(), { headers: { "cache-control": "no-store" } });
  } catch {
    return errorResponse("campaign_learning_unavailable", 503);
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession(await headers());
  if (!session) return errorResponse("unauthorized", 401);

  let expectedOrigin: string;
  try {
    expectedOrigin = new URL(getServerConfig().fidexaAppUrl).origin;
  } catch {
    return errorResponse("campaign_learning_unavailable", 503);
  }
  if (request.headers.get("origin") !== expectedOrigin) return errorResponse("origin_not_allowed", 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return errorResponse("unsupported_content_type", 415);
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number.isFinite(Number(contentLength)) && Number(contentLength) > maxBodyBytes) return errorResponse("request_too_large", 413);
  const bodyRead = await readBoundedJson(request);
  if (!bodyRead.ok) return errorResponse(bodyRead.reason === "too_large" ? "request_too_large" : "invalid_json", bodyRead.reason === "too_large" ? 413 : 400);
  const body = bodyRead.value;
  if (!body || typeof body !== "object" || Array.isArray(body)) return errorResponse("invalid_request", 400);

  const record = body as Record<string, unknown>;
  const actor = session.user.email;
  try {
    if (record.kind === "create_campaign") {
      const { kind: _, ...input } = record;
      const validation = validateCampaignRunInput(input);
      if (!validation.success) return errorResponse("invalid_campaign", 400);
      const campaign = await createCampaignRun(validation.data, actor);
      return NextResponse.json({ campaign }, { status: 201, headers: { "cache-control": "no-store" } });
    }
    if (record.kind === "record_observation") {
      const { kind: _, clientRequestId, ...input } = record;
      const validation = campaignObservationSchema.safeParse(input);
      if (!validation.success || validation.data.source !== "manual_zoho_browser" || typeof clientRequestId !== "string" || !/^[0-9a-f-]{36}$/i.test(clientRequestId)) {
        return errorResponse("invalid_observation", 400);
      }
      const observation = await recordCampaignObservation({ ...validation.data, clientRequestId }, actor);
      return NextResponse.json({ observation }, { status: 201, headers: { "cache-control": "no-store" } });
    }
    if (record.kind === "create_action") {
      const { kind: _, ...input } = record;
      const action = await createCampaignLearningAction(input, actor);
      return NextResponse.json({ action }, { status: 201, headers: { "cache-control": "no-store" } });
    }
    if (record.kind === "transition_action") {
      const { kind: _, ...input } = record;
      const transition = await transitionCampaignLearningAction(input, actor);
      return NextResponse.json(transition, { status: transition.duplicate ? 200 : 201, headers: { "cache-control": "no-store" } });
    }
    return errorResponse("unknown_action", 400);
  } catch (error) {
    if (error instanceof Error && error.message === "campaign_not_found") return errorResponse("campaign_not_found", 404);
    if (error instanceof Error && error.message === "observation_duplicate_conflict") return errorResponse("observation_duplicate_conflict", 409);
    if (error instanceof Error && ["send_resolution_attempt_mismatch", "send_resolution_already_exists"].includes(error.message)) return errorResponse(error.message, 409);
    if (error instanceof Error && error.message === "campaign_event_not_due_or_invalid_state") return errorResponse("campaign_event_not_due_or_invalid_state", 409);
    if (error instanceof Error && ["response_check_sent_set_mismatch", "response_check_unverified_send_evidence", "response_check_reply_already_observed", "unregistered_reviewed_variant"].includes(error.message)) return errorResponse(error.message, 409);
    if (error instanceof Error && ["action_threshold_not_met", "action_threshold_evidence_mismatch", "campaign_request_conflict", "action_request_conflict"].includes(error.message)) return errorResponse(error.message, 409);
    if (error instanceof Error && error.message === "campaign_action_not_found") return errorResponse("campaign_action_not_found", 404);
    if (error instanceof Error && ["stale_status", "invalid_status_transition", "action_threshold_not_met", "high_impact_requires_user_decision", "implementation_reference_required", "checkpoint_not_reached", "result_required", "action_transition_conflict"].includes(error.message)) return errorResponse(error.message, 409);
    if (error instanceof Error && ["invalid_campaign", "invalid_observation", "invalid_action", "invalid_action_transition", "invalid_action_evidence"].includes(error.message)) return errorResponse(error.message, 400);
    return errorResponse("campaign_learning_unavailable", 503);
  }
}
