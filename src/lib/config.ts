import { z } from "zod";

const rawConfigSchema = z.object({
  DATABASE_URL: z.string().url().or(z.string().startsWith("postgres://")),
  BETTER_AUTH_SECRET: z.string().min(16),
  BETTER_AUTH_URL: z.string().url(),
  RESEND_API_KEY: z.string().min(1),
  RESEND_WEBHOOK_SECRET: z.string().min(1),
  INBOX_INGEST_SECRET: z.string().min(16),
  INBOX_ATTACHMENT_SECRET: z.string().min(16),
  CLEANUP_SECRET: z.string().min(16),
  FIDEXA_APP_URL: z.string().url(),
  INBOX_WORKER_URL: z.string().url(),
  FIDEXA_ADMIN_EMAILS: z.string().min(1),
});

export type ServerConfig = {
  databaseUrl: string;
  betterAuthSecret: string;
  betterAuthUrl: string;
  resendApiKey: string;
  resendWebhookSecret: string;
  inboxIngestSecret: string;
  inboxAttachmentSecret: string;
  cleanupSecret: string;
  fidexaAppUrl: string;
  inboxWorkerUrl: string;
  adminEmails: string[];
};

export function parseServerConfig(input: Record<string, string | undefined>): ServerConfig {
  const parsed = rawConfigSchema.parse(input);
  const adminEmails = parsed.FIDEXA_ADMIN_EMAILS.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.length === 0) {
    throw new Error("FIDEXA_ADMIN_EMAILS must contain at least one email");
  }

  return {
    databaseUrl: parsed.DATABASE_URL,
    betterAuthSecret: parsed.BETTER_AUTH_SECRET,
    betterAuthUrl: parsed.BETTER_AUTH_URL,
    resendApiKey: parsed.RESEND_API_KEY,
    resendWebhookSecret: parsed.RESEND_WEBHOOK_SECRET,
    inboxIngestSecret: parsed.INBOX_INGEST_SECRET,
    inboxAttachmentSecret: parsed.INBOX_ATTACHMENT_SECRET,
    cleanupSecret: parsed.CLEANUP_SECRET,
    fidexaAppUrl: parsed.FIDEXA_APP_URL,
    inboxWorkerUrl: parsed.INBOX_WORKER_URL,
    adminEmails,
  };
}

export function getServerConfig(): ServerConfig {
  return parseServerConfig(process.env);
}

export function isAdminEmail(email: string, config = getServerConfig()): boolean {
  return config.adminEmails.includes(email.trim().toLowerCase());
}
