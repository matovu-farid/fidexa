import { describe, expect, it } from "vitest";
import { isAdminEmail, parseServerConfig } from "./config";

describe("admin access policy", () => {
  it("allows only configured administrators", () => {
    const config = parseServerConfig({ DATABASE_URL: "postgres://example", BETTER_AUTH_SECRET: "auth-secret-123456", BETTER_AUTH_URL: "https://fidexa.org", RESEND_API_KEY: "re_example", RESEND_WEBHOOK_SECRET: "whsec_example", INBOX_INGEST_SECRET: "ingest-secret-123456", INBOX_ATTACHMENT_SECRET: "attachment-secret-123456", CLEANUP_SECRET: "cleanup-secret-123456", FIDEXA_APP_URL: "https://fidexa.org", INBOX_WORKER_URL: "https://gateway.example.workers.dev", FIDEXA_ADMIN_EMAILS: "Farid@fidexa.org" });
    expect(isAdminEmail("farid@fidexa.org", config)).toBe(true);
    expect(isAdminEmail("other@fidexa.org", config)).toBe(false);
  });
});
