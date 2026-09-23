import { beforeEach, describe, expect, it, vi } from "vitest";
import { track as vercelTrack } from "@vercel/analytics";
import { trackAnalytics } from "./analytics";

vi.mock("@vercel/analytics", () => ({ track: vi.fn() }));

const mockedTrack = vi.mocked(vercelTrack);

beforeEach(() => {
  mockedTrack.mockReset();
});

describe("Vercel analytics adapter", () => {
  it("sends the named event without user supplied data", () => {
    trackAnalytics("hero_cta_clicked");

    expect(mockedTrack).toHaveBeenCalledOnce();
    expect(mockedTrack).toHaveBeenCalledWith("hero_cta_clicked");
  });

  it("keeps synchronous provider errors from escaping", () => {
    mockedTrack.mockImplementation(() => {
      throw new Error("analytics unavailable");
    });

    expect(() => trackAnalytics("contact_form_succeeded")).not.toThrow();
  });
});
