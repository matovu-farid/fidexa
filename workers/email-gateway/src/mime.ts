import PostalMime from "postal-mime";

const encoder = new TextEncoder();

export type ParsedInboundMime = {
  from: string;
  to: string[];
  cc: string[];
  subject: string;
  messageId: string | null;
  inReplyTo: string | null;
  references: string | null;
  text: string;
  html: string;
  receivedAt: string;
  attachments: Array<{
    filename: string;
    mimeType: string;
    sizeBytes: number;
    content: ArrayBuffer;
  }>;
};

function addresses(value: string | undefined): string[] {
  return value?.split(",").map((address) => address.trim()).filter(Boolean) ?? [];
}

function toAddress(value: { address?: string } | string): string {
  return typeof value === "string" ? value : value.address ?? "";
}

function toArrayBuffer(value: string | ArrayBuffer | Uint8Array): ArrayBuffer {
  if (typeof value === "string") return encoder.encode(value).buffer;
  if (value instanceof ArrayBuffer) return value;
  return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer;
}

export async function parseInboundMime(raw: Uint8Array): Promise<ParsedInboundMime> {
  const email = await PostalMime.parse(raw);
  const headers = new Map(email.headers.map((header) => [header.key.toLowerCase(), header.value]));
  return {
    from: typeof email.from === "string" ? email.from : email.from?.address ?? "",
    to: Array.isArray(email.to) ? email.to.map(toAddress).filter(Boolean) : addresses(headers.get("to")),
    cc: Array.isArray(email.cc) ? email.cc.map(toAddress).filter(Boolean) : addresses(headers.get("cc")),
    subject: email.subject ?? "(no subject)",
    messageId: headers.get("message-id") ?? null,
    inReplyTo: headers.get("in-reply-to") ?? null,
    references: headers.get("references") ?? null,
    text: email.text ?? "",
    html: email.html ?? "",
    receivedAt: new Date().toISOString(),
    attachments: (email.attachments ?? []).map((attachment) => ({
      filename: attachment.filename || "attachment",
      mimeType: attachment.mimeType || "application/octet-stream",
      sizeBytes: toArrayBuffer(attachment.content).byteLength,
      content: toArrayBuffer(attachment.content),
    })),
  };
}
