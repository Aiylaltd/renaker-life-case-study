"use client";

import { towerChapters } from "@/config/towerChapters";
import { TowerDevelopmentStack } from "@/components/tower/TowerDevelopmentStack";
import { useScrollStore } from "@/store/scrollStore";

export function TowerOverlaySystem() {
  const sectionId = useScrollStore((s) => s.sectionId);
  const sceneMode = useScrollStore((s) => s.sceneMode);
  const chapterIndex = useScrollStore((s) => s.towerChapterIndex);
  const featureStateIndex = useScrollStore((s) => s.towerFeatureStateIndex);
  const profileWanted = useScrollStore((s) => s.towerProfileVisible);
  const featureWanted = useScrollStore((s) => s.towerFeatureVisible);
  const quality = useScrollStore((s) => s.qualityProfile);
  const cameraSettled = useScrollStore((s) => s.towerCameraSettled);

  const chapter = towerChapters[chapterIndex] ?? towerChapters[0];
  const state =
    chapter.featureStates[
      Math.min(
        chapter.featureStates.length - 1,
        Math.max(0, featureStateIndex),
      )
    ] ?? chapter.featureStates[0];

  const inTour =
    sectionId === "hero" &&
    (sceneMode === "estate" || sceneMode === "estate-overview");
  const storyBridge = useScrollStore((s) => s.storyBridge);

  const mobile = quality === "mobile" || quality === "reduced";

  const profileVisible =
    inTour && storyBridge === "none" && profileWanted && cameraSettled;
  const featureVisible =
    inTour && storyBridge === "none" && featureWanted && cameraSettled;

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
