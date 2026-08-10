"use client";

import { LoaderExperience } from "@/components/loader/LoaderExperience";
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
import { SceneCanvas } from "@/scene/SceneCanvas";

export function CaseStudyPage() {
  const loaderDone = useScrollStore((s) => s.loaderDone);
  useScrollStory(loaderDone);

  return (
    <>
      <a href="#story" className="skip-link">
        Skip to content
      </a>

      <SceneCanvas />

      <LoaderExperience />
      <DebugOverlay />

      <main id="story" className="story-layer">
        <header className="pointer-events-none fixed left-0 right-0 top-0 z-20 px-5 py-5 md:px-8">
          <div className="container-wide flex items-center justify-between">
            <p className="text-label tracking-[0.16em] text-ink/70 mix-blend-difference">
              {brand.product}
            </p>
            <p className="text-xs text-ink/45 mix-blend-difference">
              Case study · powered by {brand.poweredBy}
            </p>
          </div>
        </header>

        {/* Locked V2 order */}
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
