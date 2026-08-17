"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { towerBeats, towerChapters } from "@/config/towerChapters";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollStore } from "@/store/scrollStore";
import { isMobileUiViewport } from "@/hooks/useIsMobileUi";
import type { AnchorName } from "@/config/scene";

/** Wheel delta to fill the charge and advance one tower beat */
const STEP_DELTA_THRESHOLD = 560;
const KEY_CHARGE = 0.4;
/** Touch swipe distance (px) to advance on mobile */
const TOUCH_SWIPE_PX = 40;

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function buildingProgressForBeat(chapterLocal: number, calm: boolean) {
  const settled = 0.62;
  if (calm) return settled + Math.sin(chapterLocal * Math.PI * 2) * 0.003;
  return 0.58 + chapterLocal * 0.04;
}

function heroScrollBounds() {
  const hero = document.getElementById("section-hero");
  if (!hero) return null;
  const top = hero.offsetTop;
  const range = Math.max(1, hero.offsetHeight - window.innerHeight);
  // Leave the last viewport for the Beyond hold so late tour beats
  // never sit on the DHS ScrollTrigger boundary.
  const tourRange = Math.max(1, range - window.innerHeight);
  return { top, range, tourRange };
}

function yForBeat(index: number) {
  const bounds = heroScrollBounds();
  if (!bounds) return window.scrollY;
  const t = towerBeats.length <= 1 ? 0 : index / (towerBeats.length - 1);
  return bounds.top + t * bounds.tourRange;
}

function yForBeyondBridge() {
  const bounds = heroScrollBounds();
  if (!bounds) return window.scrollY;
  return bounds.top + bounds.range;
}

/** Tour owns input while on estate beats or the Beyond bridge — even if
 *  ScrollTrigger briefly labels the section as DHS near the hero bottom. */
function isTourZone() {
  const store = useScrollStore.getState();
  if (store.storyBridge === "beyond") return true;
  if (
    store.sectionId === "hero" &&
    (store.sceneMode === "estate" || store.sceneMode === "estate-overview")
  ) {
    return true;
  }
  if (!store.towerTourStepped) return false;
  const hero = document.getElementById("section-hero");
  if (!hero) return false;
  const heroBottom = hero.offsetTop + hero.offsetHeight;
  return window.scrollY + window.innerHeight * 0.35 < heroBottom;
}

function animateScrollTo(targetY: number, duration = 0.65) {
  const dur = isMobileUiViewport() ? Math.min(duration, 0.38) : duration;
  return new Promise<void>((resolve) => {
    const proxy = { y: window.scrollY };
    gsap.to(proxy, {
      y: targetY,
      duration: dur,
      ease: "power2.inOut",
      overwrite: true,
      onUpdate: () => window.scrollTo(0, proxy.y),
      onComplete: () => {
        window.scrollTo(0, targetY);
        resolve();
      },
    });
  });
}

function applyBeat(index: number) {
  const beat = towerBeats[Math.max(0, Math.min(towerBeats.length - 1, index))];
  if (!beat) return;
  const chapter = towerChapters[beat.chapterIndex];
  if (!chapter) return;

  const store = useScrollStore.getState();
  const prevChapter = store.towerChapterIndex;

  if (beat.phase === "arrive" || beat.chapterIndex !== prevChapter) {
    store.setTowerCameraSettled(false);
  }

  store.setTowerJourney({
    towerBeatIndex: index,
    towerChapterIndex: beat.chapterIndex,
    towerLocalProgress: beat.chapterLocal,
    towerProfileVisible: beat.profileVisible,
    towerFeatureVisible: beat.featureVisible,
    towerCameraCalm: beat.cameraCalm,
    towerFeatureStateIndex: beat.featureStateIndex,
  });

  if (!chapter.anchor) {
    store.setSceneMode("estate-overview");
    store.setActiveDevelopment(null);
    store.setEstateBuildingProgress(0);
    store.setCityAwake(beat.cameraCalm ? 0.92 : 0.82);
    store.setAttentionMode(beat.cameraCalm ? "editorial" : "cinematic");
    return;
  }

  store.setSceneMode("estate");
  store.setActiveDevelopment(chapter.anchor as AnchorName);
  store.setEstateBuildingProgress(
    buildingProgressForBeat(beat.chapterLocal, beat.cameraCalm),
  );
  store.setCityAwake(0.6);
  store.setAttentionMode(beat.cameraCalm ? "editorial" : "cinematic");
}

/** Jump to a chapter’s arrival beat (nav skip). Camera settles before cards unlock. */
export function jumpToTowerChapter(chapterIndex: number) {
  const idx = towerBeats.findIndex(
    (b) => b.chapterIndex === chapterIndex && b.phase === "arrive",
  );
  if (idx < 0) return Promise.resolve();

  useScrollStore.getState().setTowerTourStepped(true);
  applyBeat(idx);
  return animateScrollTo(yForBeat(idx), 0.85);
}

/** Jump past the tour into a later page section (Beyond / TRSRE / Videos). */
export function jumpToStorySection(sectionDomId: string) {
  useScrollStore.getState().setTowerTourStepped(false);
  const el = document.getElementById(sectionDomId);
  if (!el) return Promise.resolve();
  return animateScrollTo(Math.max(0, el.offsetTop + 8), 0.9);
}

/**
 * Stepped estate tour — same idea as the prologue cards:
 * wheel charges, then advances exactly one beat. Fast scroll cannot skip.
 */
export function useTowerTourSteps(enabled: boolean) {
  const reduced = useReducedMotion();
  const chargeRef = useRef(0);
  const busyRef = useRef(false);
  const activeRef = useRef(false);

  useEffect(() => {
    if (!enabled || reduced) {
      useScrollStore.getState().setTowerTourStepped(false);
      return;
    }

    const setActive = (on: boolean) => {
      activeRef.current = on;
      useScrollStore.getState().setTowerTourStepped(on);
      if (!on) chargeRef.current = 0;
    };

    const enterBeyondBridge = async () => {
      const store = useScrollStore.getState();
      store.setStoryBridge("beyond");
      store.setSection("hero", 1);
      store.setSceneMode("estate-overview");
      store.setAttentionMode("editorial");
      store.setActiveDevelopment(null);
      store.setTowerJourney({
        towerProfileVisible: false,
        towerFeatureVisible: false,
        towerCameraCalm: true,
      });
      store.setDhsIntensity(0);
      store.setActiveBusinesses([]);
      // Stay armed so the next charge drops into the city
      setActive(true);
      chargeRef.current = 0;
      busyRef.current = true;
      await animateScrollTo(yForBeyondBridge(), 0.55);
      busyRef.current = false;
    };

    const leaveBeyondToCity = async () => {
      const store = useScrollStore.getState();
      store.setStoryBridge("none");
      setActive(false);
      busyRef.current = true;
      chargeRef.current = 0;
      const dhs = document.getElementById("section-dhs-early");
      const y = dhs
        ? dhs.offsetTop + 8
        : window.scrollY + window.innerHeight;
      // Kick the city approach as we leave the estate frame
      store.setSceneMode("dhs");
      store.setAttentionMode("cinematic");
      store.setDhsIntensity(0.35);
      await animateScrollTo(y, 0.95);
      store.setAttentionMode("editorial");
      busyRef.current = false;
    };

    const goToBeat = async (next: number) => {
      if (busyRef.current) return;
      const store = useScrollStore.getState();
      const current = store.towerBeatIndex;

      if (store.storyBridge === "beyond") {
        if (next >= towerBeats.length || next > current) {
          await leaveBeyondToCity();
          return;
        }
        // Back from Beyond → last management beat
        store.setStoryBridge("none");
        busyRef.current = true;
        chargeRef.current = 0;
        applyBeat(towerBeats.length - 1);
        await animateScrollTo(yForBeat(towerBeats.length - 1), 0.65);
        busyRef.current = false;
        return;
      }

      if (next < 0) {
        setActive(false);
        store.setStoryBridge("none");
        const cover = document.getElementById("section-cover");
        const y = cover
          ? cover.offsetTop + cover.offsetHeight * 0.68
          : Math.max(0, window.scrollY - window.innerHeight * 0.7);
        busyRef.current = true;
        await animateScrollTo(y, 0.75);
        busyRef.current = false;
        chargeRef.current = 0;
        return;
      }

      if (next >= towerBeats.length) {
        // After Management: hold “Beyond the buildings” on the estate frame
        // before any city dive.
        await enterBeyondBridge();
        return;
      }

      const fromBeat = towerBeats[current];
      // Desktop waits for camera settle on arrive; mobile must never soft-lock here.
      if (
        !isMobileUiViewport() &&
        fromBeat?.phase === "arrive" &&
        next > current &&
        !useScrollStore.getState().towerCameraSettled
      ) {
        chargeRef.current = Math.min(0.8, chargeRef.current);
        return;
      }

      store.setStoryBridge("none");
      busyRef.current = true;
      chargeRef.current = 0;
      applyBeat(next);
      await animateScrollTo(yForBeat(next), 0.65);
      busyRef.current = false;
    };

    const armIfNeeded = () => {
      if (activeRef.current) return;
      if (useScrollStore.getState().storyBridge === "beyond") {
        setActive(true);
        return;
      }
      setActive(true);
      const bounds = heroScrollBounds();
      const p = bounds
        ? clamp01((window.scrollY - bounds.top) / bounds.tourRange)
        : 0;
      // Entering the tour — always start on the arrival beat, then charge forward
      if (p < 0.12) {
        applyBeat(0);
        void animateScrollTo(yForBeat(0), 0.3);
      } else {
        const idx = Math.round(p * Math.max(1, towerBeats.length - 1));
        applyBeat(idx);
      }
    };

    const onWheel = (e: WheelEvent) => {
      const { towerCameraSettled, towerBeatIndex, storyBridge } =
        useScrollStore.getState();

      if (!isTourZone()) {
        if (activeRef.current) setActive(false);
        return;
      }

      armIfNeeded();
      e.preventDefault();
      if (busyRef.current) return;

      const currentBeat = towerBeats[towerBeatIndex];
      if (
        !isMobileUiViewport() &&
        storyBridge !== "beyond" &&
        currentBeat?.phase === "arrive" &&
        e.deltaY > 0 &&
        !towerCameraSettled
      ) {
        return;
      }

      chargeRef.current += e.deltaY / STEP_DELTA_THRESHOLD;
      if (chargeRef.current >= 1) {
        void goToBeat(towerBeatIndex + 1);
        return;
      }
      if (chargeRef.current <= -1) {
        void goToBeat(towerBeatIndex - 1);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      const { towerCameraSettled, towerBeatIndex, storyBridge } =
        useScrollStore.getState();
      if (!isTourZone()) return;

      if (
        e.key !== "ArrowDown" &&
        e.key !== "ArrowUp" &&
        e.key !== " " &&
        e.key !== "PageDown" &&
        e.key !== "PageUp"
      ) {
        return;
      }

      armIfNeeded();
      e.preventDefault();
      if (busyRef.current) return;

      const forward =
        e.key === "ArrowDown" || e.key === " " || e.key === "PageDown";
      const currentBeat = towerBeats[towerBeatIndex];
      if (
        !isMobileUiViewport() &&
        storyBridge !== "beyond" &&
        forward &&
        currentBeat?.phase === "arrive" &&
        !towerCameraSettled
      ) {
        return;
      }

      chargeRef.current += forward ? KEY_CHARGE : -KEY_CHARGE;
      if (chargeRef.current >= 1) void goToBeat(towerBeatIndex + 1);
      else if (chargeRef.current <= -1) void goToBeat(towerBeatIndex - 1);
    };

    const syncFromStore = () => {
      if (isTourZone() && !activeRef.current) {
        armIfNeeded();
      } else if (!isTourZone() && activeRef.current) {
        setActive(false);
      }
    };

    const unsub = useScrollStore.subscribe(syncFromStore);
    syncFromStore();

    let touchY = 0;
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0;
      touchStartY = touchY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isTourZone()) return;
      // Mobile: don't preventDefault on move — advance on touchend instead.
      if (isMobileUiViewport()) return;

      const { towerCameraSettled, towerBeatIndex, storyBridge } =
        useScrollStore.getState();

      armIfNeeded();
      e.preventDefault();
      if (busyRef.current) return;

      const y = e.touches[0]?.clientY ?? touchY;
      const delta = touchY - y;
      touchY = y;

      const currentBeat = towerBeats[towerBeatIndex];
      if (
        storyBridge !== "beyond" &&
        currentBeat?.phase === "arrive" &&
        delta > 0 &&
        !towerCameraSettled
      ) {
        return;
      }

      chargeRef.current += delta / (STEP_DELTA_THRESHOLD * 0.55);
      if (chargeRef.current >= 1) void goToBeat(towerBeatIndex + 1);
      else if (chargeRef.current <= -1) void goToBeat(towerBeatIndex - 1);
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!isMobileUiViewport()) return;
      if (!isTourZone()) return;

      armIfNeeded();
      if (busyRef.current) return;

      const y = e.changedTouches[0]?.clientY ?? touchStartY;
      const dy = touchStartY - y;
      if (Math.abs(dy) < TOUCH_SWIPE_PX) return;

      const { towerBeatIndex } = useScrollStore.getState();
      chargeRef.current = 0;
      if (dy > 0) void goToBeat(towerBeatIndex + 1);
      else void goToBeat(towerBeatIndex - 1);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      unsub();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      useScrollStore.getState().setTowerTourStepped(false);
    };
  }, [enabled, reduced]);
}
