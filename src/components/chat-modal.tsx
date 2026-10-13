"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { X, Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { trackAnalytics, trackChatMessageSubmitted } from "@/lib/analytics";

const CHAT_TRANSPORT = new DefaultChatTransport({ api: "/api/chat" });
const INITIAL_MESSAGES: UIMessage[] = [
  {
    id: "fidexa-opening",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "Hi — I’m Fidexa’s project guide. I’ll help clarify what you’re trying to build, who it serves, and the most useful next step. What problem are you trying to solve, and who experiences it today?",
      },
    ],
  },
];

export function ChatModal({
  open,
  onClose,
  onUseSummary,
}: {
  open: boolean;
  onClose: () => void;
  onUseSummary: (summary: string) => void;
}) {
  const { messages, sendMessage, status, error } = useChat({
    transport: CHAT_TRANSPORT,
    messages: INITIAL_MESSAGES,
  });
  const [input, setInput] = useState("");
  const isLoading = status === "streaming" || status === "submitted";
  const scrollRef = useRef<HTMLDivElement>(null);
  const handoffRequested = useRef(false);
  const conversationText = messages
    .filter((message) => message.id !== "fidexa-opening")
    .map((message) => {
      const text = message.parts.filter((part) => part.type === "text").map((part) => part.type === "text" ? part.text : "").join("").trim();
      return text ? `${message.role === "user" ? "You" : "Fidexa AI"}: ${text}` : "";
    })
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 6_000);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function submitMessage(event: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    trackChatMessageSubmitted(messages.filter((message) => message.role === "user").length + 1);
    setInput("");
    void sendMessage({ text });
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent className="chat-panel flex gap-0 p-0" aria-describedby="chat-purpose chat-privacy" showCloseButton={false} onCloseAutoFocus={(event) => {
        event.preventDefault();
        document.getElementById(handoffRequested.current ? "contact-message" : "contact-ai-trigger")?.focus();
        handoffRequested.current = false;
      }}>
        <div className="chat-panel-header">
          <div className="flex items-center gap-3"><Bot className="size-5 shrink-0" /><div>
            <DialogTitle>Fidexa AI</DialogTitle>
            <DialogDescription id="chat-purpose" className="mt-2">Shape your inquiry by exploring the problem, users and possible next steps.</DialogDescription>
          </div></div>
          <DialogClose asChild><Button type="button" size="icon-lg" variant="ghost" className="min-h-11 min-w-11" aria-label="Close Fidexa AI"><X /></Button></DialogClose>
        </div>
        <DialogDescription id="chat-privacy" className="chat-panel-note mt-3">Your conversation is sent to our AI service to generate replies. A copy of your conversation is placed in the contact form only if you choose “Use conversation in contact form”. Nothing is sent as an inquiry until you review the form and submit it.</DialogDescription>
        <div ref={scrollRef} className="chat-panel-body" aria-live="polite">
          {messages.map((msg) => <div key={msg.id} className={`chat-message ${msg.role === "user" ? "chat-message-user" : ""}`}>
            {msg.role === "assistant" && <div className="chat-message-avatar" aria-hidden="true"><Bot size={14} /></div>}
            <div className="chat-message-body">
              {msg.role === "assistant" ? <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p> }}>
                {msg.parts.filter((part) => part.type === "text").map((part) => part.type === "text" ? part.text : "").join("")}
              </ReactMarkdown> : msg.parts.filter((part) => part.type === "text").map((part) => part.type === "text" ? part.text : "").join("")}
            </div>
            {msg.role === "user" && <div className="chat-message-avatar" aria-hidden="true"><User size={14} /></div>}
          </div>)}
          {isLoading && <p role="status" className="mb-4 text-sm text-muted-foreground">Thinking…</p>}
          {error && <Alert variant="destructive" className="mb-4"><AlertDescription>The chat could not complete that response. Please try again.</AlertDescription></Alert>}
          {conversationText && !isLoading && <Button type="button" variant="outline" className="min-h-11 max-w-full whitespace-normal" onClick={() => {
            trackAnalytics("ai_handoff_requested");
            handoffRequested.current = true;
            onUseSummary(`Notes from my Fidexa AI conversation:\n${conversationText}`);
          }}>Use conversation in contact form</Button>}
        </div>
        <form onSubmit={submitMessage} className="chat-panel-form">
          <Field className="gap-0"><FieldLabel htmlFor="chat-message" className="sr-only">Describe your project idea</FieldLabel>
            <Textarea id="chat-message" value={input} onChange={(event) => setInput(event.target.value)} name="message" placeholder="Describe your project idea..." onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) submitMessage(event); }} />
          </Field>
          <Button type="submit" size="icon-lg" className="min-h-12 min-w-12" aria-label="Send message" disabled={isLoading || !input.trim()}><Send /></Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
