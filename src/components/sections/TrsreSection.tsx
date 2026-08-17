"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { trsreCopy, trsreImages, trsrePins, trsreVideos } from "@/config/trsre";
import { trsreProof } from "@/config/metrics";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollStore } from "@/store/scrollStore";
import { isMobileUiViewport, useIsMobileUi, isChromeTouchTarget } from "@/hooks/useIsMobileUi";

/**
 * Desktop (5): intro → pins → codes+video → explore → impact
 * Mobile  (6): intro → pins → codes title → video → explore → impact
 */
const DESKTOP_BEATS = 5;
const MOBILE_BEATS = 6;
/** Higher than DHS — TRSRE slides are denser and easier to overshoot */
const STEP_DELTA_THRESHOLD = 640;
/** Extra hold on the video beat when advancing forward */
const VIDEO_FORWARD_THRESHOLD = 920;
const KEY_CHARGE = 0.35;
const TOUCH_SWIPE_PX = 40;

function beatCount(mobile: boolean) {
  return mobile ? MOBILE_BEATS : DESKTOP_BEATS;
}

function trsreBounds() {
  const el = document.getElementById("section-trsre");
  if (!el) return null;
  const top = el.offsetTop;
  const range = Math.max(1, el.offsetHeight - window.innerHeight);
  return { top, range };
}

function yForTrsreBeat(index: number, mobile: boolean) {
  const bounds = trsreBounds();
  if (!bounds) return window.scrollY;
  const total = beatCount(mobile);
  const t = total <= 1 ? 0 : index / (total - 1);
  return bounds.top + t * bounds.range;
}

function animateScrollTo(targetY: number, duration = 0.65) {
  const dur = isMobileUiViewport() ? Math.min(duration, 0.38) : duration;
  return new Promise<void>((resolve) => {
    if (dur <= 0.01) {
      window.scrollTo(0, targetY);
      resolve();
      return;
    }
    const proxy = { y: window.scrollY };
    gsap.to(proxy, {
      y: targetY,
      duration: dur,
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

function thresholdForStep(
  fromBeat: number,
  direction: 1 | -1,
  mobile: boolean,
) {
  const videoBeat = mobile ? 3 : 2;
  if (direction > 0 && fromBeat === videoBeat) return VIDEO_FORWARD_THRESHOLD;
  return STEP_DELTA_THRESHOLD;
}

/**
 * TRSRE — charge-to-advance (same feel as DHS / tower tour).
 */
export function TrsreSection() {
  const reduced = useReducedMotion();
  const mobile = useIsMobileUi();
  const sectionId = useScrollStore((s) => s.sectionId);
  const setTrsreShowPins = useScrollStore((s) => s.setTrsreShowPins);
  const [beat, setBeat] = useState(0);
  const beatRef = useRef(0);
  const chargeRef = useRef(0);
  const busyRef = useRef(false);
  const activeRef = useRef(false);
  const armedRef = useRef(false);
  const exitingRef = useRef(false);
  const touchY = useRef<number | null>(null);
  const touchStartY = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mobileRef = useRef(mobile);
  mobileRef.current = mobile;

  const inTrsre = sectionId === "trsre";
  // iPad: keep cards mounted if ST briefly steals sectionId mid beat-scroll
  const [stageHeld, setStageHeld] = useState(false);
  const showStage = inTrsre || stageHeld;

  const showCodesTitle = beat === 2;
  const showVideo = mobile ? beat === 3 : beat === 2;
  const showExplore = mobile ? beat === 4 : beat === 3;
  const showImpact = mobile ? beat === 5 : beat === 4;
  const showPanel = showExplore || showImpact;

  useEffect(() => {
    if (inTrsre) {
      setStageHeld(true);
      return;
    }
    if (!busyRef.current && !exitingRef.current) {
      setStageHeld(false);
    }
  }, [inTrsre]);

  useEffect(() => {
    beatRef.current = beat;
    setTrsreShowPins(showStage && beat >= 1);
    return () => setTrsreShowPins(false);
  }, [beat, showStage, setTrsreShowPins]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (showStage && showVideo) {
      el.currentTime = 0;
      void el.play().catch(() => {
        /* muted autoplay may still be blocked until gesture */
      });
    } else {
      el.pause();
    }
  }, [showStage, showVideo]);

  useEffect(() => {
    if (!inTrsre) {
      activeRef.current = false;
      armedRef.current = false;
      chargeRef.current = 0;
      // Don't clear exiting mid-handoff — that re-arms and teleports scroll
      if (!busyRef.current) exitingRef.current = false;
      return;
    }

    if (exitingRef.current || busyRef.current) return;

    if (!armedRef.current) {
      armedRef.current = true;
      activeRef.current = true;
      chargeRef.current = 0;

      const bounds = trsreBounds();
      const fromBelow =
        bounds != null &&
        window.scrollY > bounds.top + bounds.range * 0.4;
      const startBeat = fromBelow ? beatCount(mobileRef.current) - 1 : 0;

      beatRef.current = startBeat;
      setBeat(startBeat);
      busyRef.current = true;
      void animateScrollTo(
        yForTrsreBeat(startBeat, mobileRef.current),
        fromBelow ? 0.35 : 0.01,
      ).then(() => {
        busyRef.current = false;
        chargeRef.current = 0;
      });
    }
  }, [inTrsre]);

  useEffect(() => {
    if (reduced) return;

    const releaseToDhs = async () => {
      exitingRef.current = true;
      activeRef.current = false;
      armedRef.current = false;
      busyRef.current = true;
      chargeRef.current = 0;
      setStageHeld(false);
      setTrsreShowPins(false);

      const store = useScrollStore.getState();
      // Claim target early so rival triggers can't yank section mid-flight
      store.setScrollHandoff("dhs-early");

      const dhs = document.getElementById("section-dhs-early");
      const y = dhs
        ? dhs.offsetTop + Math.max(0, dhs.offsetHeight - window.innerHeight) - 8
        : Math.max(0, window.scrollY - window.innerHeight);
      // Stay on trsre for wheel lock until parked, then hand off
      await animateScrollTo(y, 0.7);
      store.setSection("dhs-early", 1);
      store.setSceneMode("dhs");
      store.setAttentionMode("editorial");
      store.setTrsreIntensity(0);
      await new Promise((r) => window.setTimeout(r, 140));
      store.setScrollHandoff(null);
      busyRef.current = false;
      exitingRef.current = false;
    };

    const releaseToVideos = async () => {
      exitingRef.current = true;
      activeRef.current = false;
      armedRef.current = false;
      busyRef.current = true;
      chargeRef.current = 0;
      setStageHeld(false);
      setTrsreShowPins(false);

      const store = useScrollStore.getState();
      store.setScrollHandoff("videos");

      const videos = document.getElementById("section-videos");
      // Park on the sticky first-card hold — not a hairline past the seam
      const y = videos
        ? videos.offsetTop + Math.round(window.innerHeight * 0.08)
        : window.scrollY + window.innerHeight;
      // Keep section=trsre during the tween so wheel stay-locked (busy)
      await animateScrollTo(y, 0.7);
      store.setSection("videos", 0);
      store.setSceneMode("quiet");
      store.setAttentionMode("editorial");
      store.setTrsreIntensity(0);
      store.setDhsIntensity(0);
      // Absorb trackpad inertia before free-scroll videos takes over
      await new Promise((r) => window.setTimeout(r, 180));
      store.setScrollHandoff(null);
      busyRef.current = false;
      exitingRef.current = false;
    };

    const goToBeat = async (next: number) => {
      if (busyRef.current || exitingRef.current) return;
      const mobileNow = mobileRef.current;
      const total = beatCount(mobileNow);

      if (next < 0) {
        await releaseToDhs();
        return;
      }
      if (next >= total) {
        await releaseToVideos();
        return;
      }

      busyRef.current = true;
      chargeRef.current = 0;
      beatRef.current = next;
      setBeat(next);
      // Hold section ownership so Videos/DHS ST can't blank cards mid-scroll (iPad)
      const store = useScrollStore.getState();
      store.setScrollHandoff("trsre");
      store.setSection("trsre", total <= 1 ? 0 : next / (total - 1));
      await animateScrollTo(yForTrsreBeat(next, mobileNow), 0.75);
      store.setScrollHandoff(null);
      busyRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      const sid = useScrollStore.getState().sectionId;
      if (sid !== "trsre" || exitingRef.current) {
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

      const dir: 1 | -1 = e.deltaY >= 0 ? 1 : -1;
      const threshold = thresholdForStep(
        beatRef.current,
        dir,
        mobileRef.current,
      );
      chargeRef.current += e.deltaY / threshold;

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
      if (sid !== "trsre" || exitingRef.current) return;
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
      const y = e.touches[0]?.clientY ?? 0;
      touchY.current = y;
      touchStartY.current = y;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isChromeTouchTarget(e)) return;
      const sid = useScrollStore.getState().sectionId;
      if (sid !== "trsre" || exitingRef.current) return;
      if (busyRef.current) {
        e.preventDefault();
        return;
      }
      if (isMobileUiViewport()) {
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

      const dir: 1 | -1 = dy >= 0 ? 1 : -1;
      const threshold =
        thresholdForStep(beatRef.current, dir, mobileRef.current) * 0.65;
      chargeRef.current += dy / threshold;
      if (chargeRef.current >= 1) void goToBeat(beatRef.current + 1);
      else if (chargeRef.current <= -1) void goToBeat(beatRef.current - 1);
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!isMobileUiViewport()) return;
      if (isChromeTouchTarget(e)) return;
      const sid = useScrollStore.getState().sectionId;
      if (sid !== "trsre" || exitingRef.current) return;
      if (busyRef.current) return;

      if (!activeRef.current) {
        activeRef.current = true;
        armedRef.current = true;
      }

      const y = e.changedTouches[0]?.clientY ?? touchStartY.current;
      const dy = touchStartY.current - y;
      if (Math.abs(dy) < TOUCH_SWIPE_PX) return;

      chargeRef.current = 0;
      if (dy > 0) void goToBeat(beatRef.current + 1);
      else void goToBeat(beatRef.current - 1);
    };

    let lastDemoNonce = useScrollStore.getState().demoStepNonce;
    const unsubDemo = useScrollStore.subscribe((s) => {
      if (s.demoStepNonce === lastDemoNonce) return;
      lastDemoNonce = s.demoStepNonce;
      const sid = s.sectionId;
      if (sid !== "trsre" || exitingRef.current) return;
      if (busyRef.current) return;
      if (!activeRef.current) {
        activeRef.current = true;
        armedRef.current = true;
      }
      chargeRef.current = 0;
      if (s.demoStepDir > 0) void goToBeat(beatRef.current + 1);
      else void goToBeat(beatRef.current - 1);
    });

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      unsubDemo();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [reduced, setTrsreShowPins]);

  return (
    <section
      id="section-trsre"
      className="story-section--pin story-section--trsre"
      aria-labelledby="trsre-heading"
    >
      <div
        className={`pointer-events-none fixed inset-0 z-[15] flex items-end pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(4.5rem,env(safe-area-inset-top))] md:items-center md:pb-0 md:pt-0 ${
          showStage ? "" : "invisible"
        }`}
        aria-hidden={!showStage}
      >
        <div className="container-wide w-full pointer-events-auto">
          {showStage && beat === 0 ? (
            <div className="trsre-intro-title">
              <p className="text-label text-muted-dark">
                {trsreCopy.introLabel}
              </p>
              <h2
                id="trsre-heading"
                className="mt-4 max-w-3xl text-display editorial-type"
              >
                {trsreCopy.introHeadline}
              </h2>
              <p className="mt-5 max-w-xl text-subhead text-ink/70">
                {trsreCopy.introBody}
              </p>
            </div>
          ) : null}

          {showStage && showCodesTitle ? (
            <div
              className={
                mobile
                  ? "trsre-codes-layout trsre-codes-layout--title-only"
                  : "trsre-codes-layout"
              }
            >
              <div className="trsre-intro-title">
                <p className="text-label text-muted-dark">
                  {trsreCopy.codesLabel}
                </p>
                <h2 className="mt-4 max-w-3xl text-display editorial-type">
                  Over 300
                  <br />
                  hidden TRSRE codes
                </h2>
                <p className="mt-5 max-w-xl text-subhead text-ink/70">
                  {trsreCopy.codesBody}
                </p>
                <div
                  className="trsre-pin-legend"
                  aria-label="Hunt difficulty"
                >
                  <span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={trsrePins.easySvg} alt="" />
                    Easy
                  </span>
                  <span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={trsrePins.mediumSvg} alt="" />
                    Medium
                  </span>
                  <span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={trsrePins.hardSvg} alt="" />
                    Hard
                  </span>
                </div>
              </div>
              {!mobile ? (
                <div className="trsre-video-frame">
                  <video
                    ref={videoRef}
                    className="trsre-media__video"
                    src={trsreVideos.halloween}
                    muted
                    playsInline
                    loop
                    autoPlay
                    preload="metadata"
                    aria-label="TRSRE Halloween hunt in Manchester"
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {showStage && mobile && showVideo ? (
            <div className="trsre-codes-layout trsre-codes-layout--video-only">
              <div className="trsre-video-frame">
                <video
                  ref={videoRef}
                  className="trsre-media__video"
                  src={trsreVideos.halloween}
                  muted
                  playsInline
                  loop
                  autoPlay
                  preload="metadata"
                  aria-label="TRSRE Halloween hunt in Manchester"
                />
              </div>
            </div>
          ) : null}

          {showStage && showPanel ? (
            <div className="trsre-center-stage">
              <div
                className={`trsre-panel${
                  showImpact ? " trsre-panel--impact" : ""
                }${showExplore ? " trsre-panel--explore" : ""}`}
              >
                <div className="trsre-panel__copy">
                  {showExplore && (
                    <article className="trsre-panel__copy-inner">
                      <p className="city-scroll-card__label">Exploration</p>
                      <p className="city-scroll-card__metric">
                        {trsreProof.steps}
                      </p>
                      <h2 className="city-scroll-card__title city-scroll-card__title--md">
                        {trsreProof.stepsLabel}
                      </h2>
                      <p className="city-scroll-card__body">
                        {trsreCopy.mapLine}
                      </p>
                    </article>
                  )}

                  {showImpact && (
                    <article className="trsre-panel__copy-inner">
                      <p className="city-scroll-card__label">Impact</p>
                      <blockquote className="city-scroll-card__quote">
                        “{trsreProof.quote}”
                      </blockquote>
                      <p className="city-scroll-card__note">
                        {trsreProof.quoteNote}
                      </p>
                    </article>
                  )}
                </div>

                <div className="trsre-panel__media">
                  <div className="trsre-panel__media-frame">
                    {showExplore ? (
                      <div
                        className={`trsre-media__grid${
                          mobile
                            ? " trsre-media__grid--two"
                            : " trsre-media__grid--three"
                        }`}
                      >
                        {!mobile ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={trsreImages.stepsMap} alt="" />
                        ) : null}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={trsreImages.stepsHunt} alt="" />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={trsreImages.stepsApp} alt="" />
                      </div>
                    ) : null}
                    {showImpact ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={trsreImages.cheque}
                        alt="TRSRE prize winner with ceremonial cheque"
                        className="trsre-media__img trsre-media__img--cheque"
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
