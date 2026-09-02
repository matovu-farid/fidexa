import type { UIMessage } from "ai";

function isUIMessage(value: unknown): value is UIMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as { id?: unknown; role?: unknown; parts?: unknown };
  return typeof message.id === "string"
    && (message.role === "system" || message.role === "user" || message.role === "assistant")
    && Array.isArray(message.parts);
}

export function parseChatMessages(input: unknown): UIMessage[] | null {
  if (!input || typeof input !== "object") return null;
  const messages = (input as { messages?: unknown }).messages;
  return Array.isArray(messages) && messages.every(isUIMessage) ? messages : null;
}
