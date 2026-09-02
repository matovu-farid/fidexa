export const INBOUND_ALIASES = [
  "hello@fidexa.org",
  "sales@fidexa.org",
  "support@fidexa.org",
  "info@fidexa.org",
  "faridmatovu@fidexa.org",
] as const;

const ALIAS_SET = new Set<string>(INBOUND_ALIASES);

function normalizeExactAddress(value: string): string {
  return value.trim().toLowerCase();
}

export function isInboundAlias(value: string): boolean {
  return ALIAS_SET.has(normalizeExactAddress(value));
}

export function isOutboundAlias(value: string): boolean {
  return isInboundAlias(value);
}

export function assertOutboundAlias(value: string): string {
  const normalized = normalizeExactAddress(value);
  if (!isOutboundAlias(normalized)) {
    throw new Error("Sender must be an approved Fidexa alias");
  }
  return normalized;
}
