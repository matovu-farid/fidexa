import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("gives the SMS disclosure its own canonical URL", () => {
  const page = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

  expect(page).toContain('alternates: { canonical: "/sms" }');
});
