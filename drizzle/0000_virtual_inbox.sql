CREATE TYPE "mail_message_direction" AS ENUM ('inbound', 'outbound');
CREATE TYPE "mail_message_status" AS ENUM ('received', 'pending', 'sent', 'delivered', 'delayed', 'bounced', 'failed', 'suppressed', 'complained');
CREATE TYPE "mail_thread_state" AS ENUM ('active', 'archived');
CREATE TYPE "mail_event_source" AS ENUM ('worker', 'resend');

CREATE TABLE "mail_contacts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" text NOT NULL,
  "display_name" text,
  "source" text NOT NULL DEFAULT 'inbound_email',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "mail_contacts_email_unique" ON "mail_contacts" ("email");

CREATE TABLE "mail_threads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "subject" text NOT NULL,
  "normalized_subject" text NOT NULL,
  "receiving_alias" text NOT NULL,
  "contact_id" uuid REFERENCES "mail_contacts"("id") ON DELETE SET NULL,
  "state" "mail_thread_state" NOT NULL DEFAULT 'active',
  "is_unread" boolean NOT NULL DEFAULT true,
  "last_message_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "mail_threads_last_message_idx" ON "mail_threads" ("last_message_at");

CREATE TABLE "mail_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "thread_id" uuid NOT NULL REFERENCES "mail_threads"("id") ON DELETE CASCADE,
  "attachment_ids" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "direction" "mail_message_direction" NOT NULL,
  "status" "mail_message_status" NOT NULL,
  "provider_message_id" text,
  "rfc_message_id" text,
  "idempotency_key" text,
  "in_reply_to" text,
  "references" text,
  "from_address" text NOT NULL,
  "from_name" text,
  "to_addresses" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "cc_addresses" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "bcc_addresses" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "subject" text NOT NULL,
  "text_body" text NOT NULL DEFAULT '',
  "sanitized_html" text NOT NULL DEFAULT '',
  "raw_mime_key" text,
  "raw_mime_expires_at" timestamptz,
  "content_expires_at" timestamptz NOT NULL,
  "received_at" timestamptz,
  "sent_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "mail_messages_provider_id_unique" ON "mail_messages" ("provider_message_id");
CREATE UNIQUE INDEX "mail_messages_rfc_id_unique" ON "mail_messages" ("rfc_message_id");
CREATE UNIQUE INDEX "mail_messages_idempotency_unique" ON "mail_messages" ("idempotency_key");
CREATE INDEX "mail_messages_thread_created_idx" ON "mail_messages" ("thread_id", "created_at");
CREATE INDEX "mail_messages_expiry_idx" ON "mail_messages" ("content_expires_at");
CREATE INDEX "mail_messages_search_idx" ON "mail_messages" USING GIN (to_tsvector('simple', coalesce("from_address", '') || ' ' || coalesce("subject", '') || ' ' || coalesce("text_body", '') || ' ' || coalesce("sanitized_html", '')));

CREATE TABLE "user" ("id" text PRIMARY KEY NOT NULL, "name" text NOT NULL, "email" text NOT NULL, "email_verified" boolean DEFAULT false NOT NULL, "image" text, "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL);
CREATE UNIQUE INDEX "user_email_unique" ON "user" ("email");
CREATE TABLE "session" ("id" text PRIMARY KEY NOT NULL, "expires_at" timestamptz NOT NULL, "token" text NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL, "ip_address" text, "user_agent" text, "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE);
CREATE UNIQUE INDEX "session_token_unique" ON "session" ("token");
CREATE INDEX "session_user_idx" ON "session" ("user_id");
CREATE TABLE "account" ("id" text PRIMARY KEY NOT NULL, "account_id" text NOT NULL, "provider_id" text NOT NULL, "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE, "access_token" text, "refresh_token" text, "id_token" text, "access_token_expires_at" timestamptz, "refresh_token_expires_at" timestamptz, "scope" text, "password" text, "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL);
CREATE INDEX "account_user_idx" ON "account" ("user_id");
CREATE TABLE "verification" ("id" text PRIMARY KEY NOT NULL, "identifier" text NOT NULL, "value" text NOT NULL, "expires_at" timestamptz NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL);
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");
CREATE TABLE "passkey" ("id" text PRIMARY KEY NOT NULL, "name" text, "public_key" text NOT NULL, "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE, "credential_id" text NOT NULL, "counter" integer NOT NULL, "device_type" text NOT NULL, "backed_up" boolean NOT NULL, "transports" text, "created_at" timestamptz DEFAULT now() NOT NULL, "aaguid" text);
CREATE UNIQUE INDEX "passkey_credential_unique" ON "passkey" ("credential_id");
CREATE INDEX "passkey_user_idx" ON "passkey" ("user_id");

CREATE TABLE "mail_attachments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "message_id" uuid NOT NULL REFERENCES "mail_messages"("id") ON DELETE CASCADE,
  "storage_key" text NOT NULL,
  "filename" text NOT NULL,
  "mime_type" text NOT NULL,
  "size_bytes" integer NOT NULL,
  "checksum" text NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "mail_attachments_expiry_idx" ON "mail_attachments" ("expires_at");

CREATE TABLE "mail_drafts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "thread_id" uuid REFERENCES "mail_threads"("id") ON DELETE SET NULL,
  "from_address" text NOT NULL,
  "to_addresses" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "cc_addresses" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "bcc_addresses" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "subject" text NOT NULL DEFAULT '',
  "text_body" text NOT NULL DEFAULT '',
  "attachment_ids" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "mail_drafts_thread_idx" ON "mail_drafts" ("thread_id");

CREATE TABLE "mail_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "source" "mail_event_source" NOT NULL,
  "provider_event_id" text NOT NULL,
  "event_type" text,
  "provider_message_id" text,
  "idempotency_key" text,
  "payload_hash" text NOT NULL,
  "processed_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "mail_events_provider_event_unique" ON "mail_events" ("source", "provider_event_id");

CREATE TABLE "mail_audit_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "actor_email" text NOT NULL,
  "action" text NOT NULL,
  "object_type" text NOT NULL,
  "object_id" text NOT NULL,
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "mail_audit_logs_created_idx" ON "mail_audit_logs" ("created_at");
