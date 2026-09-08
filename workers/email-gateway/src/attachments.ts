export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
export const MAX_TOTAL_ATTACHMENT_BYTES = 15 * 1024 * 1024;

const SAFE_MIME_TYPES = new Set([
  "application/json",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "audio/mpeg",
  "audio/wav",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/csv",
  "text/plain",
  "video/mp4",
]);

const EXECUTABLE_EXTENSIONS = new Set([
  "apk", "app", "bat", "cmd", "com", "dll", "dmg", "exe", "jar", "js", "msi", "sh", "vbs", "wasm",
]);

export type AttachmentCandidate = {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  content: ArrayBuffer;
};

function hasPrefix(bytes: Uint8Array, prefix: number[]): boolean {
  return prefix.every((value, index) => bytes[index] === value);
}

function hasExecutableSignature(content: ArrayBuffer): boolean {
  const bytes = new Uint8Array(content);
  return hasPrefix(bytes, [0x4d, 0x5a]) // PE/Windows executable
    || hasPrefix(bytes, [0x7f, 0x45, 0x4c, 0x46]) // ELF executable
    || hasPrefix(bytes, [0xfe, 0xed, 0xfa, 0xce])
    || hasPrefix(bytes, [0xfe, 0xed, 0xfa, 0xcf])
    || hasPrefix(bytes, [0xcf, 0xfa, 0xed, 0xfe]) // Mach-O executable
    || new TextDecoder().decode(bytes.slice(0, 3)) === "#!/";
}

function hasExecutableExtension(filename: string): boolean {
  const extension = filename.trim().toLowerCase().split(".").at(-1);
  return extension ? EXECUTABLE_EXTENSIONS.has(extension) : false;
}

export function isSafeAttachment(attachment: AttachmentCandidate): boolean {
  const mimeType = attachment.mimeType.trim().toLowerCase();
  const actualSize = attachment.content.byteLength;
  return actualSize <= MAX_ATTACHMENT_BYTES
    && attachment.sizeBytes === actualSize
    && SAFE_MIME_TYPES.has(mimeType)
    && !hasExecutableExtension(attachment.filename)
    && !hasExecutableSignature(attachment.content);
}

export function filterAttachments(attachments: AttachmentCandidate[]): { accepted: AttachmentCandidate[]; rejected: AttachmentCandidate[] } {
  const accepted = attachments.filter(isSafeAttachment);
  const rejected = attachments.filter((attachment) => !isSafeAttachment(attachment));
  if (accepted.reduce((total, attachment) => total + attachment.content.byteLength, 0) > MAX_TOTAL_ATTACHMENT_BYTES) {
    return { accepted: [], rejected: attachments };
  }
  return { accepted, rejected };
}
