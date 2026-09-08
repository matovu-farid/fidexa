import { describe, expect, it } from "vitest";
import { signPayload, verifyPayloadSignature } from "./signatures";

describe("signed inbox payloads", () => {
  it("accepts a fresh signature and rejects a tampered body", async () => {
    const body = JSON.stringify({ idempotencyKey: "msg-1" });
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = await signPayload(body, "ingest-secret-123456", timestamp);

    await expect(
      verifyPayloadSignature({ body, timestamp, signature, secret: "ingest-secret-123456" }),
    ).resolves.toBe(true);
    await expect(
      verifyPayloadSignature({ body: `${body}!`, timestamp, signature, secret: "ingest-secret-123456" }),
    ).resolves.toBe(false);
  });

  it("rejects stale timestamps", async () => {
    const timestamp = (Math.floor(Date.now() / 1000) - 601).toString();
    const body = "{}";
    const signature = await signPayload(body, "ingest-secret-123456", timestamp);

    await expect(
      verifyPayloadSignature({ body, timestamp, signature, secret: "ingest-secret-123456" }),
    ).resolves.toBe(false);
  });
});
