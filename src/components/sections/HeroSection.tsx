"use client";

import { sections } from "@/config/caseStudy";
import { TowerOverlaySystem } from "@/components/tower/TowerOverlaySystem";
import { useScrollStore } from "@/store/scrollStore";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function HeroSection() {
  const sectionId = useScrollStore((s) => s.sectionId);
  const coverReveal = useScrollStore((s) => s.coverReveal);
  const sceneMode = useScrollStore((s) => s.sceneMode);
  const approachProgress = useScrollStore((s) => s.estateBuildingProgress);

  // City title holds through the wide estate view, then fades slowly
  // once the Deansgate approach is well underway.
  let entryOpacity = 0;
  if (sectionId === "cover") {
    if (sceneMode === "approach") {
      if (approachProgress < 0.42) entryOpacity = 1;
      else entryOpacity = 1 - clamp01((approachProgress - 0.42) / 0.48);
    } else if (sceneMode === "reveal" || sceneMode === "cover") {
      entryOpacity = clamp01((coverReveal - 0.18) / 0.22);
    }
  }
  const showEntry = entryOpacity > 0.02;

  return (
    <section
      id="section-hero"
      className="story-section--estate relative"
      aria-labelledby="hero-heading"
    >
      <div
        className={`pointer-events-none fixed inset-0 z-[15] flex items-end pb-[12vh] md:items-center md:pb-0 transition-opacity duration-[1400ms] ease-out ${
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

      <TowerOverlaySystem />

      <div className="sticky top-0 min-h-[100svh]" aria-hidden />
    </section>
  );
}
