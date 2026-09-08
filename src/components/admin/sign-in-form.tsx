"use client";

import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const result = await authClient.signIn.magicLink({ email, callbackURL: "/admin" });
    if (result.error) {
      setError("We could not send a sign-in link. Check the address and try again.");
    } else {
      setSent(true);
    }
  }

  return (
    <main className="admin-sign-in">
      <div className="admin-sign-in-card">
        <p className="eyebrow">Fidexa / Admin</p>
        <h1>Open the workspace.</h1>
        <p className="admin-muted">Use your @fidexa.org email. We’ll send a one-time link through Resend.</p>
        {sent ? (
          <div className="admin-success" role="status">
            Check your email for a sign-in link. It expires in 10 minutes.
          </div>
        ) : (
          <form onSubmit={submit} className="admin-sign-in-form">
            <label htmlFor="admin-email">Email address</label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@fidexa.org"
            />
            {error && <p className="admin-error" role="alert">{error}</p>}
            <button className="admin-primary" type="submit">Send magic link</button>
          </form>
        )}
        <p className="admin-muted admin-sign-in-foot">This area is for Fidexa administrators only.</p>
      </div>
    </main>
  );
}
