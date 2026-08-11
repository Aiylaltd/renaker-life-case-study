"use client";

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
        <div id="management-heading" className="sr-only">
          Management insight
        </div>
        <ManagementInsight active={active} />
      </div>
    </section>
  );
}
