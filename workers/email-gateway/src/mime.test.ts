import { describe, expect, it } from "vitest";
import { parseInboundMime } from "./mime";

describe("inbound MIME parsing", () => {
  it("preserves text/html and message threading headers", async () => {
    const raw = [
      "From: Customer <customer@example.com>",
      "To: hello@fidexa.org",
      "Subject: New request",
      "Message-ID: <message-1@example.com>",
      "In-Reply-To: <root@example.com>",
      "References: <root@example.com>",
      "Content-Type: multipart/alternative; boundary=mail",
      "",
      "--mail",
      "Content-Type: text/plain; charset=utf-8",
      "",
      "Hello from plain text",
      "--mail",
      "Content-Type: text/html; charset=utf-8",
      "",
      "<p>Hello from <strong>HTML</strong></p>",
      "--mail--",
      "",
    ].join("\r\n");

    const parsed = await parseInboundMime(new TextEncoder().encode(raw));
    expect(parsed.from).toContain("customer@example.com");
    expect(parsed.to).toContain("hello@fidexa.org");
    expect(parsed.subject).toBe("New request");
    expect(parsed.messageId).toBe("<message-1@example.com>");
    expect(parsed.inReplyTo).toBe("<root@example.com>");
    expect(parsed.text).toContain("Hello from plain text");
    expect(parsed.html).toContain("<strong>HTML</strong>");
  });
});
