import { beforeEach, describe, expect, it, vi } from "vitest";
import posthog from "posthog-js";
import { syncPostHogIdentity } from "./posthog-identity";

vi.mock("posthog-js", () => ({ default: {
  identify: vi.fn(),
  reset: vi.fn(),
  get_property: vi.fn(),
} }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", "phc_test");
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "https://us.i.posthog.com");
});

describe("PostHog authenticated identity", () => {
  it("identifies a signed-in administrator with the wizard's properties", () => {
    syncPostHogIdentity({ id: "user-1", email: "admin@example.com", name: "Admin" });

    expect(posthog.identify).toHaveBeenCalledWith("user-1", {
      email: "admin@example.com", name: "Admin",
    });
  });

  it("clears a persisted identity when the session has expired", () => {
    vi.mocked(posthog.get_property).mockReturnValue("user-1");

    syncPostHogIdentity(null);

    expect(posthog.reset).toHaveBeenCalledOnce();
  });

  it("does not reset an anonymous visitor", () => {
    vi.mocked(posthog.get_property).mockReturnValue(undefined);

    syncPostHogIdentity(null);

    expect(posthog.reset).not.toHaveBeenCalled();
  });
});
