export const limits = {
  requestBytes: 256_000,
  evidenceBytes: 100_000,
  dailySendLimit: 25,
  pageSize: 100,
} as const;

export class BodyTooLargeError extends Error {
  constructor() {
    super("Request body exceeds the configured limit");
  }
}

export async function readTextWithinLimit(stream: ReadableStream<Uint8Array> | null, maximum: number = limits.requestBytes): Promise<string> {
  if (!stream) return "";
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return text + decoder.decode();
      bytes += value.byteLength;
      if (bytes > maximum) {
        await reader.cancel();
        throw new BodyTooLargeError();
      }
      text += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}

export function contentLengthWithinLimit(value: string | null, maximum = limits.requestBytes): boolean {
  if (value === null) return true;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 && parsed <= maximum;
}

export function boundedLimit(value: string | null, maximum = limits.pageSize): number | null {
  const parsed = Number(value ?? "25");
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > maximum) return null;
  return parsed;
}
