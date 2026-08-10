"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { sections, serviceRequestDemo } from "@/config/caseStudy";

export function ServiceRequestFlow() {
  return (
    <div className="w-full max-w-lg" aria-label="Service request workflow">
      <p className="text-label text-muted-dark mb-3">
        {sections.resident.serviceHeadline}
      </p>
      <GlassPanel variant="light" className="p-5 md:p-6">
        <p className="text-sm text-ink/80 italic">
          “{serviceRequestDemo.request}”
        </p>
        <ol className="mt-6 space-y-3">
          {serviceRequestDemo.steps.map((step, i) => (
            <li key={step} className="flex items-center gap-3 text-sm">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] text-stone">
                {i + 1}
              </span>
              <span>{step}</span>
              {i < serviceRequestDemo.steps.length - 1 && (
                <span className="ml-auto text-muted-dark" aria-hidden>
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </GlassPanel>
    </div>
  );
}
