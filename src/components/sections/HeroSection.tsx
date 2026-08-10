"use client";

import { sections } from "@/config/caseStudy";
import { developments } from "@/config/developments";
import { DevelopmentProfile } from "@/components/ui/DevelopmentProfile";
import { LiveStatusCard } from "@/components/ui/LiveStatusCard";
import { useScrollStore } from "@/store/scrollStore";

export function HeroSection() {
  const active = useScrollStore((s) => s.activeDevelopment);
  const sceneMode = useScrollStore((s) => s.sceneMode);
  const sectionId = useScrollStore((s) => s.sectionId);
  const progress = useScrollStore((s) =>
    s.sectionId === "hero" ? s.sectionProgress : s.sectionId === "cover" ? 0 : 1,
  );

  const showIntro = sectionId === "hero" && progress < 0.06;
  const showOverview =
    sceneMode === "estate-overview" ||
    (sectionId === "hero" && progress > 0.92);
  const activeDev = developments.find((d) => d.anchor === active);
  const showCards =
    sceneMode === "estate" &&
    !!activeDev &&
    progress > 0.06 &&
    progress < 0.92;

  return (
    <section
      id="section-hero"
      className="story-section--estate relative"
      aria-labelledby="hero-heading"
    >
      <div className="sticky top-0 flex min-h-[100svh] items-center">
        <div className="container-wide grid w-full gap-6 lg:grid-cols-[1fr_minmax(280px,360px)] lg:items-end">
          <div
            className={`transition-opacity duration-700 ${
              showIntro || showOverview
                ? "opacity-100"
                : "pointer-events-none opacity-0"
            }`}
          >
            {showIntro && (
              <>
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
              </>
            )}
            {showOverview && !showIntro && (
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
            {developments.map((dev) => {
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
