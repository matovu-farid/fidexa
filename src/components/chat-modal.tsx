"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ChatModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { messages, input, handleInputChange, handleSubmit, status } =
    useChat({ api: "/api/chat" });
  const isLoading = status === "streaming" || status === "submitted";
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative flex h-[80vh] w-full max-w-lg flex-col rounded-2xl border border-white/[0.1] bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center gap-2">
            <Bot size={18} className="text-muted-foreground" />
            <span className="text-sm font-medium">Fidexa AI</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Bot size={32} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Tell us about your project
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Our AI will help scope your idea and suggest next steps.
                </p>
              </div>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-4 flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04]">
                  <Bot size={14} className="text-muted-foreground" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-foreground text-background"
                    : "bg-white/[0.04] text-foreground"
                }`}
              >
                {msg.role === "assistant" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
              {msg.role === "user" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground">
                  <User size={14} className="text-background" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="mb-4 flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04]">
                <Bot size={14} className="text-muted-foreground" />
              </div>
              <div className="rounded-xl bg-white/[0.04] px-4 py-2.5 text-sm text-muted-foreground">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-white/[0.06] px-4 py-3"
        >
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Describe your project idea..."
              className="min-h-[44px] max-h-[120px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send size={16} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
