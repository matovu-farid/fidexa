const DAY_MS = 24 * 60 * 60 * 1000;

export function getRetentionDates(receivedAt: Date): {
  rawMimeExpiresAt: Date;
  contentExpiresAt: Date;
} {
  return {
    rawMimeExpiresAt: new Date(receivedAt.getTime() + 7 * DAY_MS),
    contentExpiresAt: new Date(receivedAt.getTime() + 365 * DAY_MS),
  };
}
