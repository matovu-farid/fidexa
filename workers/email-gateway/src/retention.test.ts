import { describe, expect, it } from "vitest";
import { isObjectExpired } from "./retention";

describe("R2 retention", () => {
  it("uses the exact upload timestamp at the retention boundary", () => {
    const uploaded = new Date("2026-08-29T12:00:00.000Z");
    expect(isObjectExpired(uploaded, uploaded.getTime() + 24 * 60 * 60 * 1000, 1)).toBe(true);
    expect(isObjectExpired(uploaded, uploaded.getTime() + 24 * 60 * 60 * 1000 - 1, 1)).toBe(false);
  });
});
