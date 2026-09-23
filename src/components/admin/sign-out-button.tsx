"use client";

import { authClient } from "@/lib/auth-client";
import posthog from "posthog-js";

export function SignOutButton() {
  async function signOut() {
    await authClient.signOut();
    if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
      posthog.reset();
    }
    window.location.assign("/admin-auth");
  }

  return <button className="admin-secondary" type="button" onClick={() => void signOut()}>Sign out</button>;
}
