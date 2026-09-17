export function CompanyProfile() {
  return (
    <section id="company" className="section-rule section-block" aria-labelledby="company-title">
      <div className="site-shell">
        <div className="company-profile-grid">
          <div className="company-profile-intro">
            <p className="eyebrow">04 / Company</p>
            <h2 id="company-title" className="section-title mt-5">Independent by design. Accountable by default.</h2>
            <p className="body-copy mt-6">
              Fidexa is an independent, founder-led product studio. Founded and led by Farid Matovu, Founder &amp; Product Engineer, from Kampala, Uganda — working remotely across GMT+3.
            </p>
            <p className="company-profile-experience mt-8">
              <span className="eyebrow">Founder experience</span>
              <strong>7+ years of professional delivery</strong>
              <span>Across products built for real teams and customers.</span>
            </p>
          </div>

          <div className="company-profile-details">
            <article className="company-profile-card dark-card">
              <p className="eyebrow">One accountable partner</p>
              <h3>From first question to what comes after launch.</h3>
              <p>Fidexa is operated by Farid alone, so you work directly with the founder through discovery, product decisions, building, launch, and support.</p>
              <ul aria-label="How Fidexa works">
                <li>Direct collaboration</li>
                <li>Focused engagements</li>
                <li>Support after launch</li>
              </ul>
            </article>
            <div className="company-profile-proof" aria-label="Selected product work">
              <span>Product proof</span>
              <p>Rishi <i aria-hidden="true">·</i> lending <i aria-hidden="true">·</i> inventory</p>
            </div>
            <div className="company-profile-links">
              <a href="https://matovu-farid.com" target="_blank" rel="noreferrer">Founder portfolio <span aria-hidden="true">↗</span></a>
              <a href="https://www.linkedin.com/in/matovu-farid/" target="_blank" rel="noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </div>
        <a className="button-primary company-profile-cta" href="#contact">Talk about a project <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  );
}
