"use client";

import { metrics } from "@/config/metrics";
import { sections } from "@/config/caseStudy";
import { MetricMoment } from "@/components/ui/MetricMoment";
import { useScrollStore } from "@/store/scrollStore";

export function ResultsSection() {
  const progress = useScrollStore((s) =>
    s.sectionId === "results" ? s.sectionProgress : 0,
  );
  const idx = Math.min(metrics.length - 1, Math.floor(progress * metrics.length));

  return (
    <section
      id="section-results"
      className="story-section--pin"
      aria-labelledby="results-heading"
    >
      <div className="sticky top-0 flex min-h-[100svh] flex-col items-center justify-center">
        <h2 id="results-heading" className="sr-only">
          {sections.results.headline}
        </h2>
        <MetricMoment metric={metrics[idx]} />
      </div>
    </section>
  );
}
