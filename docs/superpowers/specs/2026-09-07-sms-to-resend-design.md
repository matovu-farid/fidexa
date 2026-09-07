# Inbound SMS to Resend Email Design

## Goal

Stop forwarding inbound SMS from the Fidexa Twilio number to Uganda and deliver each inbound text message to `farid@fidexa.org` through Resend.

## Scope

- Add a production-safe Twilio inbound SMS webhook to the existing Next.js app.
- Verify Twilio webhook signatures using the account auth token and the exact configured webhook URL.
- Parse Twilio's `application/x-www-form-urlencoded` payload.
- Send a plain-text email through the existing Resend integration to `farid@fidexa.org`.
- Include the Twilio message SID, sender, recipient number, received timestamp, and message body.
- Return valid empty TwiML after accepting the message so Twilio does not attempt a Uganda forward.
- Change the Twilio number's inbound SMS handler from the Uganda-forwarding TwiML Bin to the new webhook.
- Preserve the existing contact form email flow.
- Do not build an admin UI, message database, MMS attachment ingestion, or reply-by-email flow in this change.

## Architecture and data flow

1. A customer sends an SMS to the Fidexa Twilio number.
2. Twilio sends an `application/x-www-form-urlencoded` POST to `/api/webhooks/twilio/sms`.
3. The route validates `X-Twilio-Signature` against `TWILIO_AUTH_TOKEN` and `TWILIO_WEBHOOK_URL`.
4. The route validates the required Twilio fields, then calls Resend using the existing verified Fidexa sender domain.
5. Resend delivers the email to `farid@fidexa.org`.
6. The route returns `<Response></Response>` with `Content-Type: text/xml`.

The route rejects invalid signatures and malformed requests before calling Resend. Resend failures return a server error so Twilio records the webhook failure rather than silently losing the message.

## Configuration

Required production environment variables:

- `RESEND_API_KEY` — existing Resend API key.
- `TWILIO_AUTH_TOKEN` — Twilio Account Auth Token used for signature verification.
- `TWILIO_WEBHOOK_URL` — exact public HTTPS URL configured on the Twilio number.
- `SMS_FORWARD_EMAIL` — recipient, set to `farid@fidexa.org`.

The existing `CONTACT_EMAIL` remains unchanged for website contact submissions.

## Twilio configuration change

Replace the number's inbound SMS TwiML Bin handler (`US Number - SMS Forwarding to Uganda`) with the public webhook URL. The TwiML Bin must no longer send messages to `+256705222144`.

## Testing and verification

- Unit-test signature generation/verification and rejection of invalid signatures.
- Unit-test form parsing, required-field validation, email formatting, and Resend error handling.
- Use a Resend mock in automated tests; never send test mail to the real recipient.
- Run the focused webhook tests, the complete test suite, TypeScript checks, and the production build.
- Verify the Twilio number points at the webhook and the old TwiML Bin no longer forwards to Uganda.

