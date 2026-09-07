import { describe, expect, it } from "vitest";
import {
  createTwilioSignature,
  formatSmsEmail,
  isValidTwilioSignature,
  parseTwilioSmsPayload,
} from "./twilio-sms";

const webhookUrl = "https://www.fidexa.org/api/webhooks/twilio/sms";
const authToken = "test-auth-token";
const params = new URLSearchParams({
  AccountSid: "AC123",
  Body: "Verification code: 123456",
  From: "+13465215391",
  MessageSid: "SM123",
  To: "+13024966237",
});

describe("Twilio SMS helpers", () => {
  it("creates and verifies the Twilio webhook signature", () => {
    const signature = createTwilioSignature(webhookUrl, params, authToken);

    expect(isValidTwilioSignature(webhookUrl, params, signature, authToken)).toBe(true);
    expect(isValidTwilioSignature(webhookUrl, params, "invalid", authToken)).toBe(false);
  });

  it("rejects a payload missing required Twilio fields", () => {
    const incomplete = new URLSearchParams({ From: "+13465215391" });

    expect(() => parseTwilioSmsPayload(incomplete, "2026-09-07T01:28:32.000Z")).toThrow(
      "Missing required Twilio field: MessageSid",
    );
  });

  it("parses a valid inbound SMS payload", () => {
    expect(parseTwilioSmsPayload(params, "2026-09-07T01:28:32.000Z")).toEqual({
      messageSid: "SM123",
      from: "+13465215391",
      to: "+13024966237",
      body: "Verification code: 123456",
      receivedAt: "2026-09-07T01:28:32.000Z",
    });
  });

  it("formats the SMS metadata and body for email delivery", () => {
    expect(
      formatSmsEmail({
        messageSid: "SM123",
        from: "+13465215391",
        to: "+13024966237",
        body: "Verification code: 123456",
        receivedAt: "2026-09-07T01:28:32.000Z",
      }),
    ).toBe(
      [
        "Inbound SMS received",
        "",
        "From: +13465215391",
        "To: +13024966237",
        "Received: 2026-09-07T01:28:32.000Z",
        "Message SID: SM123",
        "",
        "Message:",
        "Verification code: 123456",
      ].join("\n"),
    );
  });
});
