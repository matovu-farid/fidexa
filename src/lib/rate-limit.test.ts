import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDb, insert, values, onConflictDoUpdate, returning, deleteRows, where } = vi.hoisted(() => {
  const returning = vi.fn();
  const onConflictDoUpdate = vi.fn(() => ({ returning }));
  const values = vi.fn(() => ({ onConflictDoUpdate }));
  const insert = vi.fn(() => ({ values }));
  const where = vi.fn().mockResolvedValue(undefined);
  const deleteRows = vi.fn(() => ({ where }));
  const getDb = vi.fn(() => ({ insert, delete: deleteRows }));
  return { getDb, insert, values, onConflictDoUpdate, returning, deleteRows, where };
});

vi.mock("server-only", () => ({}));
vi.mock("../db/client", () => ({ getDb }));

import { checkRateLimit, getClientIp, hashClientIp, RATE_LIMITS } from "./rate-limit";

describe("public API rate limits", () => {
  beforeEach(() => {
    vi.stubEnv("DATABASE_URL", "postgres://user:password@db.example/fidexa");
    returning.mockReset().mockResolvedValue([{ hits: 1 }]);
    onConflictDoUpdate.mockClear();
    values.mockClear();
    insert.mockClear();
    deleteRows.mockClear();
    where.mockClear().mockResolvedValue(undefined);
    getDb.mockClear();
  });

  it("uses distinct, bounded contact and chat quotas", () => {
    expect(RATE_LIMITS.contact.limit).toBeLessThan(RATE_LIMITS.chat.limit);
    expect(RATE_LIMITS.contact.windowMs).toBeGreaterThan(RATE_LIMITS.chat.windowMs);
  });

  it("uses the platform client IP and ignores an untrusted forwarded chain", () => {
    const request = new Request("https://fidexa.org/api/contact", {
      headers: {
        "x-vercel-forwarded-for": "203.0.113.7, 198.51.100.9",
        "x-real-ip": "198.51.100.3",
        "x-forwarded-for": "192.0.2.99",
      },
    });

    expect(getClientIp(request)).toBe("203.0.113.7");
    expect(getClientIp(new Request("https://fidexa.org", { headers: { "x-forwarded-for": "192.0.2.99" } }))).toBeNull();
  });

  it("stores a keyed digest instead of the raw client IP", () => {
    const digest = hashClientIp("203.0.113.7", "deployment-secret");

    expect(digest).not.toContain("203.0.113.7");
    expect(digest).toBe(hashClientIp("203.0.113.7", "deployment-secret"));
    expect(digest).not.toBe(hashClientIp("203.0.113.7", "rotated-secret"));
  });

  it("atomically increments the database window counter and rejects beyond quota", async () => {
    returning.mockResolvedValue([{ hits: RATE_LIMITS.contact.limit + 1 }]);
    const request = new Request("https://fidexa.org/api/contact", {
      headers: { "x-vercel-forwarded-for": "203.0.113.7" },
    });

    const result = await checkRateLimit(request, "contact");

    expect(result.allowed).toBe(false);
    expect(values).toHaveBeenCalledWith(expect.objectContaining({ keyHash: expect.any(String), route: "contact", hits: 1 }));
    expect(onConflictDoUpdate).toHaveBeenCalledWith(expect.objectContaining({ set: expect.objectContaining({ hits: expect.anything() }) }));
    expect(JSON.stringify(values.mock.calls)).not.toContain("203.0.113.7");
  });

  it("preserves contact delivery if Postgres is unavailable", async () => {
    getDb.mockImplementation(() => { throw new Error("database unavailable"); });
    const request = new Request("https://fidexa.org/api/contact", {
      headers: { "x-vercel-forwarded-for": "203.0.113.7" },
    });

    const result = await checkRateLimit(request, "contact");
    expect(result.allowed).toBe(true);
    expect(result).not.toHaveProperty("unavailable");
  });

  it("blocks paid chat when Postgres is unavailable", async () => {
    getDb.mockImplementation(() => { throw new Error("database unavailable"); });
    const request = new Request("https://fidexa.org/api/chat", {
      headers: { "x-vercel-forwarded-for": "203.0.113.7" },
    });

    await expect(checkRateLimit(request, "chat")).resolves.toMatchObject({ allowed: false, unavailable: true });
  });

  it("blocks paid chat when no trusted client IP is present", async () => {
    const request = new Request("https://fidexa.org/api/chat", {
      headers: { "x-forwarded-for": "203.0.113.7" },
    });

    await expect(checkRateLimit(request, "chat")).resolves.toMatchObject({ allowed: false, unavailable: true });
    expect(insert).not.toHaveBeenCalled();
  });

  it("blocks paid chat when DATABASE_URL is not configured", async () => {
    vi.stubEnv("DATABASE_URL", "");
    const request = new Request("https://fidexa.org/api/chat", {
      headers: { "x-vercel-forwarded-for": "203.0.113.7" },
    });

    await expect(checkRateLimit(request, "chat")).resolves.toMatchObject({ allowed: false, unavailable: true });
    expect(insert).not.toHaveBeenCalled();
  });
});
