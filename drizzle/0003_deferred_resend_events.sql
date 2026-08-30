ALTER TABLE "mail_events" ADD COLUMN IF NOT EXISTS "event_type" text;
ALTER TABLE "mail_events" ADD COLUMN IF NOT EXISTS "provider_message_id" text;
ALTER TABLE "mail_events" ADD COLUMN IF NOT EXISTS "processed_at" timestamptz;
