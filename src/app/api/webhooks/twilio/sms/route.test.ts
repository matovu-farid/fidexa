import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTwilioSignature } from "../../../../../lib/twilio-sms";

const { send, ResendMock } = vi.hoisted(() => {
  const send = vi.fn();
  class ResendMock {
    emails = { send };
  }
  return { send, ResendMock };
});

vi.mock("resend", () => ({
  Resend: ResendMock,
}));

import { POST } from "./route";

const webhookUrl = "https://www.fidexa.org/api/webhooks/twilio/sms";
const authToken = "test-auth-token";

function createPayload() {
  return new URLSearchParams({
    AccountSid: "AC123",
    Body: "Verification code: 123456",
    From: "+13465215391",
    MessageSid: "SM123",
    To: "+13024966237",
  });
}

function createRequest(payload = createPayload(), signature = createTwilioSignature(webhookUrl, payload, authToken)) {
  return new Request(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Twilio-Signature": signature,
    },
    body: payload,
  });
}

describe("POST /api/webhooks/twilio/sms", () => {
  beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("TWILIO_AUTH_TOKEN", authToken);
    vi.stubEnv("TWILIO_WEBHOOK_URL", webhookUrl);
    vi.stubEnv("SMS_FORWARD_EMAIL", "farid@fidexa.org");
    send.mockReset();
  });

  it("rejects an invalid Twilio signature without sending email", async () => {
    const response = await POST(createRequest(createPayload(), "invalid"));

    expect(response.status).toBe(401);
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects a malformed Twilio payload without sending email", async () => {
    const payload = new URLSearchParams({ From: "+13465215391" });
    const response = await POST(createRequest(payload));

    expect(response.status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it("emails a valid inbound SMS and returns empty TwiML", async () => {
    send.mockResolvedValue({ data: { id: "email_123" }, error: null });

    const response = await POST(createRequest());

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/xml");
    expect(await response.text()).toBe("<Response></Response>");
    expect(send).toHaveBeenCalledWith({
      from: "Fidexa SMS <contact@fidexa.org>",
      to: "farid@fidexa.org",
      subject: "Inbound SMS from +13465215391",
      text: expect.stringContaining("Verification code: 123456"),
    });
  });

  it("returns a bad gateway response when Resend fails", async () => {
    send.mockResolvedValue({ data: null, error: { message: "provider unavailable" } });

    const response = await POST(createRequest());

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "Failed to deliver SMS email" });
  });
});
