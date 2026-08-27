export function Hero() {
  return (
    <section className="hero-section">
      <div className="site-shell">
        <div className="hero-panel dark-card">
          <div className="hero-orb hero-orb-halo" aria-hidden="true" />
          <div className="hero-orb hero-orb-violet" aria-hidden="true" />
          <div className="hero-orb hero-orb-mint" aria-hidden="true" />
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow text-[#36d6bf]">Software studio · East Africa</p>
              <h1 className="display-title hero-title mt-6">Build what matters next.</h1>
              <p className="body-copy mt-7">Fidexa turns ambitious ideas into useful apps, platforms, and systems — then keeps making the next version better.</p>
              <div className="hero-actions mt-9">
                <a className="button-primary bg-[#6f55e8] hover:bg-[#36d6bf] hover:text-[#101828]" href="#contact">Start a project <span aria-hidden="true">↗</span></a>
                <a className="button-secondary" href="#projects">View selected work <span aria-hidden="true">↓</span></a>
              </div>
            </div>
            <div className="hero-proof">
              <p className="eyebrow text-[#36d6bf]">Client work</p>
              <p className="mt-4 text-lg font-bold text-[#f7f9fc]">Apps · platforms · systems</p>
              <p className="mt-2">Built for the next useful step.</p>
              <div className="mt-7 h-1 w-2/3 rounded-full bg-[#36d6bf]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
