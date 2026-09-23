import posthog from "posthog-js";

type AuthenticatedUser = { id: string; email: string; name: string };

export function syncPostHogIdentity(user: AuthenticatedUser | null): void {
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || !process.env.NEXT_PUBLIC_POSTHOG_HOST) return;

  try {
    if (user) {
      posthog.identify(user.id, { email: user.email, name: user.name });
    } else if (posthog.get_property("$user_id")) {
      posthog.reset();
    }
  } catch {
    // Analytics must not interfere with authentication or public browsing.
  }
}
