import { getRetentionDates } from "./retention";
import { threadCandidates } from "./headers";

export type InboundAttachment = {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  checksum: string;
  storageKey: string;
  expiresAt: Date;
};

export type InboundInput = {
  idempotencyKey: string;
  messageId?: string | null;
  inReplyTo?: string | null;
  references?: string | null;
  fromAddress: string;
  fromName?: string | null;
  toAddresses: string[];
  ccAddresses?: string[];
  subject: string;
  textBody: string;
  sanitizedHtml: string;
  receivedAt: Date;
  rawMimeKey?: string | null;
  rawMimeExpiresAt?: Date | null;
  attachments: InboundAttachment[];
};

export function buildInboundRecord(input: InboundInput) {
  const retention = getRetentionDates(input.receivedAt);
  return {
    ...input,
    direction: "inbound" as const,
    status: "received" as const,
    threadCandidates: threadCandidates({
      messageId: input.messageId,
      inReplyTo: input.inReplyTo,
      references: input.references,
      subject: input.subject,
    }),
    contentExpiresAt: retention.contentExpiresAt,
    rawMimeExpiresAt: input.rawMimeExpiresAt ?? retention.rawMimeExpiresAt,
    ccAddresses: input.ccAddresses ?? [],
  };
}
