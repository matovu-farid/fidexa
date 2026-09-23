import { beforeEach, describe, expect, it, vi } from "vitest";
import { track as vercelTrack } from "@vercel/analytics";
import posthog from "posthog-js";
import { trackAnalytics, trackChatMessageSubmitted } from "./analytics";

vi.mock("@vercel/analytics", () => ({ track: vi.fn() }));
vi.mock("posthog-js", () => ({ default: { capture: vi.fn() } }));

const mockedTrack = vi.mocked(vercelTrack);
const mockedCapture = vi.mocked(posthog.capture);

beforeEach(() => {
  mockedTrack.mockReset();
  mockedCapture.mockReset();
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", "phc_test");
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "https://us.i.posthog.com");
});

describe("conversion analytics adapter", () => {
  it("sends the named event without user supplied data", () => {
    trackAnalytics("hero_cta_clicked");

    expect(mockedTrack).toHaveBeenCalledOnce();
    expect(mockedTrack).toHaveBeenCalledWith("hero_cta_clicked");
    expect(mockedCapture).toHaveBeenCalledWith("hero_cta_clicked");
  });

  it("preserves the wizard's PostHog conversion event names", () => {
    trackAnalytics("contact_form_succeeded");
    trackAnalytics("ai_assistant_opened");
    trackAnalytics("project_category_filtered", { category: "web-apps" });

    expect(mockedCapture).toHaveBeenNthCalledWith(1, "contact_form_submitted");
    expect(mockedCapture).toHaveBeenNthCalledWith(2, "ai_chat_opened", { entry_point: "contact_form" });
    expect(mockedCapture).toHaveBeenNthCalledWith(3, "project_category_selected", { category: "web-apps" });
  });

  it("does not send to PostHog without both public configuration values", () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "");

    trackAnalytics("hero_cta_clicked");

    expect(mockedTrack).toHaveBeenCalledWith("hero_cta_clicked");
    expect(mockedCapture).not.toHaveBeenCalled();
  });

  it("keeps synchronous provider errors from escaping", () => {
    mockedTrack.mockImplementation(() => {
      throw new Error("analytics unavailable");
    });

    expect(() => trackAnalytics("contact_form_succeeded")).not.toThrow();
    expect(mockedCapture).toHaveBeenCalledWith("contact_form_submitted");
  });

  it("does not let PostHog failure interrupt the action", () => {
    mockedCapture.mockImplementation(() => { throw new Error("posthog unavailable"); });

    expect(() => trackAnalytics("contact_form_succeeded")).not.toThrow();
    expect(mockedTrack).toHaveBeenCalledWith("contact_form_succeeded");
  });

  it("tracks a chat message without its contents or a blocking exception", () => {
    trackChatMessageSubmitted(2);
    expect(mockedCapture).toHaveBeenCalledWith("ai_chat_message_submitted", { message_number: 2 });
    expect(mockedTrack).not.toHaveBeenCalled();

    mockedCapture.mockImplementation(() => { throw new Error("posthog unavailable"); });
    expect(() => trackChatMessageSubmitted(3)).not.toThrow();
  });
});
