# Fidexa Virtual Inbox Design

Date: 2026-08-29
Status: Approved for implementation

## Goal

Add an admin-only virtual email inbox to Fidexa. New messages sent to the existing Fidexa aliases should be captured in Fidexa, retained for one year, searchable, threaded, and replyable from the same interface while a copy continues to arrive at `matovu90@gmail.com`.

This is not intended to replace Gmail as a general-purpose personal mailbox. Fidexa is the operational workspace for company conversations; Gmail remains a parallel delivery destination.

## Approved decisions

- Use the traditional three-pane inbox layout.
- Capture only new messages after the Worker is enabled; do not import Gmail history.
- Keep parsed messages and attachments for one year.
- Keep original raw MIME privately for seven days, then delete it.
- Accept only `hello@`, `sales@`, `support@`, `info@`, and `faridmatovu@fidexa.org`.
- Preserve forwarding to `matovu90@gmail.com`.
- Automatically create a CRM contact for an unknown sender; create opportunities manually.
- Use Better Auth magic links and passkeys; access is limited to Fidexa administrators.
- Allow full-text search across sender, subject, and message text.
- Sanitize HTML, block scripts, and provide a plain-text fallback.
- Store attachments privately in R2, block executable types, enforce size limits, and issue expiring download links.
- Allow reply, reply-all, new messages, To/CC/BCC, quoted history, and attachments.
- Allow only verified Fidexa aliases as senders; replies default to the alias that received the message.
- Auto-save drafts and restore them when reopening the inbox.
- Send immediately after an explicit Send action. Record the message before calling Resend.
- On failure or bounce, preserve the message/draft and offer manual retry.
- Show in-app unread state; Gmail forwarding remains the natural external notification.
- Record views, sends, retries, archives, and deletes in an audit trail.

## Architecture

Cloudflare Email Routing sends the five aliases to a dedicated Email Worker. The Worker validates the recipient, parses the MIME message, and sends a signed request to Fidexa's inbound ingestion endpoint. It independently forwards the original message to the verified Gmail destination, so temporary Fidexa failures do not remove the personal copy.

The Fidexa Next.js app owns the admin UI, API authorization, message/thread persistence, CRM contact creation, full-text search, draft persistence, and outbound send endpoint. A separate Neon PostgreSQL database is used for Fidexa data. Private R2 storage holds attachments and the seven-day raw-MIME recovery copy.

Resend remains the outbound provider. Fidexa records an outbound message first, sends through the existing verified `fidexa.org` domain, and consumes signed Resend webhook events to update delivery state. The MVP observes sent, delivered, delayed, bounced, failed, suppressed, and complaint events; it does not use open or click tracking.

## Data flow

### Inbound

1. Cloudflare receives mail for an allowlisted alias.
2. The Worker rejects or ignores unallowlisted recipients and loop-like messages.
3. The Worker reads the raw MIME stream, parses text/HTML, headers, inline parts, and attachments.
4. The Worker stores the raw MIME in private R2 with a seven-day expiry and submits a signed, idempotent ingestion request to Fidexa.
5. Fidexa sanitizes HTML, stores parsed content, creates or links a thread using `Message-ID`, `In-Reply-To`, and `References`, stores attachment metadata, and creates an unknown-sender contact when necessary.
6. The Worker forwards the original email to `matovu90@gmail.com` independently.
7. Retries are idempotent; a failure in one destination does not prevent the other. Persistent failures are observable and recoverable.

### Outbound

1. An administrator opens a thread or Compose and edits an auto-saved draft.
2. The server validates Better Auth, the sender alias, recipients, body, attachment policy, and an idempotency key.
3. Fidexa creates the outbound message in a pending state and calls Resend with threading headers when replying.
4. The UI shows the immediate provider result and later webhook state transitions.
5. A failure preserves the content and exposes a manual retry action. A retry cannot create a duplicate provider send for the same idempotency key.

## Storage model

- `mail_threads`: subject, normalized subject, receiving alias, linked contact, unread/archive state, timestamps.
- `mail_messages`: direction, provider IDs, RFC message headers, sender/recipient fields, sanitized HTML, text body, status, raw-MIME key, expiry, timestamps.
- `mail_attachments`: message ID, R2 key, filename, MIME type, byte size, checksum, expiry.
- `mail_drafts`: thread, sender/recipients, subject, body, attachment references, updated timestamp.
- `mail_contacts`: normalized email, name, source, created/updated timestamps; integrated with the existing CRM data boundary.
- `mail_events`: provider/event IDs and payload hash for idempotent Worker and Resend processing.
- `mail_audit_logs`: administrator, action, object, timestamp, and safe metadata.

Expired messages, raw MIME, and attachments are cleaned by a scheduled job. Deletion is logged; expired content is not recoverable from the application.

## API boundary

- `POST /api/inbox/ingest` — signed Worker-only ingestion.
- `POST /api/webhooks/resend` — signed Resend event ingestion.
- `GET /api/admin/inbox` — authenticated listing, filters, and full-text search.
- `GET /api/admin/inbox/threads/:id` — authenticated thread detail.
- `POST /api/admin/inbox/send` — authenticated, alias-restricted outbound send.
- `POST /api/admin/inbox/drafts` — authenticated draft create/update.
- `GET /api/admin/inbox/attachments/:id` — authenticated short-lived R2 URL.

All write endpoints validate input with schemas, apply rate limits, and return safe errors without exposing provider secrets or raw message content in logs.

## UI and behavior

The admin route uses the approved three-pane layout:

- Left rail: Inbox, Sent, Drafts, Archive, aliases, Contacts, Audit log.
- Message list: unread state, sender, subject, alias, time, delivery state, and search/filter controls.
- Detail pane: sanitized thread, quoted history, attachment links, CRM contact context, next action, Reply, Reply all, Archive, and More actions.
- Composer: From, To, CC, BCC, subject, body, attachments, auto-save state, explicit Send button, and delivery result.

The UI must clearly distinguish inbound, draft, pending, delivered, delayed, bounced, failed, and archived states. It must never render unsanitized email HTML or allow a message to send without an explicit action.

## Security and privacy

- Better Auth protects all admin routes and APIs; an allowlist gates Fidexa administrators.
- Passkeys use WebAuthn platform credentials; biometric material never enters Fidexa.
- Worker-to-app ingestion uses a dedicated secret and timestamp/replay protection.
- Resend webhooks are verified using their signing secret and deduplicated.
- R2 objects are private; downloads use short-lived signed URLs.
- Executable and script-bearing attachments are blocked; content type and size are validated from bytes where practical.
- HTML is sanitized server-side and client-side rendering never permits scripts, forms, or unsafe URLs.
- Logs contain IDs and operational metadata, not message bodies or secrets.

## Testing and rollout

- Unit-test MIME parsing, sanitization, alias validation, thread matching, attachment policy, idempotency, retention, and Resend event transitions.
- Integration-test signed Worker ingestion, Gmail forwarding failure independence, R2 access, Better Auth protection, draft recovery, and outbound retry.
- Use a local Worker fixture and a Resend webhook fixture; do not send test mail to real recipients during automated tests.
- Deploy the app and Worker before changing routing.
- Enable one non-critical alias first, verify storage and Gmail forwarding, then enable the remaining aliases.
- Keep the existing direct-routing configuration documented for rollback.

## Explicit non-goals

- Gmail history import or Gmail synchronization.
- Public inbox access.
- A general-purpose mailbox replacement.
- Automatic opportunity creation.
- Open/click tracking.
- Catch-all routing.
- Automatic outbound replies.
