"use client";

import { StaffOperations } from "@/components/demos/StaffOperations";

export function StaffSection() {
  return (
    <section id="section-staff" className="story-section" aria-labelledby="staff-heading">
      <div className="container-editorial w-full">
        <div id="staff-heading" className="sr-only">
          Staff experience
        </div>
        <StaffOperations />
      </div>
    </section>
  );
}
