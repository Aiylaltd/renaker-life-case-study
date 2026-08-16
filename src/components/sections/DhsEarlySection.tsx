"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { sections } from "@/config/caseStudy";
import {
  dhsActiveAnchorsForBeat,
  dhsBeatIndexToSearch,
  dhsSearchBeats,
} from "@/config/dhsWalkthrough";
import { BusinessDashboard } from "@/components/demos/BusinessDashboard";
import { DhsBusinessCard } from "@/components/demos/DhsBusinessCard";
import { DhsVisionSearchCard } from "@/components/demos/DhsVisionSearchCard";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollStore } from "@/store/scrollStore";
import type { AnchorName } from "@/config/scene";

/** Beyond on estate bridge; DHS: intro → 3 real searches → vision card → dashboard */
const BEATS = 6;
const STEP_DELTA_THRESHOLD = 520;
const KEY_CHARGE = 0.4;

function dhsBounds() {
  const el = document.getElementById("section-dhs-early");
  if (!el) return null;
  const top = el.offsetTop;
  const range = Math.max(1, el.offsetHeight - window.innerHeight);
  return { top, range };
}

function yForDhsBeat(index: number) {
  const bounds = dhsBounds();
  if (!bounds) return window.scrollY;
  const t = BEATS <= 1 ? 0 : index / (BEATS - 1);
  return bounds.top + t * bounds.range;
}

function animateScrollTo(targetY: number, duration = 0.65) {
  return new Promise<void>((resolve) => {
    if (duration <= 0.01) {
      window.scrollTo(0, targetY);
      resolve();
      return;
    }
    const proxy = { y: window.scrollY };
    gsap.to(proxy, {
      y: targetY,
      duration,
      ease: "power3.inOut",
      overwrite: true,
      onUpdate: () => window.scrollTo(0, proxy.y),
      onComplete: () => {
        window.scrollTo(0, targetY);
        resolve();
      },
    });
  });
}

function businessesForBeat(beat: number): AnchorName[] {
  if (beat === 0) {
    return dhsSearchBeats.map((b) => b.business.anchor);
  }
  return dhsActiveAnchorsForBeat(beat);
}

/**
 * Digital High Street — charge-to-advance.
 * “Beyond the buildings” is shown earlier on the estate bridge.
 */
export function DhsEarlySection() {
  const reduced = useReducedMotion();
  const sectionId = useScrollStore((s) => s.sectionId);
  const setActiveBusinesses = useScrollStore((s) => s.setActiveBusinesses);
  const [beat, setBeat] = useState(0);
  const beatRef = useRef(0);
  const chargeRef = useRef(0);
  const busyRef = useRef(false);
  const activeRef = useRef(false);
  const armedRef = useRef(false);
  const exitingRef = useRef(false);
  const touchY = useRef<number | null>(null);

  const inDhs = sectionId === "dhs-early";
  const searchBeat = dhsBeatIndexToSearch(beat);

  useEffect(() => {
    beatRef.current = beat;
    if (inDhs) {
      setActiveBusinesses(businessesForBeat(beat));
      const store = useScrollStore.getState();
      store.setDhsVisionPulse(beat === 4);
      store.setDhsBreakoutRise(beat >= 4);
    } else {
      const store = useScrollStore.getState();
      store.setDhsVisionPulse(false);
      store.setDhsBreakoutRise(false);
    }
  }, [beat, inDhs, setActiveBusinesses]);

  useEffect(() => {
    if (!inDhs) {
      activeRef.current = false;
      armedRef.current = false;
      exitingRef.current = false;
      chargeRef.current = 0;
      return;
    }

    if (exitingRef.current) return;

    if (!armedRef.current) {
      armedRef.current = true;
      activeRef.current = true;
      beatRef.current = 0;
      setBeat(0);
      chargeRef.current = 0;
      window.scrollTo(0, yForDhsBeat(0));
    }
  }, [inDhs]);

  useEffect(() => {
    if (reduced) return;

    const releaseToBeyondBridge = async () => {
      exitingRef.current = true;
      activeRef.current = false;
      armedRef.current = false;
      busyRef.current = true;
      chargeRef.current = 0;

      const store = useScrollStore.getState();
      store.setStoryBridge("beyond");
      store.setSection("hero", 0.99);
      store.setSceneMode("estate-overview");
      store.setTowerTourStepped(true);
      store.setAttentionMode("editorial");
      store.setDhsIntensity(0);
      store.setTowerJourney({
        towerProfileVisible: false,
        towerFeatureVisible: false,
        towerCameraCalm: true,
      });
      setActiveBusinesses([]);
      useScrollStore.getState().setDhsVisionPulse(false);
      useScrollStore.getState().setDhsBreakoutRise(false);

      const dhs = document.getElementById("section-dhs-early");
      const hero = document.getElementById("section-hero");
      const y = hero
        ? hero.offsetTop + hero.offsetHeight - window.innerHeight
        : dhs
          ? Math.max(0, dhs.offsetTop - Math.round(window.innerHeight * 0.85))
          : Math.max(0, window.scrollY - window.innerHeight);

      await animateScrollTo(y, 0.7);
      busyRef.current = false;
      exitingRef.current = false;
    };

    const releaseToTrsre = async () => {
      exitingRef.current = true;
      activeRef.current = false;
      armedRef.current = false;
      busyRef.current = true;
      chargeRef.current = 0;
      setActiveBusinesses([]);
      useScrollStore.getState().setDhsVisionPulse(false);
      useScrollStore.getState().setDhsBreakoutRise(false);

      const trsre = document.getElementById("section-trsre");
      const y = trsre
        ? trsre.offsetTop + 8
        : window.scrollY + window.innerHeight;
      await animateScrollTo(y, 0.85);
      busyRef.current = false;
      exitingRef.current = false;
    };

    const goToBeat = async (next: number) => {
      if (busyRef.current || exitingRef.current) return;

      if (next < 0) {
        await releaseToBeyondBridge();
        return;
      }

      if (next >= BEATS) {
        await releaseToTrsre();
        return;
      }

      busyRef.current = true;
      chargeRef.current = 0;
      beatRef.current = next;
      setBeat(next);
      await animateScrollTo(yForDhsBeat(next), 0.85);
      busyRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      const sid = useScrollStore.getState().sectionId;
      if (sid !== "dhs-early" || exitingRef.current) {
        activeRef.current = false;
        return;
      }
      if (busyRef.current) {
        e.preventDefault();
        return;
      }
      if (!activeRef.current) {
        activeRef.current = true;
        armedRef.current = true;
      }

      e.preventDefault();

      chargeRef.current += e.deltaY / STEP_DELTA_THRESHOLD;
      if (chargeRef.current >= 1) {
        void goToBeat(beatRef.current + 1);
        return;
      }
      if (chargeRef.current <= -1) {
        void goToBeat(beatRef.current - 1);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      const sid = useScrollStore.getState().sectionId;
      if (sid !== "dhs-early" || exitingRef.current) return;
      if (busyRef.current) {
        e.preventDefault();
        return;
      }
      if (!activeRef.current) {
        activeRef.current = true;
        armedRef.current = true;
      }
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        chargeRef.current += KEY_CHARGE;
        if (chargeRef.current >= 1) void goToBeat(beatRef.current + 1);
      }
      if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        chargeRef.current -= KEY_CHARGE;
        if (chargeRef.current <= -1) void goToBeat(beatRef.current - 1);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchY.current = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      const sid = useScrollStore.getState().sectionId;
      if (sid !== "dhs-early" || exitingRef.current) return;
      if (busyRef.current) {
        e.preventDefault();
        return;
      }
      if (!activeRef.current) {
        activeRef.current = true;
        armedRef.current = true;
      }
      if (touchY.current == null) return;
      const y = e.touches[0]?.clientY;
      if (y == null) return;
      const dy = touchY.current - y;
      touchY.current = y;
      e.preventDefault();
      chargeRef.current += dy / (STEP_DELTA_THRESHOLD * 0.65);
      if (chargeRef.current >= 1) void goToBeat(beatRef.current + 1);
      else if (chargeRef.current <= -1) void goToBeat(beatRef.current - 1);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [reduced, setActiveBusinesses]);

  return (
    <section
      id="section-dhs-early"
      className="story-section--pin story-section--dhs"
      aria-labelledby="dhs-heading"
    >
      <div
        className={`pointer-events-none fixed inset-0 z-[15] flex items-end pb-[12vh] md:items-center md:pb-0 ${
          inDhs ? "" : "invisible"
        }`}
        aria-hidden={!inDhs}
      >
        <div className="container-wide w-full pointer-events-auto">
          {inDhs && beat === 0 ? (
            <div>
              <p className="text-label text-muted-dark">
                {sections.dhsEarly.rewardsLine}
              </p>
              <h2
                id="dhs-heading"
                className="mt-4 max-w-3xl text-display editorial-type"
              >
                {sections.dhsEarly.headline}
              </h2>
              <p className="mt-5 max-w-xl text-subhead text-ink/70">
                {sections.dhsEarly.body}
              </p>
            </div>
          ) : null}

          {inDhs && searchBeat ? (
            <div className="dhs-search-layout">
              <div className="dhs-beat-copy--panel dhs-prompt-card">
                <p className="text-label text-muted-dark">Resident search</p>
                <p className="dhs-prompt-card__query">
                  “{searchBeat.prompt}”
                </p>
              </div>
              <DhsBusinessCard business={searchBeat.business} />
            </div>
          ) : null}

          {inDhs && beat === 4 ? (
            <div className="dhs-center-stage">
              <DhsVisionSearchCard active={inDhs && beat === 4} />
            </div>
          ) : null}

          {inDhs && beat === 5 ? (
            <div className="dhs-center-stage">
              <div className="dhs-beat-copy--panel dhs-insight-card pointer-events-auto">
                <p className="text-label text-muted-dark">For local businesses</p>
                <h2 className="mt-3 text-headline editorial-type">
                  {sections.dhsEarly.businessHeadline}
                </h2>
                <p className="mt-4 max-w-2xl text-body text-ink/70">
                  {sections.dhsEarly.businessBody}
                </p>
                <div className="mt-6">
                  <BusinessDashboard />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
