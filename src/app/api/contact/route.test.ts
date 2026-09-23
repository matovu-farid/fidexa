import { beforeEach, describe, expect, it, vi } from "vitest";

const { send, ResendMock } = vi.hoisted(() => {
  const send = vi.fn();
  class ResendMock {
    emails = { send };
  }
  return { send, ResendMock };
});

const { checkRateLimit } = vi.hoisted(() => ({ checkRateLimit: vi.fn() }));

vi.mock("resend", () => ({ Resend: ResendMock }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit }));

import { POST } from "./route";

function request(body: unknown) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validContact = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "I need help improving an internal workflow.",
  website: "",
};

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    send.mockReset().mockResolvedValue({ data: { id: "email_123" }, error: null });
    checkRateLimit.mockReset().mockResolvedValue({ allowed: true, remaining: 4, resetAt: Date.now() + 60_000 });
  });

  it("delivers a valid inquiry and does not include the honeypot", async () => {
    const response = await POST(request(validContact));

    expect(response.status).toBe(200);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({
      replyTo: "ada@example.com",
      text: expect.stringContaining(validContact.message),
    }));
    expect(send.mock.calls[0][0].text).not.toContain("website");
    expect(checkRateLimit).toHaveBeenCalledWith(expect.any(Request), "contact");
  });

  it("rejects over quota inquiries before sending email", async () => {
    checkRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetAt: Date.now() + 60_000 });

    const response = await POST(request(validContact));

    expect(response.status).toBe(429);
    expect(send).not.toHaveBeenCalled();
  });

  it("silently accepts a filled honeypot without delivering an email", async () => {
    const response = await POST(request({ ...validContact, website: "spam.test" }));

    expect(response.status).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects invalid or oversized fields without delivering an email", async () => {
    const response = await POST(request({ ...validContact, email: "bad", message: "x".repeat(10_001) }));

    expect(response.status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects oversized request bodies even when content-length is absent", async () => {
    const response = await POST(request({ ...validContact, extra: "x".repeat(12_000) }));

    expect(response.status).toBe(413);
    expect(send).not.toHaveBeenCalled();
  });

  it("reports delivery failures", async () => {
    send.mockResolvedValue({ data: null, error: { message: "provider unavailable" } });

    const response = await POST(request(validContact));

    expect(response.status).toBe(500);
  });

  it("reports unavailable contact delivery when the API key is missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");

    const response = await POST(request(validContact));

    expect(response.status).toBe(503);
    expect(send).not.toHaveBeenCalled();
  });
});
