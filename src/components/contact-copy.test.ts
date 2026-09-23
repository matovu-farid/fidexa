import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("describes the AI handoff as conversation text, not a generated summary", () => {
  const contact = readFileSync(new URL("./contact.tsx", import.meta.url), "utf8");
  const chat = readFileSync(new URL("./chat-modal.tsx", import.meta.url), "utf8");

  expect(contact).toContain("A copy of your conversation is placed in this form");
  expect(chat).toContain("Use conversation in contact form");
});

it("announces a failed inquiry as an alert", () => {
  const contact = readFileSync(new URL("./contact.tsx", import.meta.url), "utf8");

  expect(contact).toMatch(/status === "error"[^\n]*<p role="alert"/);
});
