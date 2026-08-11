"use client";

import { sections } from "@/config/caseStudy";
import { estateTourDevelopments } from "@/config/developments";
import { DevelopmentProfile } from "@/components/ui/DevelopmentProfile";
import { LiveStatusCard } from "@/components/ui/LiveStatusCard";
import { useScrollStore } from "@/store/scrollStore";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function HeroSection() {
  const active = useScrollStore((s) => s.activeDevelopment);
  const sceneMode = useScrollStore((s) => s.sceneMode);
  const sectionId = useScrollStore((s) => s.sectionId);
  const coverReveal = useScrollStore((s) => s.coverReveal);
  const heroProgress = useScrollStore((s) =>
    s.sectionId === "hero" ? s.sectionProgress : 0,
  );

  const tourStops = estateTourDevelopments.length + 1;
  const overviewThreshold = (tourStops - 1.15) / (tourStops - 1);

  // Entry headline only on the cover runway — clears before the first tower card.
  const entryOpacity =
    sectionId === "cover" ? clamp01((coverReveal - 0.22) / 0.28) : 0;
  const showEntry = entryOpacity > 0.02;

  const showOverview =
    sceneMode === "estate-overview" ||
    (sectionId === "hero" && heroProgress > overviewThreshold);
  const activeDev = estateTourDevelopments.find((d) => d.anchor === active);
  // First snap sits at heroProgress 0 — don't gate cards on a mid-section threshold.
  const showCards =
    (sceneMode === "estate" || sceneMode === "approach") &&
    !!activeDev &&
    sectionId === "hero" &&
    !showOverview;

  return (
    <section
      id="section-hero"
      className="story-section--estate relative"
      aria-labelledby="hero-heading"
    >
      <div
        className={`pointer-events-none fixed inset-0 z-[15] flex items-end pb-[12vh] md:items-center md:pb-0 transition-opacity duration-500 ${
          showEntry ? "" : "invisible"
        }`}
        style={{ opacity: entryOpacity }}
        aria-hidden={!showEntry}
      >
        <div className="container-wide w-full">
          <p className="text-label text-muted-dark">Renaker Life</p>
          <h1
            id="hero-heading"
            className="mt-4 max-w-3xl whitespace-pre-line text-display editorial-type"
          >
            {sections.hero.headline}
          </h1>
          <p className="mt-5 max-w-xl text-subhead text-ink/70">
            {sections.hero.supporting}
          </p>
        </div>
      </div>

      <div className="sticky top-0 flex min-h-[100svh] items-center">
        <div className="container-wide grid w-full gap-6 lg:grid-cols-[1fr_minmax(280px,360px)] lg:items-end">
          <div
            className={`transition-opacity duration-700 ${
              showOverview && !showEntry
                ? "opacity-100"
                : "pointer-events-none opacity-0"
            }`}
          >
            {showOverview && !showEntry && (
              <h2 className="max-w-3xl text-display editorial-type">
                {sections.hero.overviewLine}
              </h2>
            )}
          </div>

          <div
            className={`flex w-full flex-col gap-3 justify-self-end transition-opacity duration-500 ${
              showCards ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {estateTourDevelopments.map((dev) => {
              const on = active === dev.anchor && showCards;
              return (
                <div
                  key={dev.id}
                  className={on ? "flex flex-col gap-3" : "hidden"}
                >
                  <DevelopmentProfile
                    development={dev}
                    visible={on}
                    side={dev.camera.overlaySide}
                  />
                  <LiveStatusCard development={dev} visible={on} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
