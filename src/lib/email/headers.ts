export type ThreadHeaders = {
  messageId?: string | null;
  inReplyTo?: string | null;
  references?: string | null;
  subject: string;
};

export function normalizeSubject(subject: string): string {
  let normalized = subject.trim();
  while (/^(re|fw|fwd)\s*:\s*/i.test(normalized)) {
    normalized = normalized.replace(/^(re|fw|fwd)\s*:\s*/i, "");
  }
  return normalized.replace(/\s+/g, " ").toLowerCase();
}

export function threadCandidates(headers: ThreadHeaders): string[] {
  const candidates: string[] = [];
  const add = (value: string | null | undefined) => {
    if (value && value !== headers.messageId && !candidates.includes(value)) {
      candidates.push(value);
    }
  };

  add(headers.inReplyTo?.trim());
  for (const reference of (headers.references ?? "").split(/\s+/)) add(reference.trim());
  add(normalizeSubject(headers.subject));
  return candidates.filter(Boolean);
}

export function threadLookupCandidates(headers: ThreadHeaders): { messageReferences: string[]; normalizedSubject: string } {
  return {
    messageReferences: threadCandidates(headers).filter((candidate) => candidate.startsWith("<")),
    normalizedSubject: normalizeSubject(headers.subject),
  };
}
