import { z } from "zod";

const rawConfigSchema = z.object({
  DATABASE_URL: z.string().url().or(z.string().startsWith("postgres://")),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  RESEND_API_KEY: z.string().min(1),
  FIDEXA_APP_URL: z.string().url(),
});

export type ServerConfig = {
  databaseUrl: string;
  betterAuthSecret: string;
  betterAuthUrl: string;
  resendApiKey: string;
  fidexaAppUrl: string;
};

export function parseServerConfig(input: Record<string, string | undefined>): ServerConfig {
  const parsed = rawConfigSchema.parse(input);

  return {
    databaseUrl: parsed.DATABASE_URL,
    betterAuthSecret: parsed.BETTER_AUTH_SECRET,
    betterAuthUrl: parsed.BETTER_AUTH_URL,
    resendApiKey: parsed.RESEND_API_KEY,
    fidexaAppUrl: parsed.FIDEXA_APP_URL,
  };
}

export function getServerConfig(): ServerConfig {
  return parseServerConfig(process.env);
}

export function isAdminEmail(email: string): boolean {
  return /^[^@\s]+@fidexa\.org$/i.test(email.trim());
}
