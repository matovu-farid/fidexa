ALTER TABLE "mail_messages" ADD COLUMN IF NOT EXISTS "attachment_ids" jsonb NOT NULL DEFAULT '[]'::jsonb;
