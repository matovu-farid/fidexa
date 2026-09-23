"use client";

import { useEffect } from "react";
import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";
import { syncPostHogIdentity } from "./posthog-identity";

export const authClient = createAuthClient({
  plugins: [magicLinkClient()],
});

export function PostHogIdentity() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  useEffect(() => {
    if (isPending) return;
    syncPostHogIdentity(user?.id ? { id: user.id, email: user.email, name: user.name } : null);
  }, [isPending, user?.id, user?.email, user?.name]);

  return null;
}
