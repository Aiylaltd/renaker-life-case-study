"use client";

import { towerChapters } from "@/config/towerChapters";
import { TowerDevelopmentStack } from "@/components/tower/TowerDevelopmentStack";
import { useScrollStore } from "@/store/scrollStore";
import { useIsTabletUi } from "@/hooks/useIsMobileUi";

export function TowerOverlaySystem() {
  const sectionId = useScrollStore((s) => s.sectionId);
  const sceneMode = useScrollStore((s) => s.sceneMode);
  const chapterIndex = useScrollStore((s) => s.towerChapterIndex);
  const featureStateIndex = useScrollStore((s) => s.towerFeatureStateIndex);
  const profileWanted = useScrollStore((s) => s.towerProfileVisible);
  const featureWanted = useScrollStore((s) => s.towerFeatureVisible);
  const quality = useScrollStore((s) => s.qualityProfile);
  const cameraSettled = useScrollStore((s) => s.towerCameraSettled);
  const towerTourStepped = useScrollStore((s) => s.towerTourStepped);
  const tabletUi = useIsTabletUi();

  const chapter = towerChapters[chapterIndex] ?? towerChapters[0];
  const state =
    chapter.featureStates[
      Math.min(
        chapter.featureStates.length - 1,
        Math.max(0, featureStateIndex),
      )
    ] ?? chapter.featureStates[0];

  const estateMode =
    sceneMode === "estate" || sceneMode === "estate-overview";
  // iPad demo: tour can be armed while ST still reports cover for a beat.
  const inTour =
    estateMode &&
    (sectionId === "hero" || (tabletUi && towerTourStepped));
  const storyBridge = useScrollStore((s) => s.storyBridge);

  const mobile = quality === "mobile" || quality === "reduced";
  // iPad: don't wait on desktop settle — cards unlock with the beat.
  const settleOk = cameraSettled || tabletUi;

  const profileVisible =
    inTour && storyBridge === "none" && profileWanted && settleOk;
  const featureVisible =
    inTour && storyBridge === "none" && featureWanted && settleOk;

  if (!inTour || storyBridge === "beyond" || !state) return null;

  return (
    <div
      className={`tower-overlay ${mobile ? "tower-overlay--mobile" : ""} ${
        quality !== "desktop" ? "tower-overlay--lite" : ""
      }`}
      aria-live="polite"
    >
      <TowerDevelopmentStack
        chapter={chapter}
        state={state}
        profileVisible={profileVisible}
        featureVisible={featureVisible}
        side={chapter.profileSide}
      />
    </div>
  );
}
