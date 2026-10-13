"use client";

import { useRef, useState } from "react";
import { AlertCircle, CheckCircle, Sparkles, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChatModal } from "./chat-modal";
import { trackAnalytics } from "@/lib/analytics";

export function Contact() {
  const [chatOpen, setChatOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const contactStarted = useRef(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setSending(true);
    setStatus("idle");
    const body = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        trackAnalytics("contact_form_succeeded");
        setStatus("success");
        form.reset();
        setMessage("");
      } else {
        trackAnalytics("contact_form_failed");
        setStatus("error");
      }
    } catch {
      trackAnalytics("contact_form_failed");
      setStatus("error");
    } finally { setSending(false); }
  }

  function openChat() {
    trackAnalytics("ai_assistant_opened");
    setChatOpen(true);
  }

  function markContactStarted() {
    if (contactStarted.current) return;
    contactStarted.current = true;
    trackAnalytics("contact_form_started");
  }

  return (
    <>
      <section id="contact" className="section-rule section-block contact-section">
        <div className="site-shell">
          <div className="contact-panel">
            <div className="flex flex-col justify-between">
              <div>
                <h2 className="section-title">Have something worth building?</h2>
                <p className="mt-6 max-w-sm text-sm leading-6 text-muted-foreground">Tell us what you want to make better—or what you want to make possible. We&apos;ll review your note and reply within two business days.</p>
              </div>
              <p className="contact-side-note mt-12">Typical response / 2 business days<br /><a href="mailto:hello@fidexa.org" className="inline-flex min-h-11 items-center underline underline-offset-4">hello@fidexa.org</a></p>
            </div>
            <Card className="contact-form-card py-0">
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <FieldGroup>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <Field><FieldLabel htmlFor="contact-name">Your name</FieldLabel>
                        <Input id="contact-name" name="name" autoComplete="name" onFocus={markContactStarted} required disabled={sending} />
                      </Field>
                      <Field><FieldLabel htmlFor="contact-email">Email address</FieldLabel>
                        <Input id="contact-email" name="email" type="email" autoComplete="email" onFocus={markContactStarted} required disabled={sending} />
                      </Field>
                    </div>
                    <Field><FieldLabel htmlFor="contact-message">What would you like to work on?</FieldLabel>
                      <Textarea id="contact-message" aria-describedby="contact-message-hint contact-privacy" name="message" value={message} onChange={(event) => setMessage(event.target.value)} onFocus={markContactStarted} maxLength={10_000} required disabled={sending} />
                      <FieldDescription id="contact-message-hint">A few lines about the problem, who it affects, and your current stage are enough to start.</FieldDescription>
                    </Field>
                    <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
                      <label htmlFor="contact-website">Leave this field empty</label>
                      <Input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
                    </div>
                    <FieldDescription id="contact-privacy">We use your name, email and message to reply to this inquiry.</FieldDescription>
                    <div className="contact-actions">
                      <Button type="submit" size="lg" className="min-h-12" disabled={sending}>{sending ? "Sending…" : "Send inquiry"}<ArrowUpRight /></Button>
                      <Button id="contact-ai-trigger" type="button" variant="outline" size="lg" className="min-h-12" onClick={openChat}><Sparkles /> Help shape my inquiry</Button>
                    </div>
                    {status === "success" && <Alert role="status"><CheckCircle /><AlertDescription>Inquiry sent. We&apos;ll reply within two business days.</AlertDescription></Alert>}
                    {status === "error" && <Alert variant="destructive"><AlertCircle /><AlertDescription>Your inquiry wasn&apos;t sent. Your entries are still here. Try “Send inquiry” again, or email <a href="mailto:hello@fidexa.org" className="underline underline-offset-4">hello@fidexa.org</a>.</AlertDescription></Alert>}
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <ChatModal open={chatOpen} onClose={() => setChatOpen(false)} onUseSummary={(summary) => {
        setMessage(summary);
        setChatOpen(false);
      }} />
    </>
  );
}
