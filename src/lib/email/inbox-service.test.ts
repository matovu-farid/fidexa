import { describe, expect, it } from "vitest";
import { buildSearchTerm } from "./inbox-service";
import { splitAddresses } from "./recipients";

describe("inbox query helpers", () => {
  it("normalizes recipient fields without accepting control characters", () => {
    expect(splitAddresses("One@example.com, two@example.com\n")).toEqual(["one@example.com", "two@example.com"]);
    expect(buildSearchTerm("  customer@example.com <script>  ")).toBe("customer@example.com script");
  });
});
