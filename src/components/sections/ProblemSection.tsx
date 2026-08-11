"use client";

import { sections } from "@/config/caseStudy";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useScrollStore } from "@/store/scrollStore";

/** Spread layout (% of stage) so chips don’t pile into one clump */
const CHIP_LAYOUT = [
  { x: -42, y: -38, rot: -6 },
  { x: -8, y: -48, rot: 3 },
  { x: 36, y: -34, rot: 7 },
  { x: -48, y: -6, rot: -4 },
  { x: 4, y: -12, rot: 2 },
  { x: 46, y: 2, rot: 5 },
  { x: -36, y: 28, rot: -7 },
  { x: 10, y: 34, rot: 4 },
  { x: 40, y: 40, rot: -3 },
  { x: -12, y: 48, rot: 6 },
] as const;

export function ProblemSection() {
  const progress = useScrollStore((s) =>
    s.sectionId === "problem" ? s.sectionProgress : 0,
  );
  const inSection = useScrollStore((s) => s.sectionId === "problem");
  const consolidated = inSection && progress > 0.42;
  const channels = sections.problem.channels;

  return (
    <section
      id="section-problem"
      className="story-section--tall"
      aria-labelledby="problem-heading"
    >
      <div className="sticky top-0 flex min-h-[100svh] items-center py-16">
        <div className="container-editorial w-full">
          <div
            className={`transition-opacity duration-700 ${
              consolidated ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            <h2
              id="problem-heading"
              className="max-w-3xl whitespace-pre-line text-display editorial-type"
            >
              {sections.problem.headline}
            </h2>
            <p className="mt-6 max-w-xl text-body text-ink/70">
              {sections.problem.body}
            </p>
          </div>

          <div className="relative mx-auto mt-14 min-h-[320px] w-full max-w-2xl md:min-h-[380px]">
            {channels.map((channel, i) => {
              const o = CHIP_LAYOUT[i % CHIP_LAYOUT.length];
              return (
                <span
                  key={channel}
                  className="channel-chip absolute left-1/2 top-1/2 whitespace-nowrap transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    transform: consolidated
                      ? "translate(-50%, -50%) scale(0.35)"
                      : `translate(calc(-50% + ${o.x}%), calc(-50% + ${o.y}%)) rotate(${o.rot}deg)`,
                    opacity: consolidated ? 0 : 1,
                    transitionDelay: `${i * 35}ms`,
                    zIndex: channels.length - i,
                  }}
                >
                  {channel}
                </span>
              );
            })}

            <div
              className="absolute left-1/2 top-1/2 w-full max-w-md transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                opacity: consolidated ? 1 : 0,
                transform: consolidated
                  ? "translate(-50%, -50%) scale(1)"
                  : "translate(-50%, -42%) scale(0.96)",
                pointerEvents: consolidated ? "auto" : "none",
              }}
            >
              <GlassPanel variant="light" className="p-6 text-center md:p-8">
                <p className="text-label text-muted-dark">Renaker Life</p>
                <h3 className="mt-3 whitespace-pre-line text-headline">
                  {sections.problem.resolvedHeadline}
                </h3>
                <p className="mt-4 text-body text-ink/70">
                  {sections.problem.resolvedBody}
                </p>
              </GlassPanel>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
