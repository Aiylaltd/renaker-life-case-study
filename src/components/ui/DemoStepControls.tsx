"use client";

import { useIsTabletUi } from "@/hooks/useIsMobileUi";
import { useScrollStore } from "@/store/scrollStore";

/**
 * Expo iPad controls — bottom-right Back / Next for stepped beats.
 * Hidden on phones (swipe) and desktop (wheel).
 */
export function DemoStepControls() {
  const tablet = useIsTabletUi();
  const requestDemoStep = useScrollStore((s) => s.requestDemoStep);
  const experienceStarted = useScrollStore((s) => s.experienceStarted);
  const loaderDone = useScrollStore((s) => s.loaderDone);
  const sectionId = useScrollStore((s) => s.sectionId);
  const towerTourStepped = useScrollStore((s) => s.towerTourStepped);
  const storyBridge = useScrollStore((s) => s.storyBridge);
  const demoIntroLock = useScrollStore((s) => s.demoIntroLock);
  const prologueAwaitingStart = useScrollStore((s) => s.prologueAwaitingStart);

  const inPrologue = !experienceStarted && loaderDone;
  const inCoverHold =
    experienceStarted && !demoIntroLock && sectionId === "cover";
  const inSteppedTour =
    experienceStarted &&
    !demoIntroLock &&
    (towerTourStepped ||
      storyBridge === "beyond" ||
      sectionId === "dhs-early" ||
      sectionId === "trsre" ||
      sectionId === "videos");

  const visible = tablet && (inPrologue || inCoverHold || inSteppedTour);

  if (!visible) return null;

  // Start CTA slide — Back only; Next would compete with "Start the experience"
  const showNext = !prologueAwaitingStart;

  return (
    <div className="demo-step-controls" role="group" aria-label="Demo navigation">
      <button
        type="button"
        className="demo-step-controls__btn"
        onClick={() => requestDemoStep(-1)}
        aria-label="Previous"
      >
        <span aria-hidden>←</span>
        Back
      </button>
      {showNext ? (
        <button
          type="button"
          className="demo-step-controls__btn demo-step-controls__btn--next"
          onClick={() => requestDemoStep(1)}
          aria-label="Next"
        >
          Next
          <span aria-hidden>→</span>
        </button>
      ) : null}
    </div>
  );
}
