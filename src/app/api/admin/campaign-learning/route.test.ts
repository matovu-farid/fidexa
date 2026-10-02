import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAdminSession: vi.fn(),
  getServerConfig: vi.fn(),
  listCampaignLearning: vi.fn(),
  createCampaignRun: vi.fn(),
  recordCampaignObservation: vi.fn(),
  createCampaignLearningAction: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock("@/lib/auth", () => ({ getAdminSession: mocks.getAdminSession }));
vi.mock("@/lib/config", () => ({ getServerConfig: mocks.getServerConfig }));
vi.mock("@/lib/campaign-learning-store", () => ({
  listCampaignLearning: mocks.listCampaignLearning,
  createCampaignRun: mocks.createCampaignRun,
  recordCampaignObservation: mocks.recordCampaignObservation,
  createCampaignLearningAction: mocks.createCampaignLearningAction,
}));

import { GET, POST } from "./route";

const origin = "https://fidexa.org";
function post(body: unknown, headers: Record<string, string> = {}) {
  return POST(new Request(`${origin}/api/admin/campaign-learning`, {
    method: "POST",
    headers: { origin, "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  }));
}
function postRaw(body: string, headers: Record<string, string> = {}) {
  return POST(new Request(`${origin}/api/admin/campaign-learning`, {
    method: "POST",
    headers: { origin, "content-type": "application/json", ...headers },
    body,
  }));
}

describe("admin campaign learning route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAdminSession.mockResolvedValue({ user: { email: "farid@fidexa.org" } });
    mocks.getServerConfig.mockReturnValue({ fidexaAppUrl: origin });
    mocks.listCampaignLearning.mockResolvedValue({ campaigns: [], actions: [] });
    mocks.createCampaignRun.mockResolvedValue({ id: "campaign-id" });
    mocks.recordCampaignObservation.mockResolvedValue({ id: "event-id" });
    mocks.createCampaignLearningAction.mockResolvedValue({ id: "action-id" });
  });

  it("requires the Fidexa admin session for reads and writes", async () => {
    mocks.getAdminSession.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    const get = await GET();
    const postResponse = await post({ kind: "create_campaign" });
    expect(get.status).toBe(401);
    expect(postResponse.status).toBe(401);
    expect(mocks.listCampaignLearning).not.toHaveBeenCalled();
    expect(mocks.createCampaignRun).not.toHaveBeenCalled();
  });

  it("rejects cross-origin campaign writes", async () => {
    const response = await post({ kind: "create_campaign" }, { origin: "https://attacker.example" });
    expect(response.status).toBe(403);
    expect(mocks.createCampaignRun).not.toHaveBeenCalled();
  });

  it("rejects oversized JSON even when Content-Length is not supplied", async () => {
    const response = await postRaw(" ".repeat(24_001));
    expect(response.status).toBe(413);
    expect(mocks.createCampaignRun).not.toHaveBeenCalled();
  });

  it("requires campaign cohort, hypothesis, and a future response-check date", async () => {
    const response = await post({ kind: "create_campaign", name: "Wave", cohort: "operators", hypothesis: "Test", responseCheckDueAt: "2020-01-01T00:00:00.000Z" });
    expect(response.status).toBe(400);
    expect(mocks.createCampaignRun).not.toHaveBeenCalled();
  });

  it("does not let a form assert no reply without checking Zoho folders", async () => {
    const response = await post({
      kind: "record_observation",
      campaignId: "8ca9fb11-6cc8-4ead-9236-808923cc8b85",
      eventType: "response_check",
      source: "manual_zoho_browser",
      outcome: "no_reply_observed",
      attribution: "unknown",
      checkedFolders: [],
      clientRequestId: "cb032d8d-74a0-4305-9ed8-c92174149d50",
    });
    expect(response.status).toBe(400);
    expect(mocks.recordCampaignObservation).not.toHaveBeenCalled();
  });

  it("returns a conflict for a stale or incomplete sent-message set instead of a service outage", async () => {
    mocks.recordCampaignObservation.mockRejectedValueOnce(new Error("response_check_sent_set_mismatch"));
    const response = await post({
      kind: "record_observation",
      campaignId: "8ca9fb11-6cc8-4ead-9236-808923cc8b85",
      eventType: "response_check",
      source: "manual_zoho_browser",
      outcome: "no_reply_observed",
      attribution: "unknown",
      checkedFolders: ["inbox", "spam", "sent"],
      checkedSentObservationIds: ["2c1c9f15-9d8a-4bd9-8db9-19b7563f35c1"],
      clientRequestId: "cb032d8d-74a0-4305-9ed8-c92174149d50",
    });
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({ error: "response_check_sent_set_mismatch" });
  });

  it("returns a conflict rather than recording no-reply when a verified reply already exists", async () => {
    mocks.recordCampaignObservation.mockRejectedValueOnce(new Error("response_check_reply_already_observed"));
    const response = await post({
      kind: "record_observation",
      campaignId: "8ca9fb11-6cc8-4ead-9236-808923cc8b85",
      eventType: "response_check",
      source: "manual_zoho_browser",
      outcome: "no_reply_observed",
      attribution: "unknown",
      checkedFolders: ["inbox", "spam", "sent"],
      checkedSentObservationIds: ["2c1c9f15-9d8a-4bd9-8db9-19b7563f35c1"],
      clientRequestId: "cb032d8d-74a0-4305-9ed8-c92174149d50",
    });
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({ error: "response_check_reply_already_observed" });
  });

  it("writes only browser-verified Zoho observations and returns the saved record", async () => {
    const response = await post({
      kind: "record_observation",
      campaignId: "8ca9fb11-6cc8-4ead-9236-808923cc8b85",
      eventType: "sent",
      source: "manual_zoho_browser",
      outcome: "verified",
      attribution: "attributable",
      checkedFolders: ["sent"],
      visibleMessageId: "zoho-visible-id",
      variantId: "a".repeat(64),
      clientRequestId: "cb032d8d-74a0-4305-9ed8-c92174149d50",
    });
    expect(response.status).toBe(201);
    expect(mocks.recordCampaignObservation).toHaveBeenCalledWith(expect.objectContaining({
      source: "manual_zoho_browser",
      visibleMessageId: "zoho-visible-id",
      variantId: "a".repeat(64),
      clientRequestId: "cb032d8d-74a0-4305-9ed8-c92174149d50",
    }), "farid@fidexa.org");
    await expect(response.json()).resolves.toEqual({ observation: { id: "event-id" } });
  });

  it("never accepts gateway/Resend observations through the manual Zoho form", async () => {
    const response = await post({
      kind: "record_observation",
      campaignId: "8ca9fb11-6cc8-4ead-9236-808923cc8b85",
      eventType: "sent",
      source: "gateway",
      outcome: "verified",
      attribution: "unknown",
      checkedFolders: [],
      clientRequestId: "cb032d8d-74a0-4305-9ed8-c92174149d50",
    });
    expect(response.status).toBe(400);
    expect(mocks.recordCampaignObservation).not.toHaveBeenCalled();
  });
});
