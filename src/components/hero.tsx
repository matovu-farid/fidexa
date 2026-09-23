import { ArrowUpRight } from "lucide-react";
import { Nav } from "./nav";
import { Logo } from "./logo";
import { AnalyticsLink } from "./analytics-link";

export function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-panel dark-card">
        <Nav embedded />
        <div className="hero-orb hero-orb-halo" aria-hidden="true" />
        <div className="hero-orb hero-orb-violet" aria-hidden="true" />
        <div className="hero-orb hero-orb-mint" aria-hidden="true" />
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow text-[#37d6c0]">Software studio / Kampala ↗</p>
            <h1 className="display-title hero-title mt-6">We build software products from first idea to everyday use.</h1>
            <p className="body-copy mt-7">Fidexa partners with companies to turn complex operations, new ideas, and ambitious plans into thoughtful digital products.</p>
            <div className="hero-actions mt-9">
              <AnalyticsLink events={["hero_cta_clicked"]} className="button-primary bg-[#fcf9f0] text-[#1e1811] hover:bg-[#37d6c0]" href="#contact">Tell us about your project <ArrowUpRight size={15} /></AnalyticsLink>
              <a className="button-secondary mobile-start-project" href="#projects">See selected work <ArrowUpRight size={15} /></a>
              </div>
            </div>
          <div className="hero-visual" aria-hidden="true">
            <Logo className="hero-visual-logo" size={176} variant="reversed" />
          </div>
          <div className="hero-proof">
            <p className="eyebrow text-[#37d6c0]">Built in two directions</p>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.08em] text-[#f7f9fc]">Client products / Web · Mobile · Systems</p>
            <p className="mt-2 text-xs text-[#aab4c5]">Own products / Rishi · AI · Native Apple</p>
          </div>
        </div>
        <div className="hero-rail" aria-hidden="true">
          <span>01 / Client products</span>
          <span>02 / Own products</span>
          <span>Fidexa studio ↗</span>
        </div>
      </div>
    </section>
  );
}
