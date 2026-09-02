import { describe, expect, it } from "vitest";
import { sanitizeEmailHtml } from "./sanitize";

describe("email HTML sanitization", () => {
  it("removes scripts, forms, event handlers, and unsafe URLs", () => {
    const safe = sanitizeEmailHtml(
      '<p onclick="alert(1)">Hello</p><script>alert(1)</script><form action="https://evil.example"><input></form><a href="javascript:alert(1)">bad</a><a href="https://fidexa.org">good</a>',
    );

    expect(safe).toContain("Hello");
    expect(safe).toContain('href="https://fidexa.org"');
    expect(safe).not.toContain("script");
    expect(safe).not.toContain("onclick");
    expect(safe).not.toContain("<form");
    expect(safe).not.toContain("javascript:");
  });
});
