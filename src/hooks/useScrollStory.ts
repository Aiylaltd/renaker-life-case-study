"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { developments } from "@/config/developments";
import { useScrollStore } from "@/store/scrollStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { AnchorName } from "@/config/scene";

gsap.registerPlugin(ScrollTrigger);

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

    // Dark → light reveal
    const cover = document.getElementById("section-cover");
    if (cover) {
      triggers.push(
        ScrollTrigger.create({
          trigger: cover,
          start: "top top",
          end: "bottom bottom",
          onEnter: () => {
            setSceneMode("reveal");
            setAttentionMode("cinematic");
            setSection("cover", 0);
          },
          onEnterBack: () => {
            setSceneMode("reveal");
            setAttentionMode("cinematic");
          },
          onUpdate: (self) => {
            const p = self.progress;
            setSection("cover", p);
            setCoverReveal(Math.min(1, p * 1.15));
            setCityAwake(p * 0.5);
            setSceneMode(p < 0.95 ? "reveal" : "overview");
          },
          onLeave: () => {
            setCoverReveal(1);
            setCityAwake(0.55);
          },
        }),
      );
    }

    // Slow estate tour — each building gets a full progress slice
    const hero = document.getElementById("section-hero");
    if (hero) {
      triggers.push(
        ScrollTrigger.create({
          trigger: hero,
          start: "top top",
          end: "bottom bottom",
          onEnter: () => {
            setAttentionMode("cinematic");
            setCoverReveal(1);
            setSceneMode(reduced ? "quiet" : "estate");
          },
          onEnterBack: () => {
            setAttentionMode("cinematic");
            setSceneMode(reduced ? "quiet" : "estate");
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

            // Final slice = estate overview
            if (p > 0.9) {
              setSceneMode("estate-overview");
              setActiveDevelopment(null);
              setEstateBuildingProgress(0);
              setCityAwake(0.85);
              return;
            }

            const tourP = p / 0.9;
            const count = developments.length;
            const scaled = tourP * count;
            const idx = Math.min(count - 1, Math.floor(scaled));
            const local = scaled - idx;

            setSceneMode("estate");
            setActiveDevelopment(developments[idx].anchor as AnchorName);
            setEstateBuildingProgress(local);
            setCityAwake(0.55 + local * 0.2);
          },
          onLeave: () => {
            setSceneMode("quiet");
            setActiveDevelopment(null);
            setAttentionMode("editorial");
          },
        }),
      );
    }

    watch("section-problem", "problem", (p) => {
      setSceneMode("quiet");
      setAttentionMode("editorial");
      setCityAwake(0.4 + p * 0.2);
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

    // DHS after results (locked order)
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
