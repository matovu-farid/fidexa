import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export * from "./auth-schema";

export const messageDirection = pgEnum("mail_message_direction", ["inbound", "outbound"]);
export const messageStatus = pgEnum("mail_message_status", [
  "received", "pending", "sent", "delivered", "delayed", "bounced", "failed", "suppressed", "complained",
]);
export const threadState = pgEnum("mail_thread_state", ["active", "archived"]);
export const eventSource = pgEnum("mail_event_source", ["worker", "resend"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const mailContacts = pgTable("mail_contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name"),
  source: text("source").notNull().default("inbound_email"),
  ...timestamps,
}, (table) => [uniqueIndex("mail_contacts_email_unique").on(table.email)]);

export const mailThreads = pgTable("mail_threads", {
  id: uuid("id").defaultRandom().primaryKey(),
  subject: text("subject").notNull(),
  normalizedSubject: text("normalized_subject").notNull(),
  receivingAlias: text("receiving_alias").notNull(),
  contactId: uuid("contact_id").references(() => mailContacts.id, { onDelete: "set null" }),
  state: threadState("state").notNull().default("active"),
  isUnread: boolean("is_unread").notNull().default(true),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }).notNull(),
  ...timestamps,
}, (table) => [index("mail_threads_last_message_idx").on(table.lastMessageAt)]);

export const mailMessages = pgTable("mail_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  threadId: uuid("thread_id").notNull().references(() => mailThreads.id, { onDelete: "cascade" }),
  draftId: uuid("draft_id"),
  direction: messageDirection("direction").notNull(),
  status: messageStatus("status").notNull(),
  providerMessageId: text("provider_message_id"),
  rfcMessageId: text("rfc_message_id"),
  idempotencyKey: text("idempotency_key"),
  inReplyTo: text("in_reply_to"),
  references: text("references"),
  fromAddress: text("from_address").notNull(),
  fromName: text("from_name"),
  toAddresses: jsonb("to_addresses").$type<string[]>().notNull(),
  ccAddresses: jsonb("cc_addresses").$type<string[]>().notNull().default([]),
  bccAddresses: jsonb("bcc_addresses").$type<string[]>().notNull().default([]),
  subject: text("subject").notNull(),
  textBody: text("text_body").notNull().default(""),
  sanitizedHtml: text("sanitized_html").notNull().default(""),
  rawMimeKey: text("raw_mime_key"),
  rawMimeExpiresAt: timestamp("raw_mime_expires_at", { withTimezone: true }),
  contentExpiresAt: timestamp("content_expires_at", { withTimezone: true }).notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [
  uniqueIndex("mail_messages_provider_id_unique").on(table.providerMessageId),
  uniqueIndex("mail_messages_rfc_id_unique").on(table.rfcMessageId),
  uniqueIndex("mail_messages_idempotency_unique").on(table.idempotencyKey),
  index("mail_messages_thread_created_idx").on(table.threadId, table.createdAt),
  index("mail_messages_expiry_idx").on(table.contentExpiresAt),
]);

export const mailAttachments = pgTable("mail_attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  messageId: uuid("message_id").notNull().references(() => mailMessages.id, { onDelete: "cascade" }),
  storageKey: text("storage_key").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  checksum: text("checksum").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ...timestamps,
}, (table) => [index("mail_attachments_expiry_idx").on(table.expiresAt)]);

export const mailDrafts = pgTable("mail_drafts", {
  id: uuid("id").defaultRandom().primaryKey(),
  threadId: uuid("thread_id").references(() => mailThreads.id, { onDelete: "set null" }),
  fromAddress: text("from_address").notNull(),
  toAddresses: jsonb("to_addresses").$type<string[]>().notNull().default([]),
  ccAddresses: jsonb("cc_addresses").$type<string[]>().notNull().default([]),
  bccAddresses: jsonb("bcc_addresses").$type<string[]>().notNull().default([]),
  subject: text("subject").notNull().default(""),
  textBody: text("text_body").notNull().default(""),
  attachmentIds: jsonb("attachment_ids").$type<string[]>().notNull().default([]),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ...timestamps,
}, (table) => [index("mail_drafts_thread_idx").on(table.threadId)]);

export const mailEvents = pgTable("mail_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  source: eventSource("source").notNull(),
  providerEventId: text("provider_event_id").notNull(),
  idempotencyKey: text("idempotency_key"),
  payloadHash: text("payload_hash").notNull(),
  ...timestamps,
}, (table) => [uniqueIndex("mail_events_provider_event_unique").on(table.source, table.providerEventId)]);

export const mailAuditLogs = pgTable("mail_audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorEmail: text("actor_email").notNull(),
  action: text("action").notNull(),
  objectType: text("object_type").notNull(),
  objectId: text("object_id").notNull(),
  metadata: jsonb("metadata").$type<Record<string, string | number | boolean | null>>().notNull().default({}),
  ...timestamps,
}, (table) => [index("mail_audit_logs_created_idx").on(table.createdAt)]);
