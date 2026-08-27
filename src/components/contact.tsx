"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChatModal } from "./chat-modal";

export function Contact() {
  const [chatOpen, setChatOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setSending(true);
    setStatus("idle");
    const body = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) { setStatus("success"); form.reset(); } else setStatus("error");
    } catch { setStatus("error"); } finally { setSending(false); }
  }

  return (
    <>
      <section id="contact" className="section-rule section-block">
        <div className="site-shell">
          <div className="contact-panel editorial-card">
            <div className="flex flex-col justify-between">
              <div>
                <p className="eyebrow">04 / Contact</p>
                <h2 className="section-title mt-5 text-[#101828]">Have a hard problem?</h2>
                <p className="mt-6 max-w-sm text-sm leading-6 text-[#667085]">Tell us what you want to make better. We&apos;ll bring the questions, structure, and a clear next step.</p>
              </div>
              <p className="contact-side-note mt-12">Typical response / 2 business days<br />hello@fidexa.org</p>
            </div>
            <form onSubmit={handleSubmit} className="rounded-xl bg-[#fffdf8] p-5 text-[#101828] sm:p-7">
              <p className="eyebrow">Project brief</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Input className="editorial-input" name="name" placeholder="Your name" aria-label="Your name" required disabled={sending} />
                <Input className="editorial-input" name="email" type="email" placeholder="Email address" aria-label="Email address" required disabled={sending} />
              </div>
              <Textarea className="editorial-input mt-3 min-h-[140px]" name="message" placeholder="What are you trying to make?" aria-label="What are you trying to make?" required disabled={sending} />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button type="submit" className="button-primary border-0 px-6" disabled={sending}>{sending ? "Sending…" : "Start a conversation ↗"}</Button>
                <button type="button" onClick={() => setChatOpen(true)} className="button-secondary min-h-[46px] border-[#101828]/15 px-4 text-[#101828]"><Sparkles size={14} /> Ask AI instead</button>
              </div>
              {status === "success" && <p aria-live="polite" className="mt-4 flex items-center gap-2 text-sm text-[#287c5d]"><CheckCircle size={16} /> Message sent. We&apos;ll be in touch.</p>}
              {status === "error" && <p aria-live="polite" className="mt-4 flex items-center gap-2 text-sm text-[#b13c36]"><AlertCircle size={16} /> Something went wrong. Please try again.</p>}
            </form>
          </div>
        </div>
      </section>
      <ChatModal open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
