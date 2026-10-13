import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function CompanyProfile() {
  return (
    <section id="company" className="section-rule section-block company-section" aria-labelledby="company-title">
      <div className="site-shell">
        <div className="company-profile-grid">
          <div className="company-profile-intro">
            <h2 id="company-title" className="section-title">Work directly with the founder.</h2>
            <p className="body-copy mt-6">
              Fidexa is an independent software studio based in Kampala, Uganda and working remotely in GMT+3. Founded and led by Farid Matovu, Founder &amp; Product Engineer.
            </p>
            <dl className="company-profile-facts">
              <div>
                <dt>Base</dt>
                <dd>Kampala / Remote GMT+3</dd>
              </div>
              <div>
                <dt>Founder experience</dt>
                <dd>7+ years professional delivery</dd>
              </div>
              <div>
                <dt>Operating model</dt>
                <dd>Solo founder-led since April 2025</dd>
              </div>
            </dl>
          </div>

          <div className="company-profile-details">
            <Card className="company-profile-card gap-5 rounded-none border-0 bg-transparent p-0 shadow-none">
              <CardHeader className="p-0">
                <CardTitle><h3>Farid Matovu</h3></CardTitle>
                <CardDescription>Founder &amp; Product Engineer</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <p>Farid directly leads discovery, domain modelling, product design, implementation, deployment, and support.</p>
              </CardContent>
              <CardFooter className="p-0">
                <Button asChild variant="outline">
                  <a href="https://matovu-farid.com" target="_blank" rel="noopener noreferrer">Founder portfolio <ArrowUpRight data-icon="inline-end" /></a>
                </Button>
              </CardFooter>
            </Card>
            <div className="company-profile-proof" aria-label="Selected product work">
              <p>Rishi Reader + production money-lending + inventory/trade platforms</p>
            </div>
            <div className="company-profile-actions">
              <Button asChild><a href="#contact">Talk about a project <ArrowUpRight data-icon="inline-end" /></a></Button>
              <div className="company-profile-links">
                <Button asChild variant="ghost"><a href="https://www.linkedin.com/in/matovu-farid/" target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight data-icon="inline-end" /></a></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
