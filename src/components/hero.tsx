export function Hero() {
  return (
    <section className="hero-section">
      <div className="site-shell">
        <div className="hero-panel dark-card">
          <a className="absolute right-8 top-8 z-20 hidden text-xs font-bold uppercase tracking-[0.12em] text-[#f7f9fc] transition-colors hover:text-[#37d6c0] md:block" href="#contact">Start a project ↗</a>
          <div className="hero-orb hero-orb-halo" aria-hidden="true" />
          <div className="hero-orb hero-orb-violet" aria-hidden="true" />
          <div className="hero-orb hero-orb-mint" aria-hidden="true" />
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow text-[#37d6c0]">Software studio · Kampala ↗</p>
              <h1 className="display-title hero-title mt-6"><span className="hero-desktop-title">We build software for people moving forward.</span><span className="hero-mobile-title">Build what matters next.</span></h1>
              <p className="body-copy mt-7">Client work funds our own products. One studio, two engines.</p>
              <div className="hero-actions mt-9">
                <a className="button-primary bg-[#fcf9f0] text-[#1e1811] hover:bg-[#37d6c0]" href="#projects">View selected work <span aria-hidden="true">↗</span></a>
                <a className="button-secondary mobile-start-project" href="#contact">Start a project <span aria-hidden="true">↗</span></a>
              </div>
            </div>
            <div className="hero-proof">
              <p className="eyebrow text-[#37d6c0]">Client work / own products</p>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.08em] text-[#f7f9fc]">Client solutions / Web · Mobile · AI</p>
              <p className="mt-2 text-xs text-[#aab4c5]">Innovation lab / Products · Experiments</p>
              <div className="mt-7 h-1 w-2/3 rounded-full bg-[#37d6c0]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
