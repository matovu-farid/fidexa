import { describe, expect, it } from "vitest";
import { BodyTooLargeError, boundedLimit, contentLengthWithinLimit, readTextWithinLimit } from "./limits";

describe("outreach limits", () => {
  it("bounds request bodies and pagination", () => {
    expect(contentLengthWithinLimit("256000")).toBe(true);
    expect(contentLengthWithinLimit("256001")).toBe(false);
    expect(boundedLimit("100")).toBe(100);
    expect(boundedLimit("101")).toBeNull();
  });

  it("stops a chunked body as soon as it exceeds its byte limit", async () => {
    let pulls = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulls += 1;
        controller.enqueue(new TextEncoder().encode("abc"));
      },
    });

    await expect(readTextWithinLimit(stream, 4)).rejects.toBeInstanceOf(BodyTooLargeError);
    expect(pulls).toBeLessThanOrEqual(2);
  });
});
