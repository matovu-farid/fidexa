"use client";

import { useRef, useState } from "react";
import { AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

  return (
    <>
      <section id="contact" className="section-rule section-block">
        <div className="site-shell">
          <div className="contact-panel editorial-card">
            <div className="flex flex-col justify-between">
              <div>
                <p className="eyebrow">05 / Contact</p>
                <h2 className="section-title mt-5 text-[#101828]">Have something worth building?</h2>
                <p className="mt-6 max-w-sm text-sm leading-6 text-[#667085]">Tell us what you want to make better—or what you want to make possible. We&apos;ll review your note and reply within two business days.</p>
              </div>
              <p className="contact-side-note mt-12">Typical response / 2 business days<br />hello@fidexa.org</p>
            </div>
            <form onSubmit={handleSubmit} onFocusCapture={() => {
              if (contactStarted.current) return;
              contactStarted.current = true;
              trackAnalytics("contact_form_started");
            }} className="rounded-xl bg-[#fffdf8] p-5 text-[#101828] sm:p-7">
              <p className="eyebrow">Tell us about your project</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-medium" htmlFor="contact-name">Your name
                  <Input id="contact-name" className="editorial-input" name="name" autoComplete="name" required disabled={sending} />
                </label>
                <label className="grid gap-1.5 text-sm font-medium" htmlFor="contact-email">Email address
                  <Input id="contact-email" className="editorial-input" name="email" type="email" autoComplete="email" required disabled={sending} />
                </label>
              </div>
              <label className="mt-3 grid gap-1.5 text-sm font-medium" htmlFor="contact-message">What would you like to work on?
                <Textarea id="contact-message" className="editorial-input min-h-[140px]" name="message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={10_000} required disabled={sending} />
              </label>
              <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
                <label htmlFor="contact-website">Leave this field empty</label>
                <Input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
              </div>
              <p className="mt-3 text-xs leading-5 text-[#667085]">We use your details to reply to this inquiry. If you use the AI guide, its conversation is sent to our AI service to generate responses. A copy of your conversation is placed in this form only if you choose to use it; nothing is sent to us until you submit it.</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button type="submit" className="button-primary border-0 px-6" disabled={sending}>{sending ? "Sending…" : "Send inquiry ↗"}</Button>
                <button type="button" onClick={() => {
                  trackAnalytics("ai_assistant_opened");
                  setChatOpen(true);
                }} className="button-secondary min-h-[46px] border-[#101828]/15 px-4 text-[#101828]"><Sparkles size={14} /> Ask AI instead</button>
              </div>
              {status === "success" && <p aria-live="polite" className="mt-4 flex items-center gap-2 text-sm text-[#287c5d]"><CheckCircle size={16} /> Inquiry sent. We&apos;ll reply within two business days.</p>}
              {status === "error" && <p role="alert" className="mt-4 flex items-center gap-2 text-sm text-[#b13c36]"><AlertCircle size={16} /> Something went wrong. Please try again.</p>}
            </form>
          </div>
        </div>
      </section>
      <ChatModal open={chatOpen} onClose={() => setChatOpen(false)} onUseSummary={(summary) => {
        setMessage(summary);
        setChatOpen(false);
        requestAnimationFrame(() => document.getElementById("contact-message")?.focus());
      }} />
    </>
  );
}
