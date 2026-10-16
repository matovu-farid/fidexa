import { ChevronDown } from "lucide-react";
import type { ProjectEvidence as Evidence } from "@/data/projects";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProjectEvidence({ evidence }: { evidence: Evidence }) {
  return (
    <details className="project-evidence">
      <summary className={cn(buttonVariants({ variant: "outline" }), "project-evidence-trigger h-auto min-h-11 whitespace-normal")}>
        Explore the rental workflows <ChevronDown data-icon="inline-end" aria-hidden="true" />
      </summary>
      <div className="project-evidence-content">
        <div className="project-workflows">
          {evidence.workflows.map((workflow) => (
            <section key={workflow.title}>
              <h4>{workflow.title}</h4>
              <p>{workflow.description}</p>
            </section>
          ))}
        </div>
        <div className="project-evidence-captures">
          {evidence.captures.map((capture) => (
            <figure key={capture.src}>
              <picture>
                {capture.mobileSrc && <source media="(max-width: 767px)" srcSet={capture.mobileSrc} width={capture.mobileWidth} height={capture.mobileHeight} />}
                <img src={capture.src} alt={capture.alt} width={capture.width} height={capture.height} loading="lazy" decoding="async" />
              </picture>
              <figcaption>{capture.caption}</figcaption>
            </figure>
          ))}
        </div>
        <p className="project-evidence-provenance">Captured from the signed-in Apartment Manager workspace. Crops exclude residents, account details, invitation keys, and private financial records; no product data was changed.</p>
      </div>
    </details>
  );
}
