import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { featuredProjects } from "@/data/projects";
import { ProjectCard } from "./project-card";
import { Button } from "@/components/ui/button";

export function FeaturedProjects() {
  return (
    <section id="projects" className="section-rule section-block">
      <div className="site-shell">
        <div className="work-header">
          <div>
            <h2 className="section-title">A few things<br />we&apos;ve built.</h2>
          </div>
          <Button asChild variant="outline"><Link href="/projects">View all work <ArrowUpRight data-icon="inline-end" /></Link></Button>
        </div>
        <p className="body-copy mt-6 max-w-xl">Three products. The situations behind them, the decisions that shaped them, and what we delivered.</p>
        <div className="featured-grid">
          {featuredProjects.map((project) => <ProjectCard key={project.id} project={project} featured />)}
        </div>
        <nav className="work-discovery" aria-label="Featured work categories">
          <span>More from the studio</span>
          <Button asChild variant="ghost"><Link href="/projects">All work <ArrowUpRight data-icon="inline-end" /></Link></Button>
          <Button asChild variant="ghost"><Link href="/projects?category=ai-automation">AI + Automation <ArrowUpRight data-icon="inline-end" /></Link></Button>
          <Button asChild variant="ghost"><Link href="/projects?category=native-apps">Apple + Native <ArrowUpRight data-icon="inline-end" /></Link></Button>
          <Button asChild variant="ghost"><Link href="/projects?category=web-apps">Web Apps <ArrowUpRight data-icon="inline-end" /></Link></Button>
        </nav>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <p className="body-copy">Have a similar product or operational challenge?</p>
          <Button asChild><Link href="/#contact">Tell us about your project <ArrowUpRight data-icon="inline-end" /></Link></Button>
        </div>
      </div>
    </section>
  );
}
