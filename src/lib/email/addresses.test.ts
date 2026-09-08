import { describe, expect, it } from "vitest";
import { INBOUND_ALIASES, isInboundAlias, isOutboundAlias } from "./addresses";

describe("Fidexa email aliases", () => {
  it("accepts exactly the approved inbound aliases", () => {
    expect(INBOUND_ALIASES).toEqual([
      "hello@fidexa.org",
      "sales@fidexa.org",
      "support@fidexa.org",
      "info@fidexa.org",
      "faridmatovu@fidexa.org",
    ]);
    expect(isInboundAlias("hello@fidexa.org")).toBe(true);
    expect(isInboundAlias("random@fidexa.org")).toBe(false);
    expect(isInboundAlias("hello@sub.fidexa.org")).toBe(false);
  });

  it("rejects personal and display-name sender tricks", () => {
    expect(isOutboundAlias("support@fidexa.org")).toBe(true);
    expect(isOutboundAlias("matovu90@gmail.com")).toBe(false);
    expect(isOutboundAlias("Support <support@fidexa.org>")).toBe(false);
    expect(isOutboundAlias("support@fidexa.org.evil.example")).toBe(false);
  });
});
