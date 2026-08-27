import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "SMS Customer Care Opt-In | Fidexa",
  description: "Fidexa customer-care SMS opt-in and support messaging information.",
};

export default function SmsOptInPage() {
  return (
    <>
      <Nav />
      <main className="page-main">
        <div className="site-shell">
          <div className="split-heading">
            <div>
              <p className="eyebrow">SMS support</p>
              <h1 className="section-title mt-5">Customer care, clearly disclosed.</h1>
            </div>
            <p className="body-copy">A utility page for consent, help, stop, and account support — never marketing.</p>
          </div>
          <div className="sms-grid mt-12">
            <section className="sms-card editorial-card">
              <p className="eyebrow">How to opt in</p>
              <h2 className="mt-8 text-2xl font-bold tracking-[-0.04em]">Text START to</h2>
              <strong className="sms-number">+1 (302) 496-6237</strong>
              <p className="body-copy mt-8 max-w-2xl">Fidexa uses SMS only for customer-care conversations and account-related support. We do not use this program for marketing or lead generation.</p>
              <div className="mt-8 border-t border-[#101828]/15 pt-5 text-sm font-bold text-[#667087]">HELP for help · STOP to opt out · Message and data rates may apply</div>
              <div className="mt-6 space-y-4 text-sm leading-6 text-[#667087]">
                <p>Message frequency varies with your account activity and support requests. After opting out, you will receive one confirmation message and no further messages unless you re-subscribe.</p>
                <p>SMS consent is optional and is not a condition of purchasing any product or service.</p>
              </div>
            </section>
            <aside className="sms-card dark-card">
              <p className="eyebrow text-[#36d6bf]">Policy links</p>
              <h2 className="mt-7 text-2xl font-bold tracking-[-0.04em]">Keep the details close.</h2>
              <div className="legal-links">
                <Link href="https://rishi.fidexa.org/privacy">Privacy policy ↗</Link>
                <Link href="https://rishi.fidexa.org/terms">Terms and conditions ↗</Link>
                <a href="mailto:support@fidexa.org" className="text-[#36d6bf]">support@fidexa.org ↗</a>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
