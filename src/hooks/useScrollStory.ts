"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { estateTourDevelopments } from "@/config/developments";
import { useScrollStore } from "@/store/scrollStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { AnchorName } from "@/config/scene";

gsap.registerPlugin(ScrollTrigger);

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
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
  const setActiveBusinesses = useScrollStore((s) => s.setActiveBusinesses);
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
      opts?: { editorial?: boolean },
    ) => {
      const el = document.getElementById(id);
      if (!el) return;
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top center",
        end: "bottom center",
        onEnter: () => {
          setSection(section, 0);
          if (opts?.editorial) setAttentionMode("editorial");
        },
        onEnterBack: () => {
          setSection(section, 0);
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
            } else if (p < 0.62) {
              setSceneMode("reveal");
              setActiveDevelopment(null);
              setEstateBuildingProgress(0);
            } else {
              setSceneMode("approach");
              if (firstTower) setActiveDevelopment(firstTower);
              setEstateBuildingProgress(clamp01((p - 0.62) / 0.38) * 0.45);
            }
          },
          onLeave: () => {
            setCoverReveal(1);
            setCityAwake(0.55);
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

    // Estate tour — snap between developments; allow escape back into cover
    const hero = document.getElementById("section-hero");
    const tour = estateTourDevelopments;
    const tourStops = tour.length + 1; // buildings + overview
    const stopInc = 1 / (tourStops - 1);
    if (hero) {
      triggers.push(
        ScrollTrigger.create({
          trigger: hero,
          start: "top top",
          end: "bottom bottom",
          ...(reduced
            ? {}
            : {
                snap: {
                  snapTo: (value: number) => {
                    // Near the top: don't yank the user back into the first tower
                    // when they're trying to return to the cover.
                    if (value < stopInc * 0.35) return 0;
                    return Math.round(value / stopInc) * stopInc;
                  },
                  duration: { min: 0.4, max: 0.85 },
                  ease: "power2.inOut",
                  delay: 0.02,
                  directional: true,
                },
              }),
          onEnter: () => {
            setAttentionMode("cinematic");
            setCoverReveal(1);
            setSceneMode(reduced ? "quiet" : "estate");
          },
          onEnterBack: () => {
            setAttentionMode("cinematic");
            setCoverReveal(1);
            setSceneMode(reduced ? "quiet" : "estate");
          },
          onLeaveBack: () => {
            // Hand control back to the cover trigger
            setActiveDevelopment(null);
            setEstateBuildingProgress(0);
            setAttentionMode("cinematic");
          },
          onUpdate: (self) => {
            const p = self.progress;
            setSection("hero", p);
            setCoverReveal(1);

            if (reduced) {
              setActiveDevelopment(null);
              setSceneMode("quiet");
              return;
            }

            const slot = p * (tourStops - 1);
            const stop = Math.min(tourStops - 1, Math.round(slot));

            // Last stop = whole-estate overview
            if (stop >= tour.length) {
              setSceneMode("estate-overview");
              setActiveDevelopment(null);
              setEstateBuildingProgress(0);
              setCityAwake(0.85);
              return;
            }

            // First tower: short approach only while arriving from cover, then settle
            if (stop === 0 && slot < 0.18) {
              setSceneMode(slot < 0.06 ? "estate" : "approach");
              setActiveDevelopment(tour[0].anchor as AnchorName);
              setEstateBuildingProgress(
                clamp01(0.5 + Math.min(slot, 0.12) * 0.4),
              );
              setCityAwake(0.6);
              return;
            }

            const dist = Math.abs(slot - stop);
            // Keep settle progress stable near each snap; ease orbit only while moving
            const buildingProgress =
              dist < 0.1
                ? 0.62
                : clamp01(0.42 + dist * 0.28);

            setSceneMode("estate");
            setActiveDevelopment(tour[stop].anchor as AnchorName);
            setEstateBuildingProgress(buildingProgress);
            setCityAwake(0.6);
          },
          onLeave: () => {
            setSceneMode("quiet");
            setActiveDevelopment(null);
            setAttentionMode("editorial");
          },
        }),
      );
    }

    watch("section-problem", "problem", () => {
      setSceneMode("quiet");
      setAttentionMode("editorial");
      setActiveDevelopment(null);
      setCityAwake(0.45);
    }, { editorial: true });

    watch("section-resident", "resident", () => {
      setSceneMode("home");
      setAttentionMode("editorial");
      if (!useScrollStore.getState().activeDevelopment) {
        setActiveDevelopment("ANCHOR_DGS");
      }
    }, { editorial: true });

    watch("section-staff", "staff", () => {
      setSceneMode("quiet");
      setAttentionMode("editorial");
    }, { editorial: true });

    watch("section-management", "management", () => {
      setSceneMode("quiet");
      setAttentionMode("editorial");
    }, { editorial: true });

    watch("section-results", "results", () => {
      setSceneMode("quiet");
      setAttentionMode("editorial");
    }, { editorial: true });

    watch("section-dhs-early", "dhs-early", (p) => {
      setSceneMode("dhs");
      setAttentionMode(p < 0.2 ? "cinematic" : "editorial");
      setDhsIntensity(Math.min(1, p * 1.2));
      setActiveBusinesses(["ANCHOR_BIZ1", "ANCHOR_BIZ2", "ANCHOR_BIZ3"]);
      setCityAwake(0.7);
    });

    watch("section-dhs-deep", "dhs-deep", (p) => {
      setSceneMode("dhs");
      setAttentionMode("editorial");
      setDhsIntensity(0.55 + p * 0.35);
    }, { editorial: true });

    watch("section-doorly", "doorly", (p) => {
      setSceneMode("doorly");
      setAttentionMode(p < 0.25 ? "cinematic" : "editorial");
      setDoorlyIntensity(Math.min(1, p * 1.1));
      setDhsIntensity(Math.max(0, 0.35 - p * 0.3));
    });

    watch("section-trsre", "trsre", (p) => {
      setSceneMode("trsre");
      setAttentionMode(p < 0.2 ? "cinematic" : "editorial");
      setTrsreIntensity(Math.min(1, p * 1.15));
      setDoorlyIntensity(Math.max(0, 0.3 - p * 0.3));
      setDhsIntensity(0);
    });

    watch("section-placemaking", "placemaking", () => {
      setSceneMode("quiet");
      setAttentionMode("editorial");
      setTrsreIntensity(0.25);
    }, { editorial: true });

    watch("section-videos", "videos", () => {
      setSceneMode("quiet");
      setAttentionMode("editorial");
      setTrsreIntensity(0);
      setDoorlyIntensity(0);
    }, { editorial: true });

    watch("section-finale", "finale", (p) => {
      setSceneMode("finale");
      setAttentionMode("cinematic");
      setHaze(Math.min(1, p * 1.1));
      setOrbReveal(Math.max(0, (p - 0.35) * 1.6));
      setDhsIntensity(Math.max(0, 0.4 - p * 0.5));
      setTrsreIntensity(Math.max(0, 0.25 - p * 0.3));
      setDoorlyIntensity(Math.max(0, 0.2 - p * 0.3));
    });

    ScrollTrigger.refresh();
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (window.scrollY < 40) {
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
    setActiveBusinesses,
    setDhsIntensity,
    setTrsreIntensity,
    setDoorlyIntensity,
    setHaze,
    setOrbReveal,
    setCityAwake,
    setProgress,
  ]);
}
