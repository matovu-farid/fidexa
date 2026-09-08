"use client";

import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  async function signOut() {
    await authClient.signOut();
    window.location.assign("/admin-auth");
  }

  return <button className="admin-secondary" type="button" onClick={() => void signOut()}>Sign out</button>;
}
