import { describe, expect, it } from "vitest";

import { parseChatMessages } from "./request";

describe("parseChatMessages", () => {
  it("returns only a valid UI message payload", () => {
    const messages = [{ id: "message-1", role: "user", parts: [{ type: "text", text: "Hello" }] }];

    expect(parseChatMessages({ messages })).toEqual(messages);
    expect(parseChatMessages({ messages: [{ role: "user", parts: [] }] })).toBeNull();
    expect(parseChatMessages({ messages: "not-an-array" })).toBeNull();
  });
});
