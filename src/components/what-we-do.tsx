import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { studioEngines } from "@/data/services";

export function WhatWeDo() {
  return (
    <section id="studio" className="section-rule section-block studio-section">
      <div className="site-shell">
        <div className="split-heading">
          <h2 className="section-title">One studio.<br />Two engines.</h2>
          <p className="body-copy">We build for clients and pursue ideas of our own. Both are grounded in making useful products.</p>
        </div>
        <div className="engine-grid mt-10">
          {studioEngines.map((engine) => (
            <Card className="engine-card gap-6 rounded-none border-0 bg-transparent p-0 shadow-none" key={engine.name}>
              <CardHeader className="p-0">
                <CardTitle><h3>{engine.name}</h3></CardTitle>
                <CardDescription className="engine-description">{engine.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <p className="engine-meta">{engine.scope}</p>
                <ol className="process-list" aria-label={`${engine.name} process`}>
                  {engine.steps.map((step, index) => <li className="process-row" key={step}><span className="process-index">0{index + 1}</span><span>{step}</span></li>)}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
