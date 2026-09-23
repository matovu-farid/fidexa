import { track } from "@vercel/analytics";

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

export function trackAnalytics(event: AnalyticsEvent): void {
  try {
    track(event);
  } catch {
    // Analytics must never interrupt a visitor's action.
  }
}
