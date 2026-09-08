import * as authSchema from "./auth-schema";
import { describe, expect, it } from "vitest";

describe("Better Auth Drizzle schema", () => {
  it("exports the required model names", () => {
    expect(authSchema).toEqual(expect.objectContaining({
      user: expect.anything(),
      session: expect.anything(),
      account: expect.anything(),
      verification: expect.anything(),
    }));
  });
});
