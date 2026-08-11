"use client";

import { PrologueExperience } from "@/components/prologue/PrologueExperience";
import { CoverVeil } from "@/components/cover/CoverVeil";
import { DemoScrollCue } from "@/components/cover/DemoScrollCue";
import { DebugOverlay } from "@/components/debug/DebugOverlay";
import { CoverSection } from "@/components/sections/CoverSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { DhsEarlySection } from "@/components/sections/DhsEarlySection";
import { ResidentSection } from "@/components/sections/ResidentSection";
import { StaffSection } from "@/components/sections/StaffSection";
import { ManagementSection } from "@/components/sections/ManagementSection";
import { ResultsSection } from "@/components/sections/ResultsSection";
import { DoorlySection } from "@/components/sections/DoorlySection";
import { DhsDeepSection } from "@/components/sections/DhsDeepSection";
import { TrsreSection } from "@/components/sections/TrsreSection";
import { PlacemakingSection } from "@/components/sections/PlacemakingSection";
import { VideosSection } from "@/components/sections/VideosSection";
import { FinaleSection } from "@/components/sections/FinaleSection";
import { useScrollStory } from "@/hooks/useScrollStory";
import { useScrollStore } from "@/store/scrollStore";
import { brand } from "@/config/caseStudy";
import { RenakerLifeLogo } from "@/components/ui/RenakerLifeLogo";
import { SceneCanvas } from "@/scene/SceneCanvas";

export function CaseStudyPage() {
  const experienceStarted = useScrollStore((s) => s.experienceStarted);
  // Gate the existing V1 story until the prologue hands off.
  useScrollStory(experienceStarted);

  return (
    <>
      <a href="#story" className="skip-link">
        Skip to content
      </a>

      <SceneCanvas />

      <PrologueExperience />
      <CoverVeil />
      <DemoScrollCue />
      <DebugOverlay />

      <main
        id="story"
        className="story-layer"
        aria-hidden={!experienceStarted}
        {...(!experienceStarted ? { inert: true } : {})}
      >
        <header className="pointer-events-none fixed left-0 right-0 top-0 z-20 px-5 py-5 md:px-8">
          <div className="container-wide flex items-center justify-between gap-6">
            <div className="w-[min(42vw,11.5rem)] mix-blend-difference">
              <RenakerLifeLogo variant="light" />
            </div>
            <p className="text-xs text-ink/45 mix-blend-difference">
              Case study · powered by {brand.poweredBy}
            </p>
          </div>
        </header>

        {/* Existing V1 order — unchanged */}
        <CoverSection />
        <HeroSection />
        <ProblemSection />
        <ResidentSection />
        <StaffSection />
        <ManagementSection />
        <ResultsSection />
        <DhsEarlySection />
        <DhsDeepSection />
        <DoorlySection />
        <TrsreSection />
        <PlacemakingSection />
        <VideosSection />
        <FinaleSection />

        <footer className="relative z-10 border-t border-ink/8 bg-warm/80 py-10 backdrop-blur-sm">
          <div className="container-editorial flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-ink/60">
              {brand.product} — a Renaker case study powered by {brand.poweredBy}
            </p>
            <p className="text-sm text-ink/45">{brand.positioning}</p>
          </div>
        </footer>
      </main>
    </>
  );
}
