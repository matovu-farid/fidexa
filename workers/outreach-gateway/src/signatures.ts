const encoder = new TextEncoder();
export const maxSignatureSkewSeconds = 300;

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}

export function signedMessage(timestamp: number, body: string): string {
  return `${timestamp}.${body}`;
}

export async function signRequest(secret: string, timestamp: number, body: string): Promise<string> {
  return hmac(secret, signedMessage(timestamp, body));
}

export function signedReadMessage(request: Request, timestamp: number, requestId: string): string {
  const url = new URL(request.url);
  return `${requestId}.${request.method}.${url.pathname}${url.search}`;
}

export async function signReadRequest(secret: string, request: Request, timestamp: number, requestId: string): Promise<string> {
  return hmac(secret, signedMessage(timestamp, signedReadMessage(request, timestamp, requestId)));
}

export async function verifyReadRequest(request: Request, secret: string): Promise<boolean> {
  const timestamp = Number(request.headers.get("x-fidexa-read-timestamp"));
  const requestId = request.headers.get("x-fidexa-read-request-id");
  const signature = request.headers.get("x-fidexa-read-signature");
  if (!signature || !requestId || !Number.isInteger(timestamp)) return false;
  return verifyRequestSignature({
    secret,
    timestamp,
    body: signedReadMessage(request, timestamp, requestId),
    signature,
  });
}

export async function verifyRequestSignature(input: {
  secret: string;
  timestamp: number;
  body: string;
  signature: string;
  nowSeconds?: number;
  maxSkewSeconds?: number;
}): Promise<boolean> {
  const nowSeconds = input.nowSeconds ?? Math.floor(Date.now() / 1000);
  const maxSkewSeconds = input.maxSkewSeconds ?? maxSignatureSkewSeconds;
  if (!Number.isInteger(input.timestamp) || Math.abs(nowSeconds - input.timestamp) > maxSkewSeconds) return false;

  const expected = await hmac(input.secret, signedMessage(input.timestamp, input.body));
  const expectedBytes = encoder.encode(expected);
  const actualBytes = encoder.encode(input.signature.toLowerCase());
  if (expectedBytes.byteLength !== actualBytes.byteLength) return false;

  return crypto.subtle.verify(
    "HMAC",
    await crypto.subtle.importKey("raw", encoder.encode(input.secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]),
    hexToBytes(input.signature),
    encoder.encode(signedMessage(input.timestamp, input.body)),
  );
}

function hexToBytes(value: string): ArrayBuffer {
  if (!/^[a-f0-9]+$/i.test(value) || value.length % 2 !== 0) return new ArrayBuffer(0);
  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < bytes.length; index += 1) bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  return bytes.buffer;
}
