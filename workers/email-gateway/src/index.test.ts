import { describe, expect, it, vi } from "vitest";
import { createSignedRequest, handleInboundEmail, isAllowedRecipient } from "./index";

describe("email gateway", () => {
  it("allows only the five configured Fidexa aliases", () => {
    expect(isAllowedRecipient("HELLO@FIDEXA.ORG")).toBe(true);
    expect(isAllowedRecipient("random@fidexa.org")).toBe(false);
    expect(isAllowedRecipient("hello@other.example")).toBe(false);
  });

  it("forwards independently while ingesting", async () => {
    const raw = new TextEncoder().encode([
      "From: customer@example.com",
      "To: hello@fidexa.org",
      "Subject: Hello",
      "Message-ID: <abc@example.com>",
      "Content-Type: text/plain",
      "",
      "Hi",
    ].join("\r\n"));
    const forward = vi.fn(async () => ({ success: true }));
    const fetch = vi.fn(async () => new Response("ok", { status: 202 }));
    const ctx = { waitUntil: vi.fn() } as unknown as ExecutionContext;
    const env = {
      FIDEXA_APP_URL: "https://fidexa.org",
      GMAIL_FORWARD_TO: "matovu90@gmail.com",
      INBOX_INGEST_SECRET: "ingest-secret-123456",
      INBOX_BUCKET: { put: vi.fn(async () => undefined) },
    } as never;

    await handleInboundEmail({
      from: "customer@example.com",
      to: "hello@fidexa.org",
      headers: new Headers({ subject: "Hello", "message-id": "<abc@example.com>" }),
      raw: new ReadableStream({ start(controller) { controller.enqueue(raw); controller.close(); } }),
      rawSize: raw.byteLength,
      canBeForwarded: true,
      forward,
      setReject: vi.fn(),
    } as never, env, ctx, fetch);

    expect(forward).toHaveBeenCalledWith("matovu90@gmail.com");
    expect(fetch).toHaveBeenCalledWith("https://fidexa.org/api/inbox/ingest", expect.objectContaining({ method: "POST" }));
  });

  it("signs the timestamped request body", async () => {
    const signed = await createSignedRequest("{}", "secret-123456", 1700000000);
    expect(signed.headers.get("x-inbox-timestamp")).toBe("1700000000");
    expect(signed.headers.get("x-inbox-signature")).toMatch(/^v1=/);
  });
});
