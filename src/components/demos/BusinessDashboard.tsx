"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { businessDashboardDemo } from "@/config/businesses";
import { sections } from "@/config/caseStudy";

export function BusinessDashboard() {
  return (
    <div className="w-full max-w-xl" aria-label="Business dashboard demonstration">
      <h3 className="text-headline editorial-type">
        {sections.dhsEarly.businessHeadline}
      </h3>
      <p className="mt-3 text-body text-ink/70">{sections.dhsEarly.businessBody}</p>
      <GlassPanel variant="light" className="mt-6 p-5 md:p-6">
        <p className="text-label text-muted-dark mb-4">Business insights</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {businessDashboardDemo.metrics.map((m) => (
            <div key={m.label}>
              <p className="text-2xl font-medium tracking-tight">{m.value}</p>
              <p className="mt-1 text-xs text-muted-dark">{m.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs text-muted-dark">
          {businessDashboardDemo.disclaimer}
        </p>
      </GlassPanel>
    </div>
  );
}
