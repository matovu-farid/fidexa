import { createHmac, timingSafeEqual } from "node:crypto";

export type TwilioSmsMessage = {
  messageSid: string;
  from: string;
  to: string;
  body: string;
  receivedAt: string;
};

function getPayloadValue(payload: URLSearchParams | FormData, key: string): string | null {
  const value = payload.get(key);
  return typeof value === "string" ? value : null;
}

export function createTwilioSignature(
  url: string,
  payload: URLSearchParams | FormData,
  authToken: string,
): string {
  const values = [...payload.entries()]
    .map(([key, value]) => [key, String(value)] as const)
    .sort(([left], [right]) => left.localeCompare(right));
  const data = url + values.map(([key, value]) => `${key}${value}`).join("");

  return createHmac("sha1", authToken).update(data).digest("base64");
}

export function isValidTwilioSignature(
  url: string,
  payload: URLSearchParams | FormData,
  signature: string,
  authToken: string,
): boolean {
  if (!signature || !authToken) return false;

  const expected = Buffer.from(createTwilioSignature(url, payload, authToken));
  const received = Buffer.from(signature);

  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function parseTwilioSmsPayload(
  payload: URLSearchParams | FormData,
  receivedAt = new Date().toISOString(),
): TwilioSmsMessage {
  const fields = [
    ["MessageSid", "messageSid"],
    ["From", "from"],
    ["To", "to"],
    ["Body", "body"],
  ] as const;

  const values = Object.fromEntries(
    fields.map(([wireName, fieldName]) => {
      const value = getPayloadValue(payload, wireName);
      if (value === null) {
        throw new Error(`Missing required Twilio field: ${wireName}`);
      }
      return [fieldName, value];
    }),
  ) as Pick<TwilioSmsMessage, "messageSid" | "from" | "to" | "body">;

  return { ...values, receivedAt };
}

export function formatSmsEmail(message: TwilioSmsMessage): string {
  return [
    "Inbound SMS received",
    "",
    `From: ${message.from}`,
    `To: ${message.to}`,
    `Received: ${message.receivedAt}`,
    `Message SID: ${message.messageSid}`,
    "",
    "Message:",
    message.body || "(empty message)",
  ].join("\n");
}
