import { beforeEach, describe, expect, it, vi } from "vitest";

const { convertToModelMessages, createUIMessageStreamResponse, streamText, toUIMessageStream, openai } = vi.hoisted(() => ({
  convertToModelMessages: vi.fn(),
  createUIMessageStreamResponse: vi.fn(),
  streamText: vi.fn(),
  toUIMessageStream: vi.fn(),
  openai: vi.fn(),
}));
const { checkRateLimit } = vi.hoisted(() => ({ checkRateLimit: vi.fn() }));

vi.mock("@ai-sdk/openai", () => ({ openai }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit }));
vi.mock("ai", async (importOriginal) => ({
  ...await importOriginal<typeof import("ai")>(),
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
}));

import { POST } from "./route";

const textMessage = {
  id: "user-1",
  role: "user",
  parts: [{ type: "text", text: "I want to improve an inventory workflow." }],
};

function request(body: string | unknown) {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.stubEnv("OPENAI_CHAT_MODEL", "test-model");
    convertToModelMessages.mockReset().mockResolvedValue([{ role: "user", content: "hello" }]);
    streamText.mockReset().mockReturnValue({ stream: "model-stream" });
    toUIMessageStream.mockReset().mockReturnValue("ui-stream");
    createUIMessageStreamResponse.mockReset().mockReturnValue(new Response("streaming", { status: 200 }));
    openai.mockReset().mockReturnValue("test-model-instance");
    checkRateLimit.mockReset().mockResolvedValue({ allowed: true, remaining: 19, resetAt: Date.now() + 60_000 });
  });

  it("accepts valid AI SDK UI messages and returns the normal UI stream", async () => {
    const response = await POST(request({ id: "chat-1", trigger: "submit", messageId: "user-1", messages: [textMessage] }));

    expect(response.status).toBe(200);
    expect(checkRateLimit).toHaveBeenCalledWith(expect.any(Request), "chat");
    expect(convertToModelMessages).toHaveBeenCalledWith([textMessage]);
    expect(streamText).toHaveBeenCalledWith(expect.objectContaining({ messages: [{ role: "user", content: "hello" }] }));
    expect(createUIMessageStreamResponse).toHaveBeenCalledWith({ stream: "ui-stream" });
  });

  it("rejects over quota chats before invoking the model", async () => {
    checkRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetAt: Date.now() + 60_000 });

    const response = await POST(request({ id: "chat-1", trigger: "submit", messageId: "user-1", messages: [textMessage] }));

    expect(response.status).toBe(429);
    expect(streamText).not.toHaveBeenCalled();
  });

  it("returns temporary unavailable when durable rate limiting is unavailable", async () => {
    checkRateLimit.mockResolvedValue({ allowed: false, unavailable: true, remaining: 0, resetAt: Date.now() + 60_000 });

    const response = await POST(request({ id: "chat-1", trigger: "submit", messageId: "user-1", messages: [textMessage] }));

    expect(response.status).toBe(503);
    expect(streamText).not.toHaveBeenCalled();
  });

  it("returns a safe 400 for malformed JSON without calling the model", async () => {
    const response = await POST(request("{"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid chat request" });
    expect(streamText).not.toHaveBeenCalled();
  });

  it("rejects oversized bodies before converting messages or calling the model", async () => {
    const response = await POST(request({ messages: [{ ...textMessage, parts: [{ type: "text", text: "x".repeat(140_000) }] }] }));

    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ error: "Chat request is too large" });
    expect(convertToModelMessages).not.toHaveBeenCalled();
    expect(streamText).not.toHaveBeenCalled();
  });

  it("rejects excessive message arrays before converting messages or calling the model", async () => {
    const response = await POST(request({ messages: Array.from({ length: 41 }, (_, index) => ({ ...textMessage, id: `user-${index}` })) }));

    expect(response.status).toBe(400);
    expect(convertToModelMessages).not.toHaveBeenCalled();
    expect(streamText).not.toHaveBeenCalled();
  });

  it("rejects malformed UI messages before calling the model", async () => {
    const response = await POST(request({ messages: [{ id: "bad", role: "visitor", parts: [{ type: "text", text: "hello" }] }] }));

    expect(response.status).toBe(400);
    expect(convertToModelMessages).not.toHaveBeenCalled();
    expect(streamText).not.toHaveBeenCalled();
  });
});
