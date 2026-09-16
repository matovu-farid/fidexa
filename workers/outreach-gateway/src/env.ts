export type OutreachEnv = Env & {
  OUTREACH_DB?: D1Database;
  OUTREACH_BUCKET?: R2Bucket;
  MCP_OPERATOR_SECRET?: string;
  MCP_REVIEWER_SECRET?: string;
  FIDEXA_READ_SECRET?: string;
  RESEND_API_KEY?: string;
  RESEND_WEBHOOK_SECRET?: string;
  ZOHO_CLIENT_ID?: string;
  ZOHO_CLIENT_SECRET?: string;
  ZOHO_REFRESH_TOKEN?: string;
  ZOHO_ACCOUNT_ID?: string;
  ZOHO_API_BASE_URL?: string;
  ZOHO_ACCOUNTS_URL?: string;
  ZOHO_MAILBOX?: string;
  ZOHO_FOLDER_ID?: string;
};

export function requireBinding<T>(value: T | undefined, name: string): T {
  if (!value) throw new Error(`Missing Worker binding: ${name}`);
  return value;
}

export function requireSecret(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing Worker secret: ${name}`);
  return value;
}
