"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Mail, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import posthog from "posthog-js";
import { Logo } from "@/components/logo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const confirmationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sent) confirmationRef.current?.focus();
  }, [sent]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError("");
    setPending(true);
    try {
      const result = await authClient.signIn.magicLink({ email, callbackURL: "/admin" });
      if (result.error) {
        setError("We could not send a sign-in link. Check the address and try again.");
      } else {
        if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
          posthog.capture("admin_magic_link_requested");
        }
        setSent(true);
      }
    } catch {
      setError("We could not send a sign-in link. Check the address and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="admin-auth-page">
      <div className="admin-auth-layout">
        <aside className="admin-auth-intro">
          <Link href="/" className="admin-auth-brand" aria-label="Fidexa home"><Logo variant="light" size={44} /><span>fidexa</span></Link>
          <div className="admin-auth-proposition">
            <Badge variant="outline"><ShieldCheck />Private workspace</Badge>
            <p className="admin-auth-headline">The work behind the work.</p>
            <p>Company research, outreach records, and campaign learning. One workspace for Fidexa operations.</p>
          </div>
          <Button asChild variant="ghost" className="self-start"><Link href="/"><ArrowLeft data-icon="inline-start" />Back to Fidexa</Link></Button>
        </aside>
        <Card className="admin-auth-card">
          <CardHeader>
            <CardTitle><h1>Open the workspace.</h1></CardTitle>
            <CardDescription>Use your @fidexa.org email. We’ll send a one-time sign-in link.</CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <Alert ref={confirmationRef} tabIndex={-1} role="status" aria-live="polite">
                <CheckCircle2 />
                <AlertTitle>Check your email</AlertTitle>
                <AlertDescription>Look for a sign-in link in your inbox. It expires in 10 minutes.</AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={submit} aria-busy={pending}>
                <FieldGroup>
                  <Field data-invalid={Boolean(error)} data-disabled={pending}>
                    <FieldLabel htmlFor="admin-email">Email address</FieldLabel>
                    <Input
                      id="admin-email"
                      type="email"
                      required
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      disabled={pending}
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? "admin-email-help admin-email-error" : "admin-email-help"}
                      value={email}
                      onChange={(event) => { setEmail(event.target.value); setError(""); }}
                      placeholder="you@fidexa.org"
                    />
                    <FieldDescription id="admin-email-help">Sign in securely without a password.</FieldDescription>
                    {error && <FieldError id="admin-email-error" role="alert">{error}</FieldError>}
                  </Field>
                  <Field>
                    <Button type="submit" disabled={pending}>
                      {pending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Mail data-icon="inline-start" />}
                      {pending ? "Sending link…" : "Send magic link"}
                      {!pending && <ArrowRight data-icon="inline-end" />}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            )}
          </CardContent>
          <Separator />
          <CardFooter><p className="admin-auth-note">This area is for Fidexa administrators only.</p></CardFooter>
        </Card>
      </div>
    </main>
  );
}
