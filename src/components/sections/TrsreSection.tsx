"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { trsreCopy, trsreImages, trsrePins, trsreVideos } from "@/config/trsre";
import { trsreProof } from "@/config/metrics";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollStore } from "@/store/scrollStore";

/**
 * 0 = Beyond-style intro title
 * 1 = map pin showcase in FOV
 * 2 = 300 codes (title style) + video frame only
 * 3–4 = explore / impact cards
 */
const BEATS = 5;
/** Higher than DHS — TRSRE slides are denser and easier to overshoot */
const STEP_DELTA_THRESHOLD = 640;
/** Extra hold on the Over 300 + video beat when advancing forward */
const CODES_FORWARD_THRESHOLD = 920;
const KEY_CHARGE = 0.35;

function trsreBounds() {
  const el = document.getElementById("section-trsre");
  if (!el) return null;
  const top = el.offsetTop;
  const range = Math.max(1, el.offsetHeight - window.innerHeight);
  return { top, range };
}

function yForTrsreBeat(index: number) {
  const bounds = trsreBounds();
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

function thresholdForStep(fromBeat: number, direction: 1 | -1) {
  // Leaving the codes/video beat forward needs a deliberate charge
  if (direction > 0 && fromBeat === 2) return CODES_FORWARD_THRESHOLD;
  return STEP_DELTA_THRESHOLD;
}

/**
 * TRSRE — charge-to-advance (same feel as DHS / tower tour).
 */
export function TrsreSection() {
  const reduced = useReducedMotion();
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
  const videoRef = useRef<HTMLVideoElement>(null);

  const inTrsre = sectionId === "trsre";
  const showPanel = beat >= 3;

  useEffect(() => {
    beatRef.current = beat;
    setTrsreShowPins(inTrsre && beat >= 1);
    return () => setTrsreShowPins(false);
  }, [beat, inTrsre, setTrsreShowPins]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (inTrsre && beat === 2) {
      el.currentTime = 0;
      void el.play().catch(() => {
        /* muted autoplay may still be blocked until gesture */
      });
    } else {
      el.pause();
    }
  }, [inTrsre, beat]);

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
      const startBeat = fromBelow ? BEATS - 1 : 0;

      beatRef.current = startBeat;
      setBeat(startBeat);
      busyRef.current = true;
      void animateScrollTo(
        yForTrsreBeat(startBeat),
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

      if (next < 0) {
        await releaseToDhs();
        return;
      }
      if (next >= BEATS) {
        await releaseToVideos();
        return;
      }

      busyRef.current = true;
      chargeRef.current = 0;
      beatRef.current = next;
      setBeat(next);
      await animateScrollTo(yForTrsreBeat(next), 0.75);
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
      const threshold = thresholdForStep(beatRef.current, dir);
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
      touchY.current = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
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
      if (touchY.current == null) return;
      const y = e.touches[0]?.clientY;
      if (y == null) return;
      const dy = touchY.current - y;
      touchY.current = y;
      e.preventDefault();

      const dir: 1 | -1 = dy >= 0 ? 1 : -1;
      const threshold = thresholdForStep(beatRef.current, dir) * 0.65;
      chargeRef.current += dy / threshold;
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
  }, [reduced, setTrsreShowPins]);

  return (
    <section
      id="section-trsre"
      className="story-section--pin story-section--trsre"
      aria-labelledby="trsre-heading"
    >
      <div
        className={`pointer-events-none fixed inset-0 z-[15] flex items-end pb-[12vh] md:items-center md:pb-0 ${
          inTrsre ? "" : "invisible"
        }`}
        aria-hidden={!inTrsre}
      >
        <div className="container-wide w-full pointer-events-auto">
          {inTrsre && beat === 0 ? (
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

          {inTrsre && beat === 2 ? (
            <div className="trsre-codes-layout">
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

          {inTrsre && showPanel ? (
            <div className="trsre-center-stage">
              <div className="trsre-panel">
                <div className="trsre-panel__copy">
                  {beat === 3 && (
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

                  {beat === 4 && (
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
                    {beat === 3 ? (
                      <div className="trsre-media__grid trsre-media__grid--three">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={trsreImages.stepsMap} alt="" />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={trsreImages.stepsHunt} alt="" />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={trsreImages.stepsApp} alt="" />
                      </div>
                    ) : null}
                    {beat === 4 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={trsreImages.cheque}
                        alt="TRSRE prize winner with ceremonial cheque"
                        className="trsre-media__img"
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
