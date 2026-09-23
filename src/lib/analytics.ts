import { track } from "@vercel/analytics";
import posthog from "posthog-js";
import type { ProjectCategory } from "@/data/projects";

export const analyticsEvents = [
  "hero_cta_clicked",
  "featured_project_opened",
  "outbound_project_link_opened",
  "contact_form_started",
  "contact_form_succeeded",
  "contact_form_failed",
  "ai_assistant_opened",
  "ai_handoff_requested",
  "project_category_filtered",
] as const;

export type AnalyticsEvent = (typeof analyticsEvents)[number];

const posthogEventNames: Record<AnalyticsEvent, string> = {
  hero_cta_clicked: "hero_cta_clicked",
  featured_project_opened: "featured_project_opened",
  outbound_project_link_opened: "outbound_project_link_opened",
  contact_form_started: "contact_form_started",
  contact_form_succeeded: "contact_form_submitted",
  contact_form_failed: "contact_form_failed",
  ai_assistant_opened: "ai_chat_opened",
  ai_handoff_requested: "ai_handoff_requested",
  project_category_filtered: "project_category_selected",
};

export function trackAnalytics(event: AnalyticsEvent, options?: { category: ProjectCategory | "all" }): void {
  try {
    track(event);
  } catch {
    // Analytics must never interrupt a visitor's action.
  }

  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || !process.env.NEXT_PUBLIC_POSTHOG_HOST) return;

  try {
    if (event === "ai_assistant_opened") {
      posthog.capture(posthogEventNames[event], { entry_point: "contact_form" });
    } else if (event === "project_category_filtered" && options) {
      posthog.capture(posthogEventNames[event], { category: options.category });
    } else {
      posthog.capture(posthogEventNames[event]);
    }
  } catch {
    // PostHog must not interrupt a visitor's action or Vercel event delivery.
  }
}

export function trackChatMessageSubmitted(messageNumber: number): void {
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || !process.env.NEXT_PUBLIC_POSTHOG_HOST) return;
  try {
    posthog.capture("ai_chat_message_submitted", { message_number: messageNumber });
  } catch {
    // Analytics must never prevent a chat message from being sent.
  }
}
