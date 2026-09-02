import { describe, expect, it } from "vitest";

import { parseThreadAction } from "./thread-actions";

describe("parseThreadAction", () => {
  it("accepts only supported thread actions", () => {
    expect(parseThreadAction({ action: "archive" })).toBe("archive");
    expect(parseThreadAction({ action: "read" })).toBe("read");
    expect(parseThreadAction({ action: "delete" })).toBeNull();
    expect(parseThreadAction(undefined)).toBeNull();
  });
});
