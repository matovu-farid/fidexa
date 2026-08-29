const encoder = new TextEncoder();

function toBase64Url(bytes: ArrayBuffer): string {
  const bytesArray = new Uint8Array(bytes);
  let binary = "";
  for (const byte of bytesArray) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array | null {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const binary = atob(normalized);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

async function importSecret(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signPayload(body: string, secret: string, timestamp: string): Promise<string> {
  const key = await importSecret(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${body}`));
  return `v1=${toBase64Url(signature)}`;
}

export async function verifyPayloadSignature(input: {
  body: string;
  timestamp: string;
  signature: string;
  secret: string;
  nowSeconds?: number;
  toleranceSeconds?: number;
}): Promise<boolean> {
  const timestampSeconds = Number(input.timestamp);
  if (!Number.isInteger(timestampSeconds)) return false;
  const now = input.nowSeconds ?? Math.floor(Date.now() / 1000);
  const tolerance = input.toleranceSeconds ?? 600;
  if (Math.abs(now - timestampSeconds) > tolerance) return false;

  const encoded = input.signature.trim().match(/^v1=([A-Za-z0-9_-]+)$/)?.[1];
  const received = encoded ? fromBase64Url(encoded) : null;
  if (!received) return false;
  const key = await importSecret(input.secret);
  return crypto.subtle.verify("HMAC", key, Uint8Array.from(received), encoder.encode(`${input.timestamp}.${input.body}`));
}
