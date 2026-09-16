import { describe, expect, it } from "vitest";
import { signRequest, verifyRequestSignature } from "./signatures";

describe("request signatures", () => {
  it("verifies a fresh signed request", async () => {
    const body = JSON.stringify({ tool: "create_company" });
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = await signRequest("secret", timestamp, body);

    await expect(verifyRequestSignature({
      secret: "secret",
      timestamp,
      body,
      signature,
      nowSeconds: timestamp,
    })).resolves.toBe(true);
  });

  it("rejects tampered and stale requests", async () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = await signRequest("secret", timestamp, "body");

    await expect(verifyRequestSignature({
      secret: "secret",
      timestamp,
      body: "tampered",
      signature,
      nowSeconds: timestamp,
    })).resolves.toBe(false);

    await expect(verifyRequestSignature({
      secret: "secret",
      timestamp,
      body: "body",
      signature,
      nowSeconds: timestamp + 301,
    })).resolves.toBe(false);
  });
});
