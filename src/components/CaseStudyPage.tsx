"use client";

import { PrologueExperience } from "@/components/prologue/PrologueExperience";
import { CoverVeil } from "@/components/cover/CoverVeil";
import { DemoScrollCue } from "@/components/cover/DemoScrollCue";
import { DebugOverlay } from "@/components/debug/DebugOverlay";
import { CoverSection } from "@/components/sections/CoverSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { BeyondBridgeOverlay } from "@/components/sections/BeyondBridgeOverlay";
import { DhsEarlySection } from "@/components/sections/DhsEarlySection";
import { TrsreSection } from "@/components/sections/TrsreSection";
import { VideosSection } from "@/components/sections/VideosSection";
import { FinaleSection } from "@/components/sections/FinaleSection";
import { useScrollStory } from "@/hooks/useScrollStory";
import { useTowerTourSteps } from "@/hooks/useTowerTourSteps";
import { useScrollStore } from "@/store/scrollStore";
import { brand } from "@/config/caseStudy";
import { RenakerLifeLogo } from "@/components/ui/RenakerLifeLogo";
import { TowerCaseNav } from "@/components/tower/TowerCaseNav";
import { SceneCanvas } from "@/scene/SceneCanvas";

export function CaseStudyPage() {
  const experienceStarted = useScrollStore((s) => s.experienceStarted);
  const sectionId = useScrollStore((s) => s.sectionId);
  const chapterIndex = useScrollStore((s) => s.towerChapterIndex);
  useScrollStory(experienceStarted);
  useTowerTourSteps(experienceStarted);

  // Keep nav through Videos + finale (Contact highlight)
  const showCaseNav = experienceStarted && sectionId !== "loader";

  return (
    <>
      <a href="#story" className="skip-link">
        Skip to content
      </a>

      <SceneCanvas />

      <PrologueExperience />
      <CoverVeil />
      <DemoScrollCue />
      <BeyondBridgeOverlay />
      <DebugOverlay />

      <main
        id="story"
        className="story-layer"
        aria-hidden={!experienceStarted}
        {...(!experienceStarted ? { inert: true } : {})}
      >
        <header className="pointer-events-none fixed left-0 right-0 top-0 z-20 px-5 py-5 md:px-8">
          <div className="container-wide flex items-center justify-between gap-6">
            <div className="flex min-w-0 flex-1 items-center gap-6 md:gap-10">
              <div className="w-[min(42vw,11.5rem)] shrink-0 mix-blend-difference">
                <RenakerLifeLogo variant="light" />
              </div>
              <TowerCaseNav
                activeIndex={sectionId === "hero" ? chapterIndex : -1}
                visible={showCaseNav}
              />
            </div>
            {!showCaseNav ? (
              <p className="hidden text-xs text-ink/45 mix-blend-difference sm:block">
                Case study · powered by {brand.poweredBy}
              </p>
            ) : null}
          </div>
        </header>

        <CoverSection />
        <HeroSection />
        <DhsEarlySection />
        <TrsreSection />
        <VideosSection />
        <FinaleSection />
      </main>
    </>
  );
}
