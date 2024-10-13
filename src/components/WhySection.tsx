// components/WhySection.tsx
import Link from "next/link";

export default function WhySection() {
  return (
    <section className="w-full min-h-screen flex flex-col justify-center items-center text-center p-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          We believe that digital transformation should be{" "}
          <span className="text-accent">inspiring</span> and{" "}
          <span className="text-accent">empowering</span>.
        </h1>
        <p className="text-xl md:text-2xl mb-12 text-muted-foreground">
          At Fidexa, we help you bring your vision to life through cutting-edge
          technology and innovative solutions.
        </p>
        <Link
          href="/chat"
          className="text-lg px-8 py-6 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          Get Started
        </Link>
      </div>
    </section>
  );
}
