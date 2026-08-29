# Fidexa virtual inbox implementation review

Date: 2026-08-29
Scope: signed inbound gateway, persistence model, Better Auth boundary, admin inbox shell, outbound send path, Resend events, retention, and private attachment proxy.

## Review method

The host did not expose the task-delegation API needed to start a separate reviewer task, so this review was performed as an independent pass over the complete worktree diff after implementation tests. Findings were converted into fixes and the affected checks were rerun.

## Findings and dispositions

| Severity | Finding | Disposition |
| --- | --- | --- |
| Critical | Unauthenticated users could be redirected into an authentication page nested under the protected admin layout, creating a redirect loop. | Fixed by moving the sign-in surface to `/admin-auth` and redirecting there from the protected layout. |
| Critical | Attachment access path was absent, so the private R2 design had no usable proxy. | Fixed with short-lived HMAC attachment tokens, an authenticated Next.js proxy, and a Worker-only R2 fetch branch. |
| High | Inbound attachment expiry was accidentally set to receipt time. | Fixed to receipt time plus 365 days. |
| High | Worker cleanup only called the app and did not delete expired R2 objects. | Fixed with scheduled `raw/` seven-day and `attachments/` 365-day prefix cleanup before app cleanup. |
| High | Resend sends could leave a pending row when the provider threw, and retries lacked an idempotency key. | Fixed by catching provider exceptions, marking the record failed, and passing the stored key to Resend. |
| High | Thread list joined every message and could render duplicate rows per conversation. | Fixed with `selectDistinctOn` and latest-message ordering. |
| High | Reply UI used the internal database message ID instead of the RFC `Message-ID` for reply threading. | Fixed in the reviewed shell version’s reply payload model; the API preserves RFC headers. |
| High | HMAC verification used ordinary string equality in the attachment path. | Fixed with Web Crypto HMAC verification. |
| Medium | The existing chat route and contact route accepted untyped JSON, and the installed AI React package did not match the current component API. | Fixed with Zod validation and the compatible `@ai-sdk/react` v1 dependency. |
| Medium | Pure helper tests imported a server-only module and failed outside a Next server context. | Fixed by moving recipient parsing to a pure module and lazy-loading the database client. |
| High | The visible shell rendered Archive and alias controls without handlers, so users could not perform the advertised actions. | Fixed by wiring active/archive and per-alias filters to the authenticated inbox query, and wiring read/unread/archive thread actions. |
| High | Successful sends left their autosaved draft behind because the draft ID was not carried into the send request. | Fixed by passing the draft ID and deleting it only after a successful provider response; failures retain the draft. |
| Medium | Malformed JSON in send, draft, and thread-action endpoints could surface as server errors. | Fixed with bounded JSON parsing and 400 responses. |
| Medium | Resend event audit rows stored the provider event ID as the payload hash. | Fixed by hashing the verified webhook body with SHA-256. |
| Medium | The planned contacts API was missing, and unthreaded drafts were not restored in the composer. | Fixed with an authenticated contacts query and explicit unthreaded-draft restore path. |

## Explicit residual boundaries

- No production secrets, database migration, R2 bucket, Worker deployment, Resend webhook, or Cloudflare route was changed during this implementation pass.
- The app and Worker must be deployed and configured before any of the five aliases are switched from their current Gmail routes.
- The current UI smoke fixture validates the protected shell and empty state; live authenticated message, attachment, and delivery-event flows require the production environment variables and database.
- The current UI smoke fixture validates the protected shell and empty state; live authenticated message, attachment, and delivery-event flows require the production environment variables and database. The source-level review also checked that the active shell’s controls now invoke the authenticated APIs.
- Gmail history is not imported. Only messages received after the Worker route is enabled will be ingested.
