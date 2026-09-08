import { describe, expect, it } from "vitest";
import { boundReceivedAt } from "./received-at";

describe("inbound receipt timestamps", () => {
  it("clamps future timestamps to server receipt time", () => {
    const now = new Date("2026-08-29T12:00:00.000Z");
    expect(boundReceivedAt(new Date("2027-08-29T12:00:00.000Z"), now)).toEqual(now);
  });

  it("preserves a valid timestamp that is not in the future", () => {
    const receivedAt = new Date("2026-08-29T11:59:00.000Z");
    expect(boundReceivedAt(receivedAt, new Date("2026-08-29T12:00:00.000Z"))).toEqual(receivedAt);
  });

  it("clamps unexpectedly old timestamps to the bounded replay window", () => {
    const now = new Date("2026-08-29T12:00:00.000Z");
    expect(boundReceivedAt(new Date("2020-01-01T00:00:00.000Z"), now)).toEqual(new Date("2026-08-28T12:00:00.000Z"));
  });
});
