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
