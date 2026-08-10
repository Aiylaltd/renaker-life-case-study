"use client";

import { sections } from "@/config/caseStudy";
import { AIQuestionDemo } from "@/components/demos/AIQuestionDemo";
import { BusinessDashboard } from "@/components/demos/BusinessDashboard";
import { useScrollStore } from "@/store/scrollStore";

export function DhsEarlySection() {
  const progress = useScrollStore((s) =>
    s.sectionId === "dhs-early" ? s.sectionProgress : 0,
  );

  return (
    <section
      id="section-dhs-early"
      className="story-section--pin"
      aria-labelledby="dhs-early-heading"
    >
      <div className="sticky top-0 flex min-h-[100svh] items-center py-12">
        <div className="container-wide grid w-full gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            {progress < 0.2 && (
              <p className="text-headline editorial-type max-w-xl">
                {sections.dhsEarly.bridge}
              </p>
            )}
            {progress >= 0.2 && progress < 0.4 && (
              <>
                <h2 id="dhs-early-heading" className="text-display editorial-type">
                  {sections.dhsEarly.headline}
                </h2>
                <p className="mt-5 max-w-lg text-body text-ink/70">
                  {sections.dhsEarly.body}
                </p>
              </>
            )}
            {progress >= 0.4 && progress < 0.75 && (
              <AIQuestionDemo phase={progress} />
            )}
            {progress >= 0.75 && <BusinessDashboard />}
          </div>
          <div className="hidden lg:block" aria-hidden />
        </div>
      </div>
    </section>
  );
}
