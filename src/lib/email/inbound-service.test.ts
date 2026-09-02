import { describe, expect, it } from "vitest";
import { buildInboundRecord } from "./inbound-service";

describe("inbound message normalization", () => {
  it("builds a one-year message record with raw MIME recovery expiry", () => {
    const result = buildInboundRecord({
      idempotencyKey: "worker-1",
      messageId: "<message-1@example.com>",
      inReplyTo: "<parent@example.com>",
      references: "<root@example.com> <parent@example.com>",
      fromAddress: "maya@example.com",
      toAddresses: ["hello@fidexa.org"],
      subject: "Re: Project launch",
      textBody: "Let us talk.",
      sanitizedHtml: "<p>Let us talk.</p>",
      receivedAt: new Date("2026-08-29T12:00:00.000Z"),
      rawMimeKey: "raw/worker-1.eml",
      rawMimeExpiresAt: new Date("2026-09-05T12:00:00.000Z"),
      attachments: [],
    });

    expect(result.direction).toBe("inbound");
    expect(result.status).toBe("received");
    expect(result.threadCandidates).toEqual(["<parent@example.com>", "<root@example.com>", "project launch"]);
    expect(result.contentExpiresAt.toISOString()).toBe("2027-08-29T12:00:00.000Z");
  });
});
