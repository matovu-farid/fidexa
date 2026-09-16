import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getAdminSession: vi.fn(), readOutreachEvidence: vi.fn() }));

vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock("@/lib/auth", () => ({ getAdminSession: mocks.getAdminSession }));
vi.mock("@/lib/outreach-reader", () => ({ readOutreachEvidence: mocks.readOutreachEvidence }));

import { GET } from "./route";

describe("admin outreach evidence proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAdminSession.mockResolvedValue({ user: { email: "admin@fidexa.org" } });
    mocks.readOutreachEvidence.mockResolvedValue(new Response("captured evidence", { headers: { "content-type": "text/plain" } }));
  });

  it("rejects an unauthenticated evidence read", async () => {
    mocks.getAdminSession.mockResolvedValueOnce(null);
    const response = await GET(new Request("https://fidexa.org/api/admin/outreach/evidence/evidence-1"), { params: Promise.resolve({ id: "evidence-1" }) });
    expect(response.status).toBe(401);
    expect(mocks.readOutreachEvidence).not.toHaveBeenCalled();
  });

  it("forwards a bounded authenticated evidence id without exposing Worker credentials", async () => {
    const response = await GET(new Request("https://fidexa.org/api/admin/outreach/evidence/evidence-1"), { params: Promise.resolve({ id: "evidence-1" }) });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("captured evidence");
    expect(mocks.readOutreachEvidence).toHaveBeenCalledWith("evidence-1");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("rejects overlong evidence ids before forwarding", async () => {
    const response = await GET(new Request("https://fidexa.org/api/admin/outreach/evidence/long"), { params: Promise.resolve({ id: "x".repeat(201) }) });
    expect(response.status).toBe(404);
    expect(mocks.readOutreachEvidence).not.toHaveBeenCalled();
  });
});
