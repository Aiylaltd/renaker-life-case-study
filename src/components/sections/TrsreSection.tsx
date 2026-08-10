"use client";

import { trsreCopy } from "@/config/trsre";
import { trsreProof } from "@/config/metrics";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useScrollStore } from "@/store/scrollStore";

export function TrsreSection() {
  const progress = useScrollStore((s) =>
    s.sectionId === "trsre" ? s.sectionProgress : 0,
  );

  return (
    <section
      id="section-trsre"
      className="story-section--pin"
      aria-labelledby="trsre-heading"
    >
      <div className="sticky top-0 flex min-h-[100svh] items-center py-12">
        <div className="container-wide w-full">
          {progress < 0.35 && (
            <div>
              <h2 id="trsre-heading" className="text-display editorial-type">
                {trsreCopy.headline}
              </h2>
              <p className="mt-4 max-w-lg text-subhead text-ink/70">
                {trsreCopy.supporting}
              </p>
            </div>
          )}

          {progress >= 0.35 && progress < 0.6 && (
            <div>
              <p className="text-metric">{trsreProof.steps}</p>
              <p className="mt-3 text-subhead text-ink/70">
                {trsreProof.stepsLabel}
              </p>
            </div>
          )}

          {progress >= 0.6 && (
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <blockquote className="text-display editorial-type max-w-3xl">
                “{trsreProof.quote}”
              </blockquote>
              <GlassPanel variant="light" className="overflow-hidden">
                <div
                  className="placeholder-surface aspect-[4/5] w-full"
                  role="img"
                  aria-label="TRSRE real-life footage placeholder"
                />
                <p className="p-4 text-xs text-muted-dark">
                  {trsreProof.quoteNote}
                </p>
              </GlassPanel>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
