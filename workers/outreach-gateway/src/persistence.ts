function safeSegment(value: string, label: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error(`Invalid ${label}`);
  return value;
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeDomain(value: string): string {
  const parsed = new URL(value.includes("://") ? value : `https://${value}`);
  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (!hostname || hostname.includes("..")) throw new Error("Invalid domain");
  return hostname;
}

export function buildEvidenceKey(companyId: string, runId: string, filename: string, objectId: string = crypto.randomUUID()): string {
  safeSegment(companyId, "company ID");
  safeSegment(runId, "run ID");
  if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(filename)) throw new Error("Invalid evidence filename");
  safeSegment(objectId, "evidence object ID");
  return `research/${companyId}/${runId}/${objectId}-${filename}`;
}
