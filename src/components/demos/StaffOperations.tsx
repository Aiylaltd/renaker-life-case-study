"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { sections, staffFlowDemo } from "@/config/caseStudy";

export function StaffOperations() {
  return (
    <div className="w-full max-w-lg" aria-label="Staff operations flow">
      <h2 className="text-headline editorial-type whitespace-pre-line">
        {sections.staff.headline}
      </h2>
      <p className="mt-3 text-body text-ink/70">{sections.staff.supporting}</p>
      <GlassPanel variant="light" className="mt-8 p-5 md:p-6">
        <p className="text-label text-muted-dark mb-4">Building team</p>
        <ul className="space-y-4">
          {staffFlowDemo.steps.map((step, i) => (
            <li
              key={step.label}
              className="flex gap-4 border-b border-ink/8 pb-4 last:border-0 last:pb-0"
            >
              <span className="text-label text-muted-dark w-6">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="font-medium">{step.label}</p>
                <p className="mt-1 text-sm text-muted-dark">{step.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </GlassPanel>
    </div>
  );
}
