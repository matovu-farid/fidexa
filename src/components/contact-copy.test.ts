import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("describes the AI handoff as conversation text, not a generated summary", () => {
  const contact = readFileSync(new URL("./contact.tsx", import.meta.url), "utf8");
  const chat = readFileSync(new URL("./chat-modal.tsx", import.meta.url), "utf8");

  expect(contact).toContain("Help shape my inquiry");
  expect(contact).not.toContain("Ask AI instead");
  expect(chat).toContain("A copy of your conversation is placed in the contact form only if you choose");
  expect(chat).toContain("Use conversation in contact form");
});

it("puts the full AI disclosure in a visible, described dialog before the conversation", () => {
  const contact = readFileSync(new URL("./contact.tsx", import.meta.url), "utf8");
  const chat = readFileSync(new URL("./chat-modal.tsx", import.meta.url), "utf8");
  const disclosure = chat.match(/<DialogDescription id="chat-privacy"[^>]*>([\s\S]*?)<\/DialogDescription>/)?.[1];

  expect(disclosure).toContain("sent to our AI service to generate replies");
  expect(disclosure).toContain("only if you choose");
  expect(disclosure).toContain("Nothing is sent as an inquiry until you review the form and submit it");
  expect(chat).toContain('aria-describedby="chat-purpose chat-privacy"');
  expect(chat.indexOf('id="chat-privacy"')).toBeLessThan(chat.indexOf('ref={scrollRef}'));
  expect(chat).not.toMatch(/<DialogDescription id="chat-privacy"[^>]*sr-only/);
  expect(contact).toContain("We use your name, email and message to reply to this inquiry.");
  expect(contact).not.toContain("conversation is sent to our AI service");
});

it("offers a message hint tied to the input without adding required fields", () => {
  const contact = readFileSync(new URL("./contact.tsx", import.meta.url), "utf8");

  expect(contact).toMatch(/<Textarea id="contact-message"[^>]*aria-describedby="contact-message-hint contact-privacy"/);
  expect(contact).toMatch(/<FieldDescription id="contact-message-hint"[^>]*>[^<]*problem[^<]*who[^<]*stage/);
  expect(contact.match(/\brequired\b/g)).toHaveLength(3);
});

it("announces a failed inquiry as an alert", () => {
  const contact = readFileSync(new URL("./contact.tsx", import.meta.url), "utf8");

  expect(contact).toMatch(/status === "error"[^\n]*<Alert variant="destructive"/);
  const errorAlert = contact.match(/status === "error"[\s\S]*?<\/Alert>/)?.[0];
  expect(errorAlert).toContain("Your entries are still here");
  expect(errorAlert).toContain("Send inquiry");
  expect(errorAlert).toContain('href="mailto:hello@fidexa.org"');
  expect(contact).toMatch(/contact-side-note[\s\S]*?href="mailto:hello@fidexa.org"/);
  expect(contact).toMatch(/if \(res.ok\) \{[\s\S]*?form.reset\(\);[\s\S]*?setMessage\(""\);[\s\S]*?\} else \{/);
  expect(contact.match(/form.reset\(\)/g)).toHaveLength(1);
  expect(contact.match(/setMessage\(""\)/g)).toHaveLength(1);
});

it("keeps handoff as transcript text and restores focus to the relevant contact control", () => {
  const chat = readFileSync(new URL("./chat-modal.tsx", import.meta.url), "utf8");

  expect(chat).toContain('message.id !== "fidexa-opening"');
  expect(chat).toContain('.slice(0, 6_000)');
  expect(chat).toContain('handoffRequested.current = true;');
  expect(chat).toContain('onUseSummary(`Notes from my Fidexa AI conversation:\\n${conversationText}`)');
  expect(chat).toContain('handoffRequested.current ? "contact-message" : "contact-ai-trigger"');
  expect(chat).toContain('handoffRequested.current = false;');
});

it("counts form starts from fields, not the AI button", () => {
  const contact = readFileSync(new URL("./contact.tsx", import.meta.url), "utf8");

  expect(contact).not.toContain("onFocusCapture=");
  expect(contact).toMatch(/id="contact-name"[^\n]*onFocus=\{markContactStarted\}/);
  expect(contact).toMatch(/id="contact-email"[^\n]*onFocus=\{markContactStarted\}/);
  expect(contact).toMatch(/id="contact-message"[^\n]*onFocus=\{markContactStarted\}/);
});
