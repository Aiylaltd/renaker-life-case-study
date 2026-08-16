"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { estateTourDevelopments } from "@/config/developments";
import {
  resolveChapterTiming,
  towerChapters,
} from "@/config/towerChapters";
import { useScrollStore } from "@/store/scrollStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { AnchorName } from "@/config/scene";

gsap.registerPlugin(ScrollTrigger);

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/**
 * Camera settle progress for a chapter-local 0–1.
 * Never pulls wider after approach — that was causing the DGS “bungee”.
 */
function buildingProgressFromLocal(
  localT: number,
  calm: boolean,
  opts?: { firstChapter?: boolean },
) {
  const settled = 0.62;

  // DGS: cover already flew us in — hold the settled frame through arrival/read
  if (opts?.firstChapter) {
    if (localT < 0.9 || calm) {
      return settled + Math.sin(localT * Math.PI * 2) * 0.004;
    }
    return settled + ((localT - 0.9) / 0.1) * 0.06;
  }

  // Later towers: gentle push-in only (no wide pull-back)
  if (localT < 0.18) {
    return 0.56 + (localT / 0.18) * (settled - 0.56);
  }
  if (localT < 0.9 || calm) {
    return settled + Math.sin(localT * Math.PI * 2) * 0.004;
  }
  return settled + ((localT - 0.9) / 0.1) * 0.08;
}

export function useScrollStory(enabled: boolean) {
  const reduced = useReducedMotion();
  const setSection = useScrollStore((s) => s.setSection);
  const setSceneMode = useScrollStore((s) => s.setSceneMode);
  const setAttentionMode = useScrollStore((s) => s.setAttentionMode);
  const setCoverReveal = useScrollStore((s) => s.setCoverReveal);
  const setActiveDevelopment = useScrollStore((s) => s.setActiveDevelopment);
  const setEstateBuildingProgress = useScrollStore(
    (s) => s.setEstateBuildingProgress,
  );
  const setTowerJourney = useScrollStore((s) => s.setTowerJourney);
  const setDhsIntensity = useScrollStore((s) => s.setDhsIntensity);
  const setTrsreIntensity = useScrollStore((s) => s.setTrsreIntensity);
  const setDoorlyIntensity = useScrollStore((s) => s.setDoorlyIntensity);
  const setHaze = useScrollStore((s) => s.setHaze);
  const setOrbReveal = useScrollStore((s) => s.setOrbReveal);
  const setCityAwake = useScrollStore((s) => s.setCityAwake);
  const setProgress = useScrollStore((s) => s.setProgress);

  useEffect(() => {
    if (!enabled) return;

    const triggers: ScrollTrigger[] = [];
    const firstTower = estateTourDevelopments[0]?.anchor as AnchorName | undefined;

    const watch = (
      id: string,
      section: Parameters<typeof setSection>[0],
      onUpdate?: (p: number) => void,
      opts?: {
        editorial?: boolean;
        enterProgress?: number;
        enterBackProgress?: number;
        start?: string;
        end?: string;
      },
    ) => {
      const el = document.getElementById(id);
      if (!el) return;
      const st = ScrollTrigger.create({
        trigger: el,
        start: opts?.start ?? "top center",
        end: opts?.end ?? "bottom center",
        onEnter: () => {
          setSection(section, opts?.enterProgress ?? 0);
          if (opts?.editorial) setAttentionMode("editorial");
        },
        onEnterBack: () => {
          setSection(section, opts?.enterBackProgress ?? 0);
          if (opts?.editorial) setAttentionMode("editorial");
        },
        onUpdate: (self) => {
          setSection(section, self.progress);
          onUpdate?.(self.progress);
        },
      });
      triggers.push(st);
    };

    triggers.push(
      ScrollTrigger.create({
        trigger: "#story",
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => setProgress(self.progress),
      }),
    );

    // Dark → light reveal (needs real height — see .story-section--cover)
    const cover = document.getElementById("section-cover");
    if (cover) {
      triggers.push(
        ScrollTrigger.create({
          trigger: cover,
          start: "top top",
          end: "bottom top",
          onEnter: () => {
            setAttentionMode("cinematic");
            setSection("cover", 0);
            setActiveDevelopment(null);
          },
          onEnterBack: () => {
            setAttentionMode("cinematic");
            setSection("cover", 1);
            setActiveDevelopment(null);
            setEstateBuildingProgress(0);
          },
          onUpdate: (self) => {
            // Start handoff owns coverReveal / camera while the veil wakes in
            if (useScrollStore.getState().demoIntroLock) return;

            const p = self.progress;
            const reveal = clamp01(p * 1.15);
            setSection("cover", p);
            setCoverReveal(reveal);
            setCityAwake(p * 0.55);

            // Late cover: ease toward first tower instead of hard-cutting on hero enter
            if (p < 0.08) {
              setSceneMode("cover");
              setActiveDevelopment(null);
              setEstateBuildingProgress(0);
              setTowerJourney({
                towerProfileVisible: false,
                towerFeatureVisible: false,
              });
            } else if (p < 0.76) {
              // Wide city + estate title hold (Start lands ~0.52 here)
              setSceneMode("reveal");
              setActiveDevelopment(null);
              setEstateBuildingProgress(0);
              setTowerJourney({
                towerProfileVisible: false,
                towerFeatureVisible: false,
                towerCameraSettled: false,
              });
            } else {
              // Approach DGS — 0→1 fly-in after a longer title hold
              setSceneMode("approach");
              if (firstTower) setActiveDevelopment(firstTower);
              const approachT = clamp01((p - 0.76) / 0.24);
              setEstateBuildingProgress(approachT);
              setCityAwake(0.6);
              setTowerJourney({
                towerProfileVisible: false,
                towerFeatureVisible: false,
                towerCameraCalm: false,
                towerCameraSettled: false,
                towerBeatIndex: 0,
              });
            }
          },
          onLeave: () => {
            setCoverReveal(1);
            setCityAwake(0.6);
            // Hand off already aimed at DGS — keep active so estate never falls through
            if (firstTower) {
              setSceneMode("estate");
              setActiveDevelopment(firstTower);
              setEstateBuildingProgress(0.62);
            }
            setTowerJourney({
              towerChapterIndex: 0,
              towerLocalProgress: 0,
              towerProfileVisible: false,
              towerFeatureVisible: false,
              towerCameraCalm: false,
              towerCameraSettled: false,
              towerFeatureStateIndex: 0,
            });
          },
          onLeaveBack: () => {
            setCoverReveal(0);
            setCityAwake(0);
            setSceneMode("cover");
            setActiveDevelopment(null);
            setEstateBuildingProgress(0);
          },
        }),
      );
    }

    // Estate tour — chapter-local scroll drives cards; soft snap only at chapter edges
    const hero = document.getElementById("section-hero");
    const chapters = towerChapters;
    const chapterCount = chapters.length;
    if (hero) {
      triggers.push(
        ScrollTrigger.create({
          trigger: hero,
          start: "top top",
          end: "bottom bottom",
          // Stepped wheel charge owns pacing — no GSAP snap fighting it
          onEnter: () => {
            setAttentionMode("cinematic");
            setCoverReveal(1);
            if (reduced) {
              setSceneMode("quiet");
              return;
            }
            const tower =
              firstTower ??
              (estateTourDevelopments[0]?.anchor as AnchorName | undefined);
            setSceneMode("estate");
            if (tower) {
              setActiveDevelopment(tower);
              setEstateBuildingProgress(0.62);
            }
            setTowerJourney({
              towerChapterIndex: 0,
              towerLocalProgress: 0,
              towerProfileVisible: false,
              towerFeatureVisible: false,
              towerCameraCalm: false,
              towerCameraSettled: false,
              towerFeatureStateIndex: 0,
              towerBeatIndex: 0,
            });
            setCityAwake(0.6);
          },
          onEnterBack: () => {
            setAttentionMode("cinematic");
            setCoverReveal(1);
            if (reduced) {
              setSceneMode("quiet");
              return;
            }
            setSceneMode("estate");
            const tower =
              firstTower ??
              (estateTourDevelopments[0]?.anchor as AnchorName | undefined);
            if (tower) {
              setActiveDevelopment(tower);
              setEstateBuildingProgress(0.62);
            }
            setCityAwake(0.6);
          },
          onLeaveBack: () => {
            setAttentionMode("cinematic");
            if (firstTower) {
              setSceneMode("approach");
              setActiveDevelopment(firstTower);
              // Near end of approach blend when returning from hero into cover
              setEstateBuildingProgress(0.85);
            }
            setTowerJourney({
              towerProfileVisible: false,
              towerFeatureVisible: false,
              towerCameraCalm: false,
            });
          },
          onUpdate: (self) => {
            const p = self.progress;
            setSection("hero", p);
            setCoverReveal(1);

            if (reduced) {
              setActiveDevelopment(null);
              setSceneMode("quiet");
              setTowerJourney({
                towerProfileVisible: false,
                towerFeatureVisible: false,
                towerCameraCalm: false,
              });
              return;
            }

            // Stepped tour owns chapter/card/camera state — don't fight it
            if (useScrollStore.getState().towerTourStepped) {
              return;
            }

            const chapterFloat = p * chapterCount;
            const chapterIndex = Math.min(
              chapterCount - 1,
              Math.floor(chapterFloat),
            );
            const localT = clamp01(chapterFloat - chapterIndex);
            const chapter = chapters[chapterIndex];
            const firstChapter = chapterIndex === 0;
            const timing = resolveChapterTiming(localT, {
              estateWide: !chapter.anchor,
              firstChapter,
            });
            const statesLen = Math.max(1, chapter.featureStates.length);
            const featureStateIndex = Math.min(
              statesLen - 1,
              Math.floor(
                (typeof timing.featureStateIndex === "number"
                  ? timing.featureStateIndex
                  : 0) * statesLen,
              ),
            );

            setTowerJourney({
              towerChapterIndex: chapterIndex,
              towerLocalProgress: localT,
              towerProfileVisible: timing.profileVisible,
              towerFeatureVisible: timing.featureVisible,
              towerCameraCalm: timing.cameraCalm,
              towerFeatureStateIndex: featureStateIndex,
            });

            if (!chapter.anchor) {
              setSceneMode("estate-overview");
              setActiveDevelopment(null);
              setEstateBuildingProgress(0);
              setCityAwake(timing.cameraCalm ? 0.92 : 0.82);
              setAttentionMode(
                timing.cameraCalm ? "editorial" : "cinematic",
              );
              return;
            }

            setSceneMode("estate");
            setActiveDevelopment(chapter.anchor);
            setEstateBuildingProgress(
              buildingProgressFromLocal(localT, timing.cameraCalm, {
                firstChapter,
              }),
            );
            setCityAwake(0.6);
            setAttentionMode(
              timing.cameraCalm ? "editorial" : "cinematic",
            );
          },
          onLeave: () => {
            const store = useScrollStore.getState();
            // Beyond hold sits at the end of the hero — don't collapse the estate frame
            if (store.storyBridge === "beyond" || store.towerTourStepped) {
              return;
            }
            setSceneMode("quiet");
            setActiveDevelopment(null);
            setAttentionMode("editorial");
            setTowerJourney({
              towerProfileVisible: false,
              towerFeatureVisible: false,
              towerCameraCalm: false,
            });
          },
        }),
      );
    }

    // DHS — don't steal while the tower tour / Beyond bridge still owns the story
    const dhsEl = document.getElementById("section-dhs-early");
    if (dhsEl) {
      triggers.push(
        ScrollTrigger.create({
          trigger: dhsEl,
          start: "top center",
          end: "bottom center",
          onEnter: () => {
            const store = useScrollStore.getState();
            if (store.storyBridge === "beyond" || store.towerTourStepped) return;
            setSection("dhs-early", 0);
            setAttentionMode("editorial");
          },
          onEnterBack: () => {
            const store = useScrollStore.getState();
            if (store.storyBridge === "beyond" || store.towerTourStepped) return;
            setSection("dhs-early", 0);
            setAttentionMode("editorial");
          },
          onUpdate: (self) => {
            const store = useScrollStore.getState();
            if (store.storyBridge === "beyond" || store.towerTourStepped) return;
            setSection("dhs-early", self.progress);
            setSceneMode("dhs");
            // City approach after Beyond — cinematic first, then settle to read
            setAttentionMode(
              self.progress < 0.12 ? "cinematic" : "editorial",
            );
            setDhsIntensity(
              Math.min(1, Math.max(0.25, 0.3 + self.progress * 0.85)),
            );
            store.setStoryBridge("none");
            setActiveDevelopment(null);
            setCityAwake(0.75);
            setDoorlyIntensity(0);
            setTrsreIntensity(0);
          },
        }),
      );
    }

    watch("section-trsre", "trsre", (p) => {
      setSceneMode("trsre");
      setAttentionMode("editorial");
      setTrsreIntensity(Math.min(1, 0.15 + p * 0.75));
      setDhsIntensity(Math.max(0, 0.35 - p * 0.45));
      setDoorlyIntensity(0);
    }, { start: "top center", end: "bottom top" });

    watch(
      "section-videos",
      "videos",
      () => {
        setSceneMode("quiet");
        setAttentionMode("editorial");
        setTrsreIntensity(0);
        setDhsIntensity(0);
        setDoorlyIntensity(0);
        setHaze(0);
        setOrbReveal(0);
      },
      {
        editorial: true,
        enterProgress: 0,
        enterBackProgress: 1,
        // Wait until TRSRE Impact has cleared — don't steal mid-card
        start: "top 18%",
        end: "bottom center",
      },
    );

    watch("section-finale", "finale", (p) => {
      setSceneMode("finale");
      setAttentionMode("cinematic");
      // Snap quickly so the slide doesn't flicker through mid-opacity states
      const settle = Math.min(1, p * 2.4);
      setHaze(settle);
      setOrbReveal(settle);
      setDhsIntensity(0);
      setTrsreIntensity(0);
      setDoorlyIntensity(0);
    });

    ScrollTrigger.refresh();
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      // Only reset to the dark cover if we truly started at the top —
      // Start-the-experience lands mid-cover on the city frame.
      if (window.scrollY < 40 && useScrollStore.getState().coverReveal < 0.1) {
        setSection("cover", 0);
        setSceneMode("cover");
        setCoverReveal(0);
        setActiveDevelopment(null);
        setEstateBuildingProgress(0);
        setAttentionMode("cinematic");
      }
    });

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [
    enabled,
    reduced,
    setSection,
    setSceneMode,
    setAttentionMode,
    setCoverReveal,
    setActiveDevelopment,
    setEstateBuildingProgress,
    setTowerJourney,
    setDhsIntensity,
    setTrsreIntensity,
    setDoorlyIntensity,
    setHaze,
    setOrbReveal,
    setCityAwake,
    setProgress,
  ]);
}
