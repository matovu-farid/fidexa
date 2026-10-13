import Link from "next/link";
import { site } from "@/data/site";
import { createPageMetadata } from "@/lib/seo";
import { ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export const metadata = {
  ...createPageMetadata(site.pages[2]),
  alternates: { canonical: "/sms" },
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
            <Card className="sms-card">
              <CardHeader>
              <p className="eyebrow">How to opt in</p>
              <CardTitle><h2 className="text-2xl">Text START to</h2></CardTitle>
              </CardHeader>
              <CardContent>
              <strong className="sms-number">+1 (302) 496-6237</strong>
              <p className="body-copy mt-8 max-w-2xl">Fidexa uses SMS only for customer-care conversations and account-related support. We do not use this program for marketing or lead generation.</p>
              <Separator className="my-6" /><div className="text-sm font-medium text-muted-foreground">HELP for help · STOP to opt out · Message and data rates may apply</div>
              <div className="mt-6 space-y-4 text-sm leading-6 text-muted-foreground">
                <p>Message frequency varies with your account activity and support requests. After opting out, you will receive one confirmation message and no further messages unless you re-subscribe.</p>
                <p>SMS consent is optional and is not a condition of purchasing any product or service.</p>
              </div>
              </CardContent>
            </Card>
            <Card className="sms-card theme-inverse">
              <CardHeader>
              <p className="eyebrow">Policy links</p>
              <CardTitle><h2 className="text-2xl">Keep the details close.</h2></CardTitle>
              </CardHeader>
              <CardFooter>
              <div className="legal-links">
                <Button asChild variant="ghost" className="min-h-11 justify-start"><Link href="https://rishi.fidexa.org/privacy">Privacy policy <ArrowUpRight /></Link></Button>
                <Button asChild variant="ghost" className="min-h-11 justify-start"><Link href="https://rishi.fidexa.org/terms">Terms and conditions <ArrowUpRight /></Link></Button>
                <Button asChild variant="ghost" className="min-h-11 justify-start"><a href="mailto:support@fidexa.org">support@fidexa.org <ArrowUpRight /></a></Button>
              </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
