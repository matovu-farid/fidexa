import { describe, expect, it } from "vitest";
import { createAttachmentToken, verifyAttachmentToken } from "./attachment-token";

describe("attachment tokens", () => {
  it("round-trips a private attachment and rejects tampering or expiry", async () => {
    const token = await createAttachmentToken({ id: "attachment-id", storageKey: "attachments/2026-08-29/object", filename: "brief.pdf", expiresAt: 2_000 }, "test-secret");
    expect(await verifyAttachmentToken(token, "test-secret", 1_000)).toMatchObject({ id: "attachment-id", storageKey: "attachments/2026-08-29/object" });
    expect(await verifyAttachmentToken(`${token}x`, "test-secret", 1_000)).toBeNull();
    expect(await verifyAttachmentToken(token, "test-secret", 2_000)).toBeNull();
  });
});
