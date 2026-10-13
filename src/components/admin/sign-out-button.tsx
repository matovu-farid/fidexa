"use client";

import { authClient } from "@/lib/auth-client";
import posthog from "posthog-js";
import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SignOutButton({ className }: { className?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const result = await authClient.signOut();
      if (result.error) {
        setError("Could not sign out. Try again.");
        setPending(false);
        return;
      }
      if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
        posthog.reset();
      }
      window.location.assign("/admin-auth");
    } catch {
      setError("Could not sign out. Try again.");
      setPending(false);
    }
  }

  return (
    <>
      <Button variant="outline" size="lg" className={className} type="button" disabled={pending} onClick={() => void signOut()}>
        {pending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <LogOut data-icon="inline-start" />}
        {pending ? "Signing out…" : "Sign out"}
      </Button>
      {error && <Alert variant="destructive" role="alert"><AlertDescription>{error}</AlertDescription></Alert>}
    </>
  );
}
