"use client";

import { sections } from "@/config/caseStudy";
import { ManagementInsight } from "@/components/demos/ManagementInsight";
import { useScrollStore } from "@/store/scrollStore";

export function ManagementSection() {
  const active = useScrollStore((s) => s.sectionId === "management");

  return (
    <section
      id="section-management"
      className="story-section"
      aria-labelledby="management-heading"
    >
      <div className="container-editorial w-full">
        <p className="text-label text-muted-dark">{sections.management.bridge}</p>
        <h2
          id="management-heading"
          className="mt-4 max-w-3xl text-display editorial-type"
        >
          {sections.management.headline}
        </h2>
        <div className="mt-10">
          <ManagementInsight active={active} />
        </div>
      </div>
    </section>
  );
}
