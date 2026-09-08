import { describe, expect, it } from "vitest";
import { parseServerConfig } from "./config";

describe("server configuration", () => {
  it("fails closed when required secrets are missing", () => {
    expect(() => parseServerConfig({})).toThrow(/DATABASE_URL/);
  });

  it("parses the admin allowlist and required service values", () => {
    const config = parseServerConfig({
      DATABASE_URL: "postgres://example",
      BETTER_AUTH_SECRET: "auth-secret-123456",
      BETTER_AUTH_URL: "https://fidexa.org",
      RESEND_API_KEY: "re_example",
      RESEND_WEBHOOK_SECRET: "whsec_example",
      INBOX_INGEST_SECRET: "ingest-secret-123456",
      INBOX_ATTACHMENT_SECRET: "attachment-secret-123456",
      CLEANUP_SECRET: "cleanup-secret-123456",
      FIDEXA_APP_URL: "https://fidexa.org",
      INBOX_WORKER_URL: "https://fidexa-email-gateway.example.workers.dev",
      FIDEXA_ADMIN_EMAILS: "admin@fidexa.org,owner@fidexa.org",
    });

    expect(config.adminEmails).toEqual(["admin@fidexa.org", "owner@fidexa.org"]);
    expect(config.fidexaAppUrl).toBe("https://fidexa.org");
  });
});
