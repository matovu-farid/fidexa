import { describe, expect, it } from "vitest";
import { getRetentionDates } from "./retention";

describe("email retention", () => {
  it("expires raw MIME after seven days and content after one year", () => {
    const receivedAt = new Date("2026-08-29T12:00:00.000Z");
    const dates = getRetentionDates(receivedAt);

    expect(dates.rawMimeExpiresAt.toISOString()).toBe("2026-09-05T12:00:00.000Z");
    expect(dates.contentExpiresAt.toISOString()).toBe("2027-08-29T12:00:00.000Z");
  });
});
