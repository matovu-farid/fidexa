import { describe, expect, it } from "vitest";
import { normalizeSubject, threadCandidates } from "./headers";

describe("email threading headers", () => {
  it("normalizes reply and forward prefixes for subject fallback", () => {
    expect(normalizeSubject("Re: Fwd:  Project launch ")).toBe("project launch");
  });

  it("prioritizes RFC reply headers before normalized subject", () => {
    expect(
      threadCandidates({
        messageId: "<new@example.com>",
        inReplyTo: "<parent@example.com>",
        references: "<root@example.com> <parent@example.com>",
        subject: "Re: Project launch",
      }),
    ).toEqual(["<parent@example.com>", "<root@example.com>", "project launch"]);
  });
});
