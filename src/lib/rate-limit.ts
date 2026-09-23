import "server-only";

import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { sql, lt } from "drizzle-orm";
import { getDb } from "../db/client";
import { apiRateLimit } from "../db/rate-limit-schema";

export const RATE_LIMITS = {
  contact: { limit: 5, windowMs: 60 * 60 * 1000 },
  chat: { limit: 20, windowMs: 10 * 60 * 1000 },
} as const;

export type RateLimitRoute = keyof typeof RATE_LIMITS;

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  unavailable?: boolean;
};

function validIp(value: string | null): string | null {
  const ip = value?.trim();
  return ip && isIP(ip) ? ip : null;
}

export function getClientIp(request: Request): string | null {
  const platformHeader = request.headers.get("x-vercel-forwarded-for");
  const platformIp = validIp(platformHeader?.split(",", 1)[0] ?? null);
  if (platformIp) return platformIp;
  return validIp(request.headers.get("x-real-ip"));
}

export function hashClientIp(ip: string, secret: string): string {
  return createHmac("sha256", secret).update(ip).digest("hex");
}

export async function checkRateLimit(
  request: Request,
  route: RateLimitRoute,
  now = Date.now(),
): Promise<RateLimitResult> {
  const policy = RATE_LIMITS[route];
  const ip = getClientIp(request);
  const secret = process.env.DATABASE_URL;
  const windowStart = Math.floor(now / policy.windowMs) * policy.windowMs;
  const resetAt = windowStart + policy.windowMs;
  const failUnavailable = (): RateLimitResult => route === "contact"
    ? { allowed: true, remaining: policy.limit, resetAt }
    : { allowed: false, remaining: 0, resetAt, unavailable: true };

  // Chat spends paid model capacity, so it requires a trusted identity and store.
  // Contact deliberately preserves lead delivery during store outages.
  if (!ip || !secret) return failUnavailable();

  try {
    const db = getDb();
    const keyHash = hashClientIp(ip, secret);
    const [row] = await db.insert(apiRateLimit).values({
      keyHash,
      route,
      windowStartedAt: new Date(windowStart),
      hits: 1,
    }).onConflictDoUpdate({
      target: [apiRateLimit.keyHash, apiRateLimit.route, apiRateLimit.windowStartedAt],
      set: { hits: sql`${apiRateLimit.hits} + 1` },
    }).returning({ hits: apiRateLimit.hits });

    // Cleanup is best-effort and does not affect admission. Rows older than two
    // days cannot be used by any active window and are safe to remove.
    if (Math.random() < 0.01) {
      try {
        await db.delete(apiRateLimit).where(lt(
          apiRateLimit.windowStartedAt,
          new Date(now - 48 * 60 * 60 * 1000),
        ));
      } catch {
        // Expired rows are harmless until a later cleanup pass.
      }
    }

    const hits = row?.hits ?? 1;
    return { allowed: hits <= policy.limit, remaining: Math.max(0, policy.limit - hits), resetAt };
  } catch {
    // Never log the error: database errors can include connection details.
    return failUnavailable();
  }
}
