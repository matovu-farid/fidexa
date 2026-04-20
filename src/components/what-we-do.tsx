export function WhatWeDo() {
  return (
    <section className="border-t border-white/[0.06] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          What We Do
        </p>
        <h2 className="mb-10 text-2xl font-semibold tracking-tight sm:text-3xl">
          Two sides of the same coin
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8">
            <h3 className="mb-3 text-lg font-semibold">Client Solutions</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We build apps, websites, and platforms for clients. Web
              applications, mobile apps, full-stack systems, and e-commerce
              solutions — tailored to your needs.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8">
            <h3 className="mb-3 text-lg font-semibold">Innovation Lab</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Client work funds our own R&D. We build products like Rishi —
              pushing boundaries in AI, cross-platform development, and
              developer tools.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
