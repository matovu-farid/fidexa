import { describe, expect, it } from "vitest";
import { prepareOutboundMessage } from "./outbound-service";

describe("outbound message preparation", () => {
  it("restricts sender identities and preserves reply threading", () => {
    expect(prepareOutboundMessage({ fromAddress: "hello@fidexa.org", to: "Customer <customer@example.com>", subject: "Re: Help", textBody: "Thanks", inReplyTo: "<parent@example.com>", references: "<root@example.com>" })).toMatchObject({ fromAddress: "hello@fidexa.org", subject: "Re: Help", headers: { "In-Reply-To": "<parent@example.com>", References: "<root@example.com>" } });
  });
  it("rejects an unverified sender", () => expect(() => prepareOutboundMessage({ fromAddress: "attacker@example.com", to: "customer@example.com", subject: "Hi", textBody: "x" })).toThrow());
});
