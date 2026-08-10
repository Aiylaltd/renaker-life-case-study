"use client";

import { sections } from "@/config/caseStudy";
import { ResidentAIChat } from "@/components/demos/ResidentAIChat";
import { ResidentMarketplace } from "@/components/demos/ResidentMarketplace";
import { ServiceRequestFlow } from "@/components/demos/ServiceRequestFlow";
import { useScrollStore } from "@/store/scrollStore";

export function ResidentSection() {
  const active = useScrollStore((s) => s.sectionId === "resident");
  const progress = useScrollStore((s) =>
    s.sectionId === "resident" ? s.sectionProgress : 0,
  );

  return (
    <section
      id="section-resident"
      className="story-section--pin"
      aria-labelledby="resident-heading"
    >
      <div className="sticky top-0 flex min-h-[100svh] items-center py-12">
        <div className="container-wide w-full">
          {progress < 0.15 && (
            <div>
              <p className="text-label text-muted-dark">{sections.resident.bridge}</p>
              <h2 id="resident-heading" className="mt-4 text-display editorial-type max-w-3xl">
                {sections.resident.headline}
              </h2>
            </div>
          )}
          {progress >= 0.15 && progress < 0.45 && (
            <ResidentAIChat active={active && progress >= 0.15} />
          )}
          {progress >= 0.45 && progress < 0.72 && <ResidentMarketplace />}
          {progress >= 0.72 && <ServiceRequestFlow />}
        </div>
      </div>
    </section>
  );
}
