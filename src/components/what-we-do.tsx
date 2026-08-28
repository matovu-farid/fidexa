const engineSteps = [
  {
    eyebrow: "Client solutions",
    title: "End-to-end product building.",
    meta: "Discovery sprint · Core build · Support",
    steps: ["Understand the opportunity", "Build the useful release", "Launch and improve"],
    tone: "dark-card",
  },
  {
    eyebrow: "Innovation lab",
    title: "Products with a point of view.",
    meta: "Rishi · AI · Native Apple",
    steps: ["Research the signal", "Shape the product", "Ship the point of view"],
    tone: "sand-card",
  },
] as const;

export function WhatWeDo() {
  return (
    <section id="studio" className="section-rule section-block">
      <div className="site-shell">
        <div className="split-heading">
          <div>
            <p className="eyebrow">03 / Studio</p>
            <h2 className="section-title mt-5">One studio. Two engines.</h2>
          </div>
          <p className="body-copy">We take products from a sharp first idea to a dependable everyday experience.</p>
        </div>
        <div className="engine-grid mt-12">
          {engineSteps.map((engine, index) => (
            <article className={`engine-card ${engine.tone}`} key={engine.eyebrow}>
              <p className={`eyebrow ${index === 0 ? "text-[#37d6c0]" : "text-[#101828]"}`}>{engine.eyebrow}</p>
              <h3 className="mt-10 text-3xl font-bold tracking-[-0.05em]">{engine.title}</h3>
              <p className="engine-meta mt-3">{engine.meta}</p>
              <ol className="process-list" aria-label={`${engine.eyebrow} process`}>
                {engine.steps.map((step, stepIndex) => (
                  <li className="process-row" key={step}>
                    <span className="process-index">0{stepIndex + 1}</span>
                    <span>{step}</span>
                    <span aria-hidden="true">↗</span>
                  </li>
                ))}
              </ol>
              <p className="engine-description">{index === 0 ? "We partner with companies to shape, build, and evolve software around the way their teams and customers work." : "We also build our own products and experiments, following ideas we want to make real."}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
