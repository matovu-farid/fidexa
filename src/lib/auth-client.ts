"use client";

import { useEffect } from "react";
import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";
import posthog from "posthog-js";

export const authClient = createAuthClient({
  plugins: [magicLinkClient()],
});

export function PostHogIdentity() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  useEffect(() => {
    if (!user?.id || !process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || !process.env.NEXT_PUBLIC_POSTHOG_HOST) return;

    posthog.identify(user.id, {
      email: user.email,
      name: user.name,
    });
  }, [user?.id, user?.email, user?.name]);

  return null;
}
