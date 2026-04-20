"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
import { ChatModal } from "./chat-modal";

export function Contact() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <section id="contact" className="border-t border-white/[0.06] px-6 py-24">
        <div className="mx-auto max-w-xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Get in Touch
          </p>
          <h2 className="mb-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Let&apos;s build something great
          </h2>
          <p className="mb-10 text-sm text-muted-foreground">
            Tell us about your project and we&apos;ll get back to you.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              console.log("Contact form:", Object.fromEntries(data));
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="name" placeholder="Name" required />
              <Input name="email" type="email" placeholder="Email" required />
            </div>
            <Textarea
              name="message"
              placeholder="Your message..."
              className="min-h-[120px]"
              required
            />
            <div className="flex items-center gap-3">
              <Button type="submit" className="px-6">
                Send Message
              </Button>
              <button
                type="button"
                onClick={() => setChatOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-white/[0.1] px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-white/[0.2] hover:text-foreground"
              >
                <Sparkles size={14} />
                Ask AI instead
              </button>
            </div>
          </form>
        </div>
      </section>
      <ChatModal open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
