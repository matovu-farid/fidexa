const DAY_MS = 24 * 60 * 60 * 1000;

export function isObjectExpired(uploadedAt: Date, now: number, maxAgeDays: number): boolean {
  return now - uploadedAt.getTime() >= maxAgeDays * DAY_MS;
}
