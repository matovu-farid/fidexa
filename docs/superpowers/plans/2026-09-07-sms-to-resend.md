# Inbound SMS to Resend Email Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route inbound SMS from the Fidexa Twilio number to `farid@fidexa.org` through Resend instead of forwarding messages to Uganda.

**Architecture:** Add a Node-runtime Next.js webhook that parses Twilio form payloads, verifies the `X-Twilio-Signature` with the configured public webhook URL and Twilio auth token, and sends a plain-text email through the existing Resend dependency. Then configure the Twilio phone number's inbound SMS handler to use the deployed webhook URL and remove the Uganda-forwarding TwiML Bin from the active flow.

**Tech Stack:** Next.js App Router, TypeScript, Node `crypto`, Resend SDK, Vitest, Twilio Console.

---

### Task 1: Add the tested Twilio SMS domain helpers

**Files:**
- Create: `src/lib/twilio-sms.ts`
- Create: `src/lib/twilio-sms.test.ts`

- [ ] **Step 1: Write the failing tests**

Add tests for signature generation/verification, malformed payload rejection, and deterministic email formatting. The tests should import the not-yet-created helpers `createTwilioSignature`, `isValidTwilioSignature`, `parseTwilioSmsPayload`, and `formatSmsEmail`.

- [ ] **Step 2: Run the focused tests and verify the expected failure**

Run: `pnpm test src/lib/twilio-sms.test.ts`

Expected: FAIL because `src/lib/twilio-sms.ts` does not exist yet.

- [ ] **Step 3: Implement the minimal helpers**

Implement:

- HMAC-SHA1 + base64 Twilio signature generation over `url + sorted form key/value pairs`.
- Constant-time signature comparison with `timingSafeEqual`.
- Required fields: `MessageSid`, `From`, `To`, and `Body`.
- Plain-text formatting containing the SID, sender, recipient, received timestamp, and body.

- [ ] **Step 4: Run the focused tests and verify they pass**

Run: `pnpm test src/lib/twilio-sms.test.ts`

Expected: PASS with all focused tests green.

- [ ] **Step 5: Commit the helper and tests**

```bash
git add src/lib/twilio-sms.ts src/lib/twilio-sms.test.ts
git commit -m "feat: add Twilio SMS webhook helpers"
```

### Task 2: Add the Resend-backed inbound webhook

**Files:**
- Create: `src/app/api/webhooks/twilio/sms/route.ts`
- Create: `src/app/api/webhooks/twilio/sms/route.test.ts`

- [ ] **Step 1: Write the failing route tests**

Cover:

- invalid signature returns `401` and does not call Resend;
- missing required form fields returns `400` and does not call Resend;
- valid Twilio payload calls Resend once with `farid@fidexa.org`, the verified Fidexa sender, a useful subject, and the formatted SMS body;
- Resend failure returns `502`.

- [ ] **Step 2: Run the route tests and verify the expected failure**

Run: `pnpm test src/app/api/webhooks/twilio/sms/route.test.ts`

Expected: FAIL because the route and test dependencies do not exist yet.

- [ ] **Step 3: Implement the route**

Use `runtime = "nodejs"`, read `application/x-www-form-urlencoded` with `req.formData()`, require `TWILIO_AUTH_TOKEN` and `TWILIO_WEBHOOK_URL`, verify `X-Twilio-Signature`, call Resend with `SMS_FORWARD_EMAIL || "farid@fidexa.org"`, and return empty TwiML with `Content-Type: text/xml` on success. Use `500` for missing server configuration and `502` for Resend failure.

- [ ] **Step 4: Run the route tests and verify they pass**

Run: `pnpm test src/app/api/webhooks/twilio/sms/route.test.ts`

Expected: PASS with all route tests green.

- [ ] **Step 5: Commit the webhook**

```bash
git add src/app/api/webhooks/twilio/sms/route.ts src/app/api/webhooks/twilio/sms/route.test.ts
git commit -m "feat: email inbound Twilio SMS through Resend"
```

### Task 3: Configure deployment and Twilio

**Files:**
- Modify: deployment environment configuration using the platform's secret manager; do not commit secrets.
- Modify: Twilio number configuration in the Twilio Console.

- [ ] **Step 1: Confirm the deployed Fidexa origin**

Use `https://www.fidexa.org/api/webhooks/twilio/sms` as the exact production `TWILIO_WEBHOOK_URL`.

- [ ] **Step 2: Configure production secrets**

Set `TWILIO_AUTH_TOKEN`, `TWILIO_WEBHOOK_URL`, and `SMS_FORWARD_EMAIL=farid@fidexa.org` in the deployment environment. Keep `RESEND_API_KEY` in the existing secret configuration.

- [ ] **Step 3: Update the Twilio phone number**

Change inbound SMS handling from the `US Number - SMS Forwarding to Uganda` TwiML Bin to the deployed webhook URL. Do not change Geo Permissions or A2P registration.

- [ ] **Step 4: Verify the Twilio configuration**

Confirm the number points to the webhook, the TwiML Bin is no longer active for inbound SMS, and no active configuration references `+256705222144`.

### Task 4: Full verification

**Files:**
- No additional files.

- [ ] **Step 1: Run all automated tests**

Run: `pnpm test`

Expected: exit code `0` with no failed tests.

- [ ] **Step 2: Run TypeScript verification**

Run: `pnpm exec tsc --noEmit`

Expected: exit code `0` with no TypeScript errors.

- [ ] **Step 3: Run the production build**

Run: `pnpm build`

Expected: exit code `0` with the new route included in the build.

- [ ] **Step 4: Verify the live endpoint and Twilio path**

Use a signed form request against the deployed route without sending real email, then inspect Twilio's number configuration and a real controlled SMS only if the endpoint and secrets are confirmed. Verify the received email at `farid@fidexa.org` and confirm no Uganda-forwarding message is created.
