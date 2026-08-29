import { describe, expect, it } from "vitest";
import { filterAttachments, MAX_TOTAL_ATTACHMENT_BYTES } from "./attachments";

function attachment(overrides: Partial<Parameters<typeof filterAttachments>[0][number]> = {}) {
  return {
    filename: "brief.pdf",
    mimeType: "application/pdf",
    sizeBytes: 4,
    content: new Uint8Array([0x25, 0x50, 0x44, 0x46]).buffer,
    ...overrides,
  };
}

describe("inbound attachment policy", () => {
  it("rejects executable content even when its MIME type is disguised", () => {
    const result = filterAttachments([attachment({ filename: "brief.pdf", mimeType: "application/pdf", content: new Uint8Array([0x4d, 0x5a, 0x90, 0x00]).buffer })]);
    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toHaveLength(1);
  });

  it("rejects shell scripts even when their MIME type is disguised", () => {
    const content = new TextEncoder().encode("#!/bin/sh\necho unsafe").buffer;
    const result = filterAttachments([attachment({ content, sizeBytes: content.byteLength })]);
    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toHaveLength(1);
  });

  it("rejects unknown MIME types instead of trusting the sender", () => {
    const result = filterAttachments([attachment({ mimeType: "application/x-unknown" })]);
    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toHaveLength(1);
  });

  it("rejects executable extensions with trailing whitespace", () => {
    const result = filterAttachments([attachment({ filename: "script.js " })]);
    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toHaveLength(1);
  });

  it("enforces an aggregate attachment limit before storage", () => {
    const content = new Uint8Array(8 * 1024 * 1024).buffer;
    const result = filterAttachments([
      attachment({ sizeBytes: content.byteLength, content }),
      attachment({ filename: "second.pdf", sizeBytes: content.byteLength, content }),
    ]);
    expect(MAX_TOTAL_ATTACHMENT_BYTES).toBeLessThan(content.byteLength * 2);
    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toHaveLength(2);
  });
});
