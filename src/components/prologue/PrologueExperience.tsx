"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGLTF } from "@react-three/drei";
import { RenakerLifeLogo } from "@/components/ui/RenakerLifeLogo";
import { AmbitionVisual } from "@/components/prologue/AmbitionVisuals";
import {
  prologueAiyla,
  prologueAmbitions,
  prologueLoadingPhrases,
  prologueOrientation,
  prologueStart,
  prologueSurfaces,
} from "@/config/prologue";
import { sceneAssets } from "@/config/scene";
import { useScrollStore } from "@/store/scrollStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { isMobileUiViewport } from "@/hooks/useIsMobileUi";

gsap.registerPlugin(ScrollTrigger);

type Stage = "loading" | "orientation" | "story" | "exiting" | "done";

/** Ambitions + final Aiyla / Start panel — all swap inside one fixed stage. */
const STORY_STEPS = prologueAmbitions.length + 1;
const AIYLA_STEP = prologueAmbitions.length;

/** Wheel delta needed to fill the side meter and change slide. */
const STEP_DELTA_THRESHOLD = 520;
/** Finger travel (px) to fill the meter on touch devices. */
const TOUCH_DELTA_THRESHOLD = 150;
/** Key press fills this much of the meter (space / arrows). */
const KEY_CHARGE = 0.42;

/**
 * HTML/CSS prologue above the persistent V1 canvas.
 * Loading → orientation → ambitions → Aiyla/Start → existing cover scroll.
 */
export function PrologueExperience() {
  const reduced = useReducedMotion();
  const modelLoadingState = useScrollStore((s) => s.modelLoadingState);
  const modelRef = useRef(modelLoadingState);
  modelRef.current = modelLoadingState;

  const setLoaderDone = useScrollStore((s) => s.setLoaderDone);
  const setExperienceStarted = useScrollStore((s) => s.setExperienceStarted);
  const setSceneMode = useScrollStore((s) => s.setSceneMode);
  const setCoverReveal = useScrollStore((s) => s.setCoverReveal);
  const setAttentionMode = useScrollStore((s) => s.setAttentionMode);
  const setActiveDevelopment = useScrollStore((s) => s.setActiveDevelopment);
  const setEstateBuildingProgress = useScrollStore(
    (s) => s.setEstateBuildingProgress,
  );
  const setDemoIntroLock = useScrollStore((s) => s.setDemoIntroLock);
  const setScrollCueVisible = useScrollStore((s) => s.setScrollCueVisible);
  const setSection = useScrollStore((s) => s.setSection);
  const setCityAwake = useScrollStore((s) => s.setCityAwake);
  const requestCameraSnap = useScrollStore((s) => s.requestCameraSnap);
  const setTowerTourStepped = useScrollStore((s) => s.setTowerTourStepped);
  const setStoryBridge = useScrollStore((s) => s.setStoryBridge);
  const setTowerJourney = useScrollStore((s) => s.setTowerJourney);
  const setDhsIntensity = useScrollStore((s) => s.setDhsIntensity);
  const setTrsreIntensity = useScrollStore((s) => s.setTrsreIntensity);
  const setDoorlyIntensity = useScrollStore((s) => s.setDoorlyIntensity);
  const setActiveBusinesses = useScrollStore((s) => s.setActiveBusinesses);
  const prologueHomeNonce = useScrollStore((s) => s.prologueHomeNonce);

  const [stage, setStage] = useState<Stage>("loading");
  const [progress, setProgress] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [starting, setStarting] = useState(false);
  /** -1…1 scroll charge for the side meter (sign = direction). */
  const [slideCharge, setSlideCharge] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const finishedLoad = useRef(false);
  const stepRef = useRef(0);
  const busyRef = useRef(false);
  const chargeRef = useRef(0);
  const chargeRaf = useRef(0);
  /** When set, story stage opens on this card instead of resetting to 0. */
  const entryStepRef = useRef<number | null>(null);
  const resumeFadeRef = useRef(false);
  const returningRef = useRef(false);
  const introTweenRef = useRef<gsap.core.Tween | null>(null);

  const resetCharge = useCallback(() => {
    chargeRef.current = 0;
    setSlideCharge(0);
  }, []);

  const syncChargeUi = useCallback(() => {
    if (chargeRaf.current) return;
    chargeRaf.current = requestAnimationFrame(() => {
      chargeRaf.current = 0;
      setSlideCharge(Math.max(-1, Math.min(1, chargeRef.current)));
    });
  }, []);

  useEffect(() => {
    if (stage === "done" || stage === "exiting") return;
    setSceneMode("cover");
    setCoverReveal(0);
    setAttentionMode("cinematic");
  }, [stage, setAttentionMode, setCoverReveal, setSceneMode]);

  useEffect(() => {
    if (stage === "done") return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (stage !== "exiting") window.scrollTo(0, 0);
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, [stage]);

  const assetsReadyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    // iPhone: skip tower preload — loading all GLBs during intro OOMs Safari.
    if (isMobileUiViewport()) {
      assetsReadyRef.current = true;
      return;
    }

    const paths = [
      sceneAssets.manchester,
      ...new Set(
        Object.values(sceneAssets.renaker).filter(Boolean) as string[],
      ),
    ];

    Promise.all(
      paths.map((url) =>
        Promise.resolve(useGLTF.preload(url) as unknown as Promise<unknown>).catch(
          () => null,
        ),
      ),
    ).then(() => {
      if (!cancelled) assetsReadyRef.current = true;
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (stage !== "loading") return;

    if (reduced) {
      setProgress(100);
      const t = window.setTimeout(() => {
        setLoaderDone(true);
        setStage("orientation");
      }, 500);
      return () => window.clearTimeout(t);
    }

    const mobile = isMobileUiViewport();
    let raf = 0;
    let settleTimer = 0;
    const start = performance.now();
    const minDuration = mobile ? 1800 : 3400;
    const hardTimeout = mobile ? 6000 : 14000;

    const tick = (now: number) => {
      if (finishedLoad.current) return;
      const elapsed = now - start;
      const timeProgress = Math.min(1, elapsed / minDuration);
      const cityReady =
        modelRef.current === "ready" || modelRef.current === "fallback";
      // Mobile defers WebGL — don't wait on city/GLB readiness to leave the loader.
      const ready = mobile
        ? assetsReadyRef.current
        : cityReady && assetsReadyRef.current;

      let p = Math.floor(timeProgress * (ready ? 100 : 88));
      if (ready && timeProgress >= 1) p = 100;
      if (elapsed > hardTimeout) p = 100;

      setProgress(p);
      setPhraseIndex(
        Math.min(
          prologueLoadingPhrases.length - 1,
          Math.floor((p / 100) * prologueLoadingPhrases.length),
        ),
      );

      if (p >= 100) {
        finishedLoad.current = true;
        settleTimer = window.setTimeout(() => {
          setLoaderDone(true);
          setStage("orientation");
        }, mobile ? 200 : 700);
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settleTimer);
    };
  }, [reduced, setLoaderDone, stage]);

  useEffect(() => {
    if (stage !== "orientation") return;
    chargeRef.current = 0;
    setSlideCharge(0);

    const advance = () => {
      chargeRef.current = 0;
      setSlideCharge(0);
      setStage("story");
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY <= 0) {
        chargeRef.current = Math.max(0, chargeRef.current + e.deltaY / STEP_DELTA_THRESHOLD);
        syncChargeUi();
        return;
      }
      chargeRef.current += e.deltaY / STEP_DELTA_THRESHOLD;
      if (chargeRef.current >= 1) {
        advance();
        return;
      }
      syncChargeUi();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        chargeRef.current = Math.min(1, chargeRef.current + KEY_CHARGE);
        if (chargeRef.current >= 1) advance();
        else syncChargeUi();
      }
    };

    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const y = e.touches[0]?.clientY ?? touchY;
      const delta = touchY - y;
      touchY = y;
      if (delta <= 0) {
        chargeRef.current = Math.max(0, chargeRef.current + delta / TOUCH_DELTA_THRESHOLD);
        syncChargeUi();
        return;
      }
      chargeRef.current += delta / TOUCH_DELTA_THRESHOLD;
      if (chargeRef.current >= 1) {
        advance();
        return;
      }
      syncChargeUi();
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
      if (chargeRaf.current) cancelAnimationFrame(chargeRaf.current);
    };
  }, [stage, syncChargeUi]);

  const returnToOrientation = useCallback(() => {
    if (busyRef.current) return;
    const panel = panelRef.current;

    const finish = () => {
      busyRef.current = false;
      stepRef.current = 0;
      setStep(0);
      resetCharge();
      setStage("orientation");
    };

    if (reduced || !panel) {
      finish();
      return;
    }

    busyRef.current = true;
    gsap.to(panel, {
      y: 18,
      autoAlpha: 0,
      duration: 0.22,
      ease: "power2.in",
      overwrite: true,
      onComplete: finish,
    });
  }, [reduced, resetCharge]);

  const goToStep = useCallback(
    (next: number) => {
      if (next < 0) {
        returnToOrientation();
        return;
      }
      if (next >= STORY_STEPS) return;
      if (next === stepRef.current) return;
      if (busyRef.current) return;

      resetCharge();
      const panel = panelRef.current;
      const dir = next > stepRef.current ? 1 : -1;

      if (reduced || !panel) {
        stepRef.current = next;
        setStep(next);
        return;
      }

      busyRef.current = true;

      // Short clipped swap — keep it cheap so the HTML intro stays smooth.
      gsap.to(panel, {
        y: dir > 0 ? -18 : 18,
        autoAlpha: 0,
        duration: 0.2,
        ease: "power2.in",
        overwrite: true,
        onComplete: () => {
          stepRef.current = next;
          setStep(next);
          gsap.set(panel, { y: dir > 0 ? 18 : -18, autoAlpha: 0 });
          gsap.to(panel, {
            y: 0,
            autoAlpha: 1,
            duration: 0.24,
            ease: "power2.out",
            overwrite: true,
            onComplete: () => {
              busyRef.current = false;
              resetCharge();
            },
          });
        },
      });
    },
    [reduced, resetCharge, returnToOrientation],
  );

  // Accumulate scroll into a meter; full meter → next / empty + scroll up → previous.
  useEffect(() => {
    if (stage !== "story") return;

    if (entryStepRef.current != null) {
      const entry = entryStepRef.current;
      entryStepRef.current = null;
      stepRef.current = entry;
      setStep(entry);
    } else {
      stepRef.current = 0;
      setStep(0);
    }

    busyRef.current = false;
    resetCharge();
    if (panelRef.current) {
      gsap.set(panelRef.current, { y: 0, autoAlpha: 1 });
    }

    const applyCharge = (delta: number) => {
      if (busyRef.current) return;

      // Last slide: only allow scrolling back (CTA starts the demo)
      if (stepRef.current >= AIYLA_STEP && delta > 0) {
        chargeRef.current = Math.max(-1, Math.min(0, chargeRef.current));
        syncChargeUi();
        return;
      }

      // Charge is -1…1: positive fills toward next, negative toward previous.
      chargeRef.current = Math.max(
        -1,
        Math.min(1, chargeRef.current + delta / STEP_DELTA_THRESHOLD),
      );

      if (chargeRef.current >= 1) {
        const next = stepRef.current + 1;
        if (next >= STORY_STEPS) {
          chargeRef.current = 1;
          syncChargeUi();
          return;
        }
        goToStep(next);
        return;
      }

      if (chargeRef.current <= -1) {
        goToStep(stepRef.current - 1);
        return;
      }

      syncChargeUi();
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 1) return;
      applyCharge(e.deltaY);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        applyCharge(STEP_DELTA_THRESHOLD * KEY_CHARGE);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        applyCharge(-STEP_DELTA_THRESHOLD * KEY_CHARGE);
      }
    };

    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const y = e.touches[0]?.clientY ?? touchY;
      const delta = touchY - y;
      touchY = y;
      if (Math.abs(delta) < 1) return;
      // Convert px → wheel-equivalent charge units
      applyCharge((delta / TOUCH_DELTA_THRESHOLD) * STEP_DELTA_THRESHOLD);
    };

    const root = rootRef.current;
    root?.addEventListener("wheel", onWheel, { passive: false });
    root?.addEventListener("touchstart", onTouchStart, { passive: true });
    root?.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      root?.removeEventListener("wheel", onWheel);
      root?.removeEventListener("touchstart", onTouchStart);
      root?.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      if (chargeRaf.current) cancelAnimationFrame(chargeRaf.current);
    };
  }, [goToStep, resetCharge, stage, syncChargeUi]);

  const openPrologueAtStart = useCallback(() => {
    introTweenRef.current?.kill();
    introTweenRef.current = null;
    window.scrollTo(0, 0);
    setCoverReveal(0);
    setSceneMode("cover");
    setAttentionMode("cinematic");
    setActiveDevelopment(null);
    setEstateBuildingProgress(0);
    setDemoIntroLock(false);
    setScrollCueVisible(false);
    setStarting(false);
    entryStepRef.current = AIYLA_STEP;
    resumeFadeRef.current = true;
    setExperienceStarted(false);
    setStage("story");
  }, [
    setActiveDevelopment,
    setAttentionMode,
    setCoverReveal,
    setDemoIntroLock,
    setEstateBuildingProgress,
    setExperienceStarted,
    setSceneMode,
    setScrollCueVisible,
  ]);

  /** First landing page — orientation after load, before ambition cards. */
  const openPrologueLanding = useCallback(() => {
    introTweenRef.current?.kill();
    introTweenRef.current = null;
    busyRef.current = false;
    returningRef.current = false;
    window.scrollTo(0, 0);
    setCoverReveal(0);
    setSceneMode("cover");
    setAttentionMode("cinematic");
    setActiveDevelopment(null);
    setEstateBuildingProgress(0);
    setDemoIntroLock(false);
    setScrollCueVisible(false);
    setStarting(false);
    setTowerTourStepped(false);
    setStoryBridge("none");
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
    setDhsIntensity(0);
    setTrsreIntensity(0);
    setDoorlyIntensity(0);
    setActiveBusinesses([]);
    setCityAwake(0);
    setSection("loader", 0);
    entryStepRef.current = null;
    stepRef.current = 0;
    setStep(0);
    resetCharge();
    resumeFadeRef.current = true;
    setExperienceStarted(false);
    setStage("orientation");
  }, [
    resetCharge,
    setActiveBusinesses,
    setActiveDevelopment,
    setAttentionMode,
    setCityAwake,
    setCoverReveal,
    setDemoIntroLock,
    setDoorlyIntensity,
    setDhsIntensity,
    setEstateBuildingProgress,
    setExperienceStarted,
    setSceneMode,
    setScrollCueVisible,
    setSection,
    setStoryBridge,
    setTowerJourney,
    setTowerTourStepped,
    setTrsreIntensity,
  ]);

  /** Smoothly settle the demo runway, then snap back onto the last welcome card. */
  const resumePrologue = useCallback(() => {
    if (returningRef.current || stage !== "done") return;
    returningRef.current = true;

    const coverReveal = useScrollStore.getState().coverReveal;
    const scrollY = window.scrollY;

    const open = () => {
      openPrologueAtStart();
    };

    if (reduced || (scrollY < 8 && coverReveal < 0.04)) {
      open();
      return;
    }

    const proxy = { y: scrollY, r: coverReveal };
    gsap.to(proxy, {
      y: 0,
      r: 0,
      duration: Math.min(1.2, 0.45 + scrollY / 2800 + coverReveal * 0.4),
      ease: "power2.inOut",
      overwrite: true,
      onUpdate: () => {
        window.scrollTo(0, proxy.y);
        setCoverReveal(proxy.r);
      },
      onComplete: open,
    });
  }, [openPrologueAtStart, reduced, setCoverReveal, stage]);

  /** Logo home — return to the first landing from anywhere in the demo/prologue. */
  const goHomeToLanding = useCallback(() => {
    if (stage === "loading" || stage === "exiting") return;
    if (stage === "orientation") {
      window.scrollTo(0, 0);
      return;
    }

    if (returningRef.current) return;
    returningRef.current = true;

    const coverReveal = useScrollStore.getState().coverReveal;
    const scrollY = window.scrollY;
    const fromDemo = stage === "done";

    const open = () => {
      openPrologueLanding();
    };

    if (!fromDemo || reduced || (scrollY < 8 && coverReveal < 0.04)) {
      open();
      return;
    }

    const proxy = { y: scrollY, r: coverReveal };
    gsap.to(proxy, {
      y: 0,
      r: 0,
      duration: Math.min(1.2, 0.45 + scrollY / 2800 + coverReveal * 0.4),
      ease: "power2.inOut",
      overwrite: true,
      onUpdate: () => {
        window.scrollTo(0, proxy.y);
        setCoverReveal(proxy.r);
      },
      onComplete: open,
    });
  }, [openPrologueLanding, reduced, setCoverReveal, stage]);

  const homeNonceSeen = useRef(0);
  useEffect(() => {
    if (prologueHomeNonce === 0) return;
    if (prologueHomeNonce === homeNonceSeen.current) return;
    homeNonceSeen.current = prologueHomeNonce;
    goHomeToLanding();
  }, [goHomeToLanding, prologueHomeNonce]);

  // After the demo is running: at the top of the cover, scroll/key up returns to welcome.
  useEffect(() => {
    if (stage !== "done") return;

    let wheelLock = 0;
    // Don't re-open on the same frame as handoff — wait until they've entered the runway.
    let armed = false;

    const unsub = useScrollStore.subscribe((s) => {
      if (s.coverReveal > 0.2 || window.scrollY > 80) armed = true;
    });

    const atWelcomeGate = () => {
      const { coverReveal, experienceStarted } = useScrollStore.getState();
      return (
        armed &&
        experienceStarted &&
        window.scrollY < 20 &&
        coverReveal < 0.12
      );
    };

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY >= -6) return;
      if (!atWelcomeGate() || returningRef.current) return;
      e.preventDefault();
      const now = performance.now();
      if (now < wheelLock) return;
      wheelLock = now + 700;
      resumePrologue();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowUp" && e.key !== "PageUp" && e.key !== "Home") return;
      if (!atWelcomeGate() || returningRef.current) return;
      e.preventDefault();
      resumePrologue();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      unsub();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [resumePrologue, stage]);

  // Fade welcome back in after a demo → prologue return.
  useLayoutEffect(() => {
    if (
      (stage !== "story" && stage !== "orientation") ||
      !resumeFadeRef.current
    ) {
      return;
    }
    resumeFadeRef.current = false;
    const root = rootRef.current;

    if (reduced || !root) {
      returningRef.current = false;
      return;
    }

    gsap.fromTo(
      root,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: 0.85,
        ease: "power2.out",
        overwrite: true,
        onComplete: () => {
          returningRef.current = false;
        },
      },
    );
  }, [reduced, stage]);

  const cityScrollTarget = useCallback(() => {
    const cover = document.getElementById("section-cover");
    const range = Math.max(1, cover?.offsetHeight ?? window.innerHeight * 2);
    const p = prologueStart.introCoverProgress;
    return {
      p,
      targetY: (cover?.offsetTop ?? 0) + range * p,
      targetReveal: Math.min(1, p * 1.15),
    };
  }, []);

  /** Instant land on the city frame (used when returning from demo). */
  const openAtCityView = useCallback(() => {
    introTweenRef.current?.kill();
    introTweenRef.current = null;

    const { p, targetY, targetReveal } = cityScrollTarget();
    window.scrollTo({ top: targetY, left: 0, behavior: "auto" });
    setSection("cover", p);
    setCoverReveal(targetReveal);
    setSceneMode("reveal");
    setCityAwake(p * 0.55);
    setAttentionMode("cinematic");
    setActiveDevelopment(null);
    setEstateBuildingProgress(0);
    setDemoIntroLock(false);
    setScrollCueVisible(true);
    requestCameraSnap();
  }, [
    cityScrollTarget,
    requestCameraSnap,
    setActiveDevelopment,
    setAttentionMode,
    setCityAwake,
    setCoverReveal,
    setDemoIntroLock,
    setEstateBuildingProgress,
    setSceneMode,
    setScrollCueVisible,
    setSection,
  ]);

  /**
   * Start handoff: camera already on the city frame, veil fades from black,
   * with a very slight forward drift — no fly-in from elsewhere.
   */
  const wakeIntoCityView = useCallback(() => {
    introTweenRef.current?.kill();
    introTweenRef.current = null;

    const { p, targetY, targetReveal } = cityScrollTarget();
    const startProgress = Math.max(0.12, p - 0.045);

    window.scrollTo({ top: targetY, left: 0, behavior: "auto" });
    setSection("cover", startProgress);
    setCoverReveal(0);
    setSceneMode("reveal");
    setCityAwake(0);
    setAttentionMode("cinematic");
    setActiveDevelopment(null);
    setEstateBuildingProgress(0);
    setDemoIntroLock(true);
    setScrollCueVisible(false);
    requestCameraSnap();

    if (reduced) {
      setSection("cover", p);
      setCoverReveal(targetReveal);
      setCityAwake(p * 0.55);
      setDemoIntroLock(false);
      setScrollCueVisible(true);
      return;
    }

    const proxy = { reveal: 0, progress: startProgress, awake: 0 };
    introTweenRef.current = gsap.to(proxy, {
      reveal: targetReveal,
      progress: p,
      awake: p * 0.55,
      duration: 1.7,
      ease: "power2.out",
      overwrite: true,
      onUpdate: () => {
        setCoverReveal(proxy.reveal);
        setSection("cover", proxy.progress);
        setCityAwake(proxy.awake);
      },
      onComplete: () => {
        introTweenRef.current = null;
        window.scrollTo({ top: targetY, left: 0, behavior: "auto" });
        setDemoIntroLock(false);
        setScrollCueVisible(true);
      },
    });
  }, [
    cityScrollTarget,
    reduced,
    requestCameraSnap,
    setActiveDevelopment,
    setAttentionMode,
    setCityAwake,
    setCoverReveal,
    setDemoIntroLock,
    setEstateBuildingProgress,
    setSceneMode,
    setScrollCueVisible,
    setSection,
  ]);

  const startExperience = useCallback(() => {
    if (starting || stage === "exiting" || stage === "done") return;
    setStarting(true);
    setStage("exiting");
    setAttentionMode("cinematic");
    // Place camera on the city frame first, then wake the lights/veil.
    wakeIntoCityView();
    setExperienceStarted(true);
    requestCameraSnap();

    const root = rootRef.current;
    const finish = () => {
      setStage("done");
      returningRef.current = false;
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        // Keep the wake-in tween running — only re-pin scroll, don't hard-cut again.
        const { targetY } = cityScrollTarget();
        window.scrollTo({ top: targetY, left: 0, behavior: "auto" });
      });
    };

    if (reduced || !root) {
      finish();
      return;
    }

    gsap.to(root, {
      autoAlpha: 0,
      duration: 0.55,
      ease: "power2.out",
      onComplete: finish,
    });
  }, [
    cityScrollTarget,
    reduced,
    requestCameraSnap,
    setAttentionMode,
    setExperienceStarted,
    stage,
    starting,
    wakeIntoCityView,
  ]);

  // Hold scroll while the start veil / wake-in is running.
  useEffect(() => {
    if (stage !== "done" && stage !== "exiting") return;

    const block = (e: Event) => {
      if (!useScrollStore.getState().demoIntroLock) return;
      e.preventDefault();
    };

    window.addEventListener("wheel", block, { passive: false });
    window.addEventListener("touchmove", block, { passive: false });
    return () => {
      window.removeEventListener("wheel", block);
      window.removeEventListener("touchmove", block);
    };
  }, [stage]);

  if (stage === "done") return null;

  const ambition =
    step < prologueAmbitions.length ? prologueAmbitions[step] : null;
  const showAiyla = step === AIYLA_STEP;

  return (
    <div
      ref={rootRef}
      className={`prologue ${stage === "exiting" ? "prologue--exiting" : ""}`}
      aria-label="Renaker Life introduction"
    >
      <div className="prologue__veil" aria-hidden />
      <div className="prologue__grid grid-lines" aria-hidden />

      {stage === "loading" && (
        <div
          className="prologue__stage prologue__stage--center"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="prologue__brand-block">
            <RenakerLifeLogo
              variant="light"
              priority
              className="prologue__logo"
            />
            <h1 className="sr-only">Renaker Life</h1>
          </div>
          <p className="mt-10 text-sm tabular-nums tracking-wide text-stone/55">
            {progress}%
          </p>
          <div className="prologue__progress">
            <div
              className="prologue__progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-6 text-sm text-stone/50">
            {prologueLoadingPhrases[phraseIndex]}
          </p>
        </div>
      )}

      {(stage === "orientation" || stage === "story") && (
        <div
          className={`prologue__scroll-meter ${
            Math.abs(slideCharge) > 0.02 ? "is-active" : ""
          } ${slideCharge < 0 ? "is-back" : ""}`}
          aria-hidden
        >
          <span className="prologue__scroll-meter__label">
            {slideCharge < -0.02 ? "Back" : "Next"}
          </span>
          <div className="prologue__scroll-meter__track">
            <div
              className="prologue__scroll-meter__fill"
              style={{ height: `${Math.abs(slideCharge) * 100}%` }}
            />
          </div>
        </div>
      )}

      {stage === "orientation" && (
        <div className="prologue__stage prologue__stage--orient prologue__fade-in">
          <div className="prologue__brand-block prologue__brand-block--left">
            <RenakerLifeLogo variant="light" className="prologue__logo" />
          </div>

          <div className="prologue__orient">
            <div className="prologue__orient-copy">
              <h2 className="prologue__orient-title">
                {prologueOrientation.headline}
              </h2>
              <p className="prologue__support mt-7">
                {prologueOrientation.body}
              </p>
              <button
                type="button"
                className="prologue__ghost-cta mt-12"
                onClick={() => setStage("story")}
              >
                <span className="prologue__continue--desktop">
                  {prologueOrientation.continueHint}
                </span>
                <span className="prologue__continue--mobile">
                  Swipe up or tap to continue
                </span>
              </button>
            </div>

            <ul className="prologue__orient-stats" aria-label="Scale">
              {prologueOrientation.stats.map((stat) => (
                <li
                  key={stat.label}
                  className={
                    stat.label === "AI Tasks Complete"
                      ? "prologue__orient-stat--glow"
                      : undefined
                  }
                >
                  <p className="prologue__orient-value">{stat.value}</p>
                  <p className="prologue__orient-label">{stat.label}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {(stage === "story" || stage === "exiting") && (
        <div ref={stageRef} className="prologue__fixed-stage">
          <div className="prologue__rail" aria-hidden>
            {prologueAmbitions.map((a, i) => (
              <span key={a.id} className={step === i ? "is-active" : undefined}>
                {a.shortLabel}
              </span>
            ))}
          </div>

          <div className="prologue__swap">
            <div ref={panelRef} className="prologue__swap-panel">
              {ambition && (
                <div className="prologue__ambition-block">
                  <p className="prologue__chapter">
                    {ambition.index} / {ambition.label}
                  </p>
                  <article className="prologue__ambition">
                    <div className="prologue__box prologue__box--copy">
                      <div className="prologue__copy-main">
                        <h3 className="prologue__headline">
                          {ambition.headline}
                        </h3>
                        <p className="prologue__body mt-5">{ambition.body}</p>
                        {ambition.result ? (
                          <div className="prologue__result">
                            <span className="prologue__result-dot" aria-hidden />
                            <div className="prologue__result-copy">
                              <p className="prologue__result-title">
                                {ambition.result.title}
                              </p>
                              <p className="prologue__result-body">
                                {ambition.result.body}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <ul className="prologue__tags">
                            {ambition.tags.map((tag) => (
                              <li key={tag}>{tag}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <ul className="prologue__pills" aria-label="Surfaces">
                        {prologueSurfaces.map((surface) => (
                          <li key={surface}>{surface}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="prologue__box prologue__box--visual">
                      <AmbitionVisual id={ambition.id} active />
                    </div>
                  </article>
                </div>
              )}

              {showAiyla && (
                <div className="prologue__finale">
                  <div className="prologue__box prologue__box--finale-brand">
                    <div className="prologue__finale-brand">
                      <div className="prologue__brand-block prologue__brand-block--finale">
                        <RenakerLifeLogo
                          variant="light"
                          className="prologue__logo"
                        />
                      </div>
                      <p className="prologue__powered">{prologueAiyla.poweredBy}</p>
                      <p className="prologue__support mt-5">
                        {prologueAiyla.body}
                      </p>
                    </div>
                  </div>

                  <div className="prologue__finale-cta">
                    <h3 className="prologue__display">
                      {prologueStart.headline}
                    </h3>
                    <p className="prologue__finale-prompt">
                      {prologueStart.prompt}
                    </p>
                    <p className="prologue__support mt-3">
                      {prologueStart.supporting}
                    </p>
                    <button
                      type="button"
                      className={`prologue__cta prologue__cta--pulse mt-10 ${starting ? "is-active" : ""}`}
                      onClick={startExperience}
                      disabled={starting}
                    >
                      {prologueStart.cta}
                      <span aria-hidden> →</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="prologue__step-hint" aria-hidden>
            {step < AIYLA_STEP ? (
              <>
                <span className="prologue__continue--desktop">
                  Scroll to continue
                </span>
                <span className="prologue__continue--mobile">Swipe up</span>
              </>
            ) : (
              "Ready"
            )}
          </p>
        </div>
      )}
    </div>
  );
}
