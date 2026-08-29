import { describe, expect, it } from "vitest";
import { isIdempotencyWindowExpired, isResendConcurrencyConflict, isSameOutboundMessage } from "./outbound-idempotency";

describe("outbound idempotency", () => {
  it("recognizes a retry of the same outbound request", () => {
    const request = {
      fromAddress: "hello@fidexa.org",
      toAddresses: ["customer@example.com"],
      ccAddresses: [],
      bccAddresses: [],
      subject: "Re: Project launch",
      textBody: "Let us talk.",
      sanitizedHtml: "",
      inReplyTo: "<message@example.com>",
      references: "<message@example.com>",
      threadId: "thread-1",
      draftId: "draft-1",
    };

    expect(isSameOutboundMessage(request, { ...request })).toBe(true);
    expect(isSameOutboundMessage(request, { ...request, textBody: "Changed" })).toBe(false);
    expect(isSameOutboundMessage(request, { ...request, threadId: "thread-2" })).toBe(false);
    expect(isSameOutboundMessage(request, { ...request, draftId: "draft-2" })).toBe(false);
  });

  it("recognizes the provider retry window and concurrency response", () => {
    const createdAt = new Date("2026-08-28T12:00:00.000Z");
    expect(isIdempotencyWindowExpired(createdAt, new Date("2026-08-29T11:59:59.000Z"))).toBe(false);
    expect(isIdempotencyWindowExpired(createdAt, new Date("2026-08-29T12:00:00.000Z"))).toBe(true);
    expect(isResendConcurrencyConflict({ name: "concurrent_idempotent_requests" })).toBe(true);
    expect(isResendConcurrencyConflict({ name: "invalid_idempotent_request" })).toBe(false);
  });
});
