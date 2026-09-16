import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { isSafeExternalUrl, readOutreachCompany, readOutreachEvidence, readOutreachSummary } from "./outreach-reader";

describe("outreach reader", () => {
  beforeEach(() => {
    vi.stubEnv("DATABASE_URL", "postgres://localhost/fidexa");
    vi.stubEnv("BETTER_AUTH_SECRET", "a-secret-that-is-at-least-32-characters-long");
    vi.stubEnv("BETTER_AUTH_URL", "https://fidexa.org");
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("FIDEXA_APP_URL", "https://fidexa.org");
    vi.stubEnv("OUTREACH_WORKER_URL", "https://outreach.example");
    vi.stubEnv("OUTREACH_READ_SECRET", "read-secret");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ companies: [], drafts: [], messages: [] }), { status: 200 })));
  });

  it("uses the server-side read capability", async () => {
    await readOutreachSummary();
    expect(fetch).toHaveBeenCalledWith(expect.any(Request), expect.objectContaining({ headers: expect.any(Headers) }));
    const [, init] = vi.mocked(fetch).mock.calls[0] ?? [];
    expect((init?.headers as Headers).get("x-fidexa-read-signature")).toMatch(/^[a-f0-9]{64}$/);
    expect((init?.headers as Headers).get("x-fidexa-read-request-id")).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("fails clearly when the Worker is not configured", async () => {
    vi.stubEnv("OUTREACH_WORKER_URL", "");
    await expect(readOutreachSummary()).rejects.toThrow("Outreach Worker is not configured");
  });

  it("streams evidence through the signed server-side reader", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response("captured source", { status: 200, headers: { "content-type": "text/plain" } }));

    const response = await readOutreachEvidence("evidence/1");

    expect(await response.text()).toBe("captured source");
    const [request, init] = vi.mocked(fetch).mock.calls[0] ?? [];
    expect((request as Request).url).toBe("https://outreach.example/reporting/evidence/evidence%2F1");
    expect((init?.headers as Headers).get("x-fidexa-read-signature")).toMatch(/^[a-f0-9]{64}$/);
  });

  it("reads a company drill-down through the signed server capability", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ company: { id: "company/1" }, contacts: [], researchRuns: [], findings: [], evidence: [], drafts: [], messages: [], followUps: [], auditTimeline: [] }), { status: 200 }));
    await expect(readOutreachCompany("company/1")).resolves.toMatchObject({ company: { id: "company/1" } });
    const [request] = vi.mocked(fetch).mock.calls[0] ?? [];
    expect((request as Request).url).toBe("https://outreach.example/reporting/companies/company%2F1");
  });

  it("permits source links only for web URLs", () => {
    expect(isSafeExternalUrl("https://example.com/source")).toBe(true);
    expect(isSafeExternalUrl("http://example.com/source")).toBe(true);
    expect(isSafeExternalUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeExternalUrl("mailto:hello@example.com")).toBe(false);
  });
});
