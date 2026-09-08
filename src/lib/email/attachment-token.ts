const encoder = new TextEncoder();

function base64Url(value: string | ArrayBuffer): string {
  const bytes = typeof value === "string" ? encoder.encode(value) : new Uint8Array(value);
  let binary = ""; for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decode(value: string): string | null {
  try { const normalized = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "="); return atob(normalized); } catch { return null; }
}

async function signature(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

function bytesFromBase64Url(value: string): Uint8Array | null {
  try { const normalized = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "="); return Uint8Array.from(atob(normalized), (character) => character.charCodeAt(0)); } catch { return null; }
}

export async function createAttachmentToken(input: { id: string; storageKey: string; filename: string; expiresAt: number }, secret: string) {
  const payload = base64Url(JSON.stringify(input));
  return `${payload}.${await signature(payload, secret)}`;
}

export async function verifyAttachmentToken(token: string, secret: string, now = Date.now()): Promise<{ id: string; storageKey: string; filename: string; expiresAt: number } | null> {
  const [payload, received] = token.split("."); if (!payload || !received) return null;
  const body = decode(payload); if (!body) return null;
  const receivedBytes = bytesFromBase64Url(received); if (!receivedBytes) return null;
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const receivedBuffer = new ArrayBuffer(receivedBytes.byteLength); new Uint8Array(receivedBuffer).set(receivedBytes);
  if (!await crypto.subtle.verify("HMAC", key, receivedBuffer, encoder.encode(payload))) return null;
  try { const parsed = JSON.parse(body) as { id: string; storageKey: string; filename: string; expiresAt: number }; if (!parsed.id || !parsed.storageKey.startsWith("attachments/") || parsed.expiresAt <= now) return null; return parsed; } catch { return null; }
}
