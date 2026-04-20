export function Hero() {
  return (
    <section className="flex min-h-screen items-center justify-center px-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Software Studio
        </p>
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          We build software that{" "}
          <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            improves lives
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
          Innovative digital products and client solutions. From concept to
          launch, we turn ideas into polished software.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <a
            href="#projects"
            className="rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            View Our Work
          </a>
          <a
            href="#contact"
            className="rounded-lg border border-white/[0.15] px-6 py-3 text-sm text-muted-foreground transition-colors hover:border-white/[0.3] hover:text-foreground"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  );
}
