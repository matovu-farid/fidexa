import { describe, expect, it } from "vitest";
import { isAdminEmail, parseServerConfig } from "./config";

const validConfig = {
  DATABASE_URL: "postgres://localhost/fidexa",
  BETTER_AUTH_SECRET: "a-secret-that-is-at-least-32-characters-long",
  BETTER_AUTH_URL: "https://fidexa.org",
  RESEND_API_KEY: "re_test_key",
  FIDEXA_APP_URL: "https://fidexa.org",
};

describe("admin configuration", () => {
  it("accepts any Fidexa address regardless of case or whitespace", () => {
    parseServerConfig(validConfig);

    expect(isAdminEmail(" FARID@FIDEXA.ORG ")).toBe(true);
    expect(isAdminEmail("admin@fidexa.org")).toBe(true);
  });

  it("rejects non-Fidexa and lookalike domains", () => {
    expect(isAdminEmail("other@example.com")).toBe(false);
    expect(isAdminEmail("admin@fidexa.org.evil")).toBe(false);
    expect(isAdminEmail("@fidexa.org")).toBe(false);
  });

  it("requires the auth and delivery configuration", () => {
    expect(() => parseServerConfig({ ...validConfig, BETTER_AUTH_SECRET: "short" })).toThrow();
  });
});
