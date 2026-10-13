import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Nav } from "./nav";
import { AnalyticsLink } from "./analytics-link";
import { HeroShowcase } from "./hero-showcase";

export function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-panel dark-card theme-inverse">
        <Nav embedded />
        <div className="hero-grid">
          <div className="hero-copy">
            <h1 className="hero-title">
              <span className="hero-statement">We build<br />software products</span>{" "}
              <span className="hero-continuation">from first idea to <span>everyday use.</span></span>
            </h1>
            <p className="body-copy hero-intro">Fidexa partners with companies to turn complex operations, new ideas, and ambitious plans into thoughtful digital products.</p>
            <div className="hero-actions">
              <Button asChild size="lg" className="hero-contact"><AnalyticsLink events={["hero_cta_clicked"]} href="#contact">Discuss a project <ArrowUpRight data-icon="inline-end" /></AnalyticsLink></Button>
              <Button asChild size="lg" variant="outline"><a href="#projects">See our work <ArrowUpRight data-icon="inline-end" /></a></Button>
            </div>
          </div>
          <div className="hero-product-proof"><HeroShowcase /></div>
        </div>
        <div className="hero-rail">
          <span>Independent software studio · Kampala / Remote</span>
          <span>Client solutions + our own products</span>
          <a href="#studio">Meet the studio <ArrowUpRight size={14} /></a>
        </div>
      </div>
    </section>
  );
}
