"use client";

import { sections } from "@/config/caseStudy";
import { StaffOperations } from "@/components/demos/StaffOperations";

export function StaffSection() {
  return (
    <section
      id="section-staff"
      className="story-section"
      aria-labelledby="staff-heading"
    >
      <div className="container-editorial w-full">
        <p className="text-label text-muted-dark">{sections.staff.bridge}</p>
        <h2
          id="staff-heading"
          className="mt-4 max-w-3xl text-display editorial-type"
        >
          {sections.staff.headline}
        </h2>
        <p className="mt-4 max-w-xl text-subhead text-ink/65">
          {sections.staff.supporting}
        </p>
        <div className="mt-10">
          <StaffOperations />
        </div>
      </div>
    </section>
  );
}
