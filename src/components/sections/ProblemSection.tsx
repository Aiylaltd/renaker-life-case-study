"use client";

import { useEffect, useRef, useState } from "react";
import { sections } from "@/config/caseStudy";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useScrollStore } from "@/store/scrollStore";

export function ProblemSection() {
  const progress = useScrollStore((s) =>
    s.sectionId === "problem" ? s.sectionProgress : 0,
  );
  const consolidated = progress > 0.45;
  const [offsets] = useState(() =>
    sections.problem.channels.map((_, i) => ({
      x: ((i * 37) % 80) - 40,
      y: ((i * 53) % 60) - 30,
      rot: ((i * 17) % 16) - 8,
    })),
  );

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
              consolidated ? "opacity-0 absolute" : "opacity-100"
            }`}
          >
            <h2
              id="problem-heading"
              className="text-display editorial-type whitespace-pre-line max-w-3xl"
            >
              {sections.problem.headline}
            </h2>
            <p className="mt-6 max-w-xl text-body text-ink/70">
              {sections.problem.body}
            </p>
          </div>

          <div className="relative mt-12 min-h-[280px] md:min-h-[340px]">
            {sections.problem.channels.map((channel, i) => {
              const o = offsets[i];
              return (
                <span
                  key={channel}
                  className="channel-chip absolute left-1/2 top-1/2 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    transform: consolidated
                      ? "translate(-50%, -50%) scale(0.4)"
                      : `translate(calc(-50% + ${o.x}px), calc(-50% + ${o.y}px)) rotate(${o.rot}deg)`,
                    opacity: consolidated ? 0 : 1,
                    transitionDelay: `${i * 40}ms`,
                  }}
                >
                  {channel}
                </span>
              );
            })}

            <div
              className={`absolute left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ${
                consolidated
                  ? "opacity-100 translate-y-[-50%]"
                  : "opacity-0 translate-y-[-40%]"
              }`}
            >
              <GlassPanel variant="light" className="p-6 md:p-8 text-center">
                <p className="text-label text-muted-dark">Renaker Life</p>
                <h3 className="mt-3 text-headline whitespace-pre-line">
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
