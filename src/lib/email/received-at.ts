const MAX_RECEIPT_SKEW_MS = 24 * 60 * 60 * 1000;

export function boundReceivedAt(receivedAt: Date, serverReceivedAt: Date): Date {
  const serverTimestamp = serverReceivedAt.getTime();
  const receivedTimestamp = receivedAt.getTime();
  if (!Number.isFinite(serverTimestamp)) return new Date();
  if (!Number.isFinite(receivedTimestamp)) return new Date(serverTimestamp);
  return new Date(Math.max(serverTimestamp - MAX_RECEIPT_SKEW_MS, Math.min(receivedTimestamp, serverTimestamp)));
}
