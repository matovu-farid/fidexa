import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAdminSession: vi.fn(),
  readOutreachSummary: vi.fn(),
  readOutreachCompanies: vi.fn(),
  readOutreachMessages: vi.fn(),
  readOutreachFollowUps: vi.fn(),
  readOutreachCompany: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: vi.fn(async () => new Headers()) }));
vi.mock("@/lib/auth", () => ({ getAdminSession: mocks.getAdminSession }));
vi.mock("@/lib/outreach-dashboard", () => ({ getBoundedOutreachCompanyId: (value: string | null) => {
  const id = value?.trim();
  return id && id.length <= 200 ? id : null;
} }));
vi.mock("@/lib/outreach-reader", () => ({
  readOutreachSummary: mocks.readOutreachSummary,
  readOutreachCompanies: mocks.readOutreachCompanies,
  readOutreachMessages: mocks.readOutreachMessages,
  readOutreachFollowUps: mocks.readOutreachFollowUps,
  readOutreachCompany: mocks.readOutreachCompany,
}));

import { GET } from "./route";

describe("admin outreach proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAdminSession.mockResolvedValue({ user: { email: "admin@fidexa.org" } });
    mocks.readOutreachSummary.mockResolvedValue({ companies: [], drafts: [], messages: [] });
    mocks.readOutreachCompanies.mockResolvedValue({ items: [], limit: 100, offset: 0 });
    mocks.readOutreachMessages.mockResolvedValue({ items: [], limit: 25, offset: 0 });
    mocks.readOutreachFollowUps.mockResolvedValue({ items: [], limit: 25, offset: 0 });
    mocks.readOutreachCompany.mockResolvedValue({ company: { id: "company-1" } });
  });

  it("rejects unauthenticated reads", async () => {
    mocks.getAdminSession.mockResolvedValueOnce(null);
    const response = await GET(new Request("https://fidexa.org/api/admin/outreach"));
    expect(response.status).toBe(401);
    expect(mocks.readOutreachSummary).not.toHaveBeenCalled();
  });

  it("forwards a bounded authenticated company drill-down", async () => {
    const response = await GET(new Request("https://fidexa.org/api/admin/outreach?company=%20company-1%20"));
    expect(response.status).toBe(200);
    expect(mocks.readOutreachCompany).toHaveBeenCalledWith("company-1");
    await expect(response.json()).resolves.toMatchObject({ company: { company: { id: "company-1" } } });
  });

  it("rejects empty and overlong company selectors before reading the Worker", async () => {
    const empty = await GET(new Request("https://fidexa.org/api/admin/outreach?company="));
    const long = await GET(new Request(`https://fidexa.org/api/admin/outreach?company=${"x".repeat(201)}`));
    expect(empty.status).toBe(400);
    expect(long.status).toBe(400);
    expect(mocks.readOutreachCompany).not.toHaveBeenCalled();
  });
});
