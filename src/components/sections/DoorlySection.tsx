"use client";

import { doorlyCategories, doorlyCopy } from "@/config/doorly";
import { georgeProof } from "@/config/metrics";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useScrollStore } from "@/store/scrollStore";

export function DoorlySection() {
  const progress = useScrollStore((s) =>
    s.sectionId === "doorly" ? s.sectionProgress : 0,
  );

  return (
    <section
      id="section-doorly"
      className="story-section--tall"
      aria-labelledby="doorly-heading"
    >
      <div className="sticky top-0 flex min-h-[100svh] items-center py-12">
        <div className="container-wide grid w-full gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2
              id="doorly-heading"
              className="text-display editorial-type whitespace-pre-line"
            >
              {doorlyCopy.headline}
            </h2>
            <p className="mt-5 max-w-lg text-body text-ink/70">
              {doorlyCopy.supporting}
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {doorlyCategories.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-ink/10 bg-white/50 px-3 py-1.5 text-sm text-ink/75"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {progress > 0.35 && (
            <GlassPanel variant="light" className="overflow-hidden">
              <div
                className="placeholder-surface aspect-[4/3] w-full"
                role="img"
                aria-label="George video or photography placeholder"
              />
              <div className="p-6">
                <p className="text-label text-muted-dark">{georgeProof.name}</p>
                <p className="mt-2 text-metric leading-none" style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}>
                  {georgeProof.value}
                </p>
                <p className="mt-1 text-subhead text-ink/70">{georgeProof.period}</p>
                <p className="mt-4 text-body text-ink/75">{georgeProof.line}</p>
                <p className="mt-5 text-sm text-muted-dark">
                  {georgeProof.supporting.join(" ")}
                </p>
              </div>
            </GlassPanel>
          )}
        </div>
      </div>
    </section>
  );
}
