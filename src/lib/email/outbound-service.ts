import { assertOutboundAlias } from "./addresses";
import { normalizeSubject } from "./headers";
import { splitAddresses } from "./recipients";

export type OutboundDraftInput = { fromAddress: string; to: string; cc?: string; bcc?: string; subject: string; textBody: string; htmlBody?: string; inReplyTo?: string | null; references?: string | null };

export function prepareOutboundMessage(input: OutboundDraftInput) {
  assertOutboundAlias(input.fromAddress);
  const toAddresses = splitAddresses(input.to);
  if (toAddresses.length === 0) throw new Error("At least one recipient is required");
  if (toAddresses.some((address) => !address.includes("@"))) throw new Error("Invalid recipient");
  return {
    fromAddress: input.fromAddress.trim().toLowerCase(), toAddresses, ccAddresses: splitAddresses(input.cc), bccAddresses: splitAddresses(input.bcc), subject: input.subject.trim() || "(no subject)", normalizedSubject: normalizeSubject(input.subject), textBody: input.textBody, htmlBody: input.htmlBody?.trim() || undefined,
    headers: { ...(input.inReplyTo ? { "In-Reply-To": input.inReplyTo } : {}), ...(input.references ? { References: input.references } : {}) },
  };
}
