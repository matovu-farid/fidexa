export function CompanyProfile() {
  return (
    <section id="company" className="section-rule section-block" aria-labelledby="company-title">
      <div className="site-shell">
        <div className="company-profile-grid">
          <div className="company-profile-intro">
            <p className="eyebrow">04 / Company</p>
            <h2 id="company-title" className="section-title mt-5">A focused studio, with clear accountability.</h2>
            <p className="body-copy mt-6">
              Fidexa is an independent software studio based in Kampala, Uganda and working remotely in GMT+3. It builds and supports products for clients and through its own innovation lab. Founded and led by Farid Matovu, Founder &amp; Product Engineer.
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
            <article className="company-profile-card dark-card">
              <p className="eyebrow">Founder accountability</p>
              <h3>Farid Matovu leads the work from discovery to support.</h3>
              <p>As Fidexa&apos;s sole founder and product engineer, Farid directly leads discovery, domain modelling, product design, implementation, deployment, and support.</p>
            </article>
            <div className="company-profile-proof" aria-label="Selected product work">
              <span>Product proof</span>
              <p>Rishi Reader + production money-lending + inventory/trade platforms</p>
            </div>
            <div className="company-profile-actions">
              <a className="button-primary company-profile-cta" href="#contact">Talk about a project <span aria-hidden="true">↗</span></a>
              <div className="company-profile-links">
                <a href="https://matovu-farid.com" target="_blank" rel="noopener noreferrer">Founder portfolio <span aria-hidden="true">↗</span></a>
                <a href="https://www.linkedin.com/in/matovu-farid/" target="_blank" rel="noopener noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
