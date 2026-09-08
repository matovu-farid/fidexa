import { z } from "zod";

const rawConfigSchema = z.object({
  DATABASE_URL: z.string().url().or(z.string().startsWith("postgres://")),
  BETTER_AUTH_SECRET: z.string().min(16),
  BETTER_AUTH_URL: z.string().url(),
  RESEND_API_KEY: z.string().min(1),
  FIDEXA_APP_URL: z.string().url(),
  FIDEXA_ADMIN_EMAILS: z.string().min(1),
});

export type ServerConfig = {
  databaseUrl: string;
  betterAuthSecret: string;
  betterAuthUrl: string;
  resendApiKey: string;
  fidexaAppUrl: string;
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
    fidexaAppUrl: parsed.FIDEXA_APP_URL,
    adminEmails,
  };
}

export function getServerConfig(): ServerConfig {
  return parseServerConfig(process.env);
}

export function isAdminEmail(email: string, config = getServerConfig()): boolean {
  return config.adminEmails.includes(email.trim().toLowerCase());
}
