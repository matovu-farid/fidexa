import { Bot, Globe, Layers3, Smartphone } from "lucide-react";

const capabilities = [
  { icon: Globe, label: "Web apps", copy: "Interfaces that make complex work feel simple." },
  { icon: Smartphone, label: "Apple + native", copy: "Focused experiences for the devices people use." },
  { icon: Bot, label: "AI + automation", copy: "Intelligence that helps people move faster." },
  { icon: Layers3, label: "Systems + tooling", copy: "Reliable foundations for the next stage." },
];

export function Capabilities() {
  return (
    <section className="section-rule section-block">
      <div className="site-shell">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Capabilities</p>
            <h2 className="section-title mt-5">The right shape for the job.</h2>
          </div>
          <p className="body-copy">Start with the problem, not the stack. We bring product thinking, engineering depth, and a bias toward the simplest useful system.</p>
        </div>
        <div className="capability-grid mt-12">
          {capabilities.map(({ icon: Icon, label, copy }, index) => (
            <article key={label} className={`capability-card ${index % 2 === 0 ? "editorial-card" : "mint-card"}`}>
              <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
              <h3 className="mt-10 text-lg font-bold tracking-[-0.03em]">{label}</h3>
              <p className="mt-3 text-sm leading-5 text-[#667087]">{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
