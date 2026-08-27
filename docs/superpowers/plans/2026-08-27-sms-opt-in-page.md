# SMS Opt-In Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a public Fidexa page that documents explicit customer-care SMS opt-in for Twilio A2P campaign evidence.

**Architecture:** Add one static App Router page at `/sms` using the existing Fidexa layout and styling. The page will state the opt-in keyword, message purpose, frequency, rates, STOP/HELP controls, and link to the existing Rishi privacy policy and terms; it will not collect or store data.

**Tech Stack:** Next.js 16, React 19, TypeScript, existing Fidexa Tailwind/CSS components.

---

### Task 1: Add the public SMS opt-in page

**Files:**
- Create: `src/app/sms/page.tsx`

- [ ] **Step 1: Create the static page**

```tsx
import Link from "next/link";

export const metadata = {
  title: "SMS Customer Care Opt-In | Fidexa",
  description: "Fidexa customer-care SMS opt-in and support messaging information.",
};

export default function SmsOptInPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-20 text-foreground">
      <div className="mx-auto max-w-2xl">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Fidexa Customer Care
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          SMS support opt-in
        </h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground">
          Fidexa uses SMS only for customer-care conversations and account-related
          support. We do not use this program for marketing or lead generation.
        </p>

        <section className="mt-10 rounded-2xl border border-white/[0.1] bg-white/[0.03] p-6">
          <h2 className="text-lg font-medium">How to opt in</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Text <strong className="text-foreground">START</strong> to{" "}
            <strong className="text-foreground">+1 (302) 496-6237</strong> to
            opt in to Fidexa customer-care SMS. By texting START, you agree to
            receive conversational support messages from Fidexa, LLC about your
            account, application, product support, and service updates.
          </p>
        </section>

        <section className="mt-8 space-y-4 text-sm leading-6 text-muted-foreground">
          <p>
            Message frequency varies with your account activity and support
            requests. Message and data rates may apply. Reply HELP for help and
            STOP to opt out. After opting out, you will receive one confirmation
            message and no further messages unless you re-subscribe.
          </p>
          <p>
            For details about data handling and messaging terms, read our{" "}
            <Link className="underline underline-offset-4" href="https://rishi.fidexa.org/privacy">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link className="underline underline-offset-4" href="https://rishi.fidexa.org/terms">
              Terms and Conditions
            </Link>
            .
          </p>
          <p>
            Customer-care questions can be sent to support@fidexa.org.
          </p>
        </section>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Run the production build**

Run: `pnpm build`
Expected: Next.js build exits with code 0 and includes the `/sms` route.

- [ ] **Step 3: Commit the page**

Run: `git add src/app/sms/page.tsx && git commit -m "feat: add SMS opt-in page"`
Expected: one commit containing only the new page.

### Task 2: Deploy and verify the evidence URL

**Files:**
- No additional files.

- [ ] **Step 1: Push the Fidexa commit to the configured deployment branch**

Run: `git push origin main`
Expected: the remote accepts the commit and the connected deployment starts.

- [ ] **Step 2: Verify the public page**

Open: `https://www.fidexa.org/sms`
Expected: the page publicly displays the START opt-in instruction, phone number, customer-care purpose, STOP/HELP instructions, message-rate disclosure, and legal links.

### Task 3: Resubmit the Twilio A2P campaign

**Files:**
- No local files.

- [ ] **Step 1: Update the consent description**

Use `https://www.fidexa.org/sms` as the public opt-in evidence URL and state that users text START to +1 (302) 496-6237 after reviewing the CTA.

- [ ] **Step 2: Run Twilio’s campaign check**

Expected: the prior opt-in evidence and explicit-consent errors are cleared.

- [ ] **Step 3: Submit only after the review is clean**

Expected: Twilio accepts the campaign for carrier review or displays a pending-review status. Do not send test traffic.
