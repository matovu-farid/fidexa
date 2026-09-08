import { describe, expect, it } from "vitest";
import { isAdminEmail, parseServerConfig } from "./config";

const validConfig = {
  DATABASE_URL: "postgres://localhost/fidexa",
  BETTER_AUTH_SECRET: "a-secret-that-is-long-enough",
  BETTER_AUTH_URL: "https://fidexa.org",
  RESEND_API_KEY: "re_test_key",
  FIDEXA_APP_URL: "https://fidexa.org",
  FIDEXA_ADMIN_EMAILS: " Farid@Fidexa.org, admin@fidexa.org ",
};

describe("admin configuration", () => {
  it("normalizes the administrator allowlist", () => {
    const config = parseServerConfig(validConfig);

    expect(config.adminEmails).toEqual(["farid@fidexa.org", "admin@fidexa.org"]);
    expect(isAdminEmail(" FARID@FIDEXA.ORG ", config)).toBe(true);
    expect(isAdminEmail("other@example.com", config)).toBe(false);
  });

  it("requires the auth and delivery configuration", () => {
    expect(() => parseServerConfig({ ...validConfig, BETTER_AUTH_SECRET: "short" })).toThrow();
    expect(() => parseServerConfig({ ...validConfig, FIDEXA_ADMIN_EMAILS: "" })).toThrow();
  });
});
