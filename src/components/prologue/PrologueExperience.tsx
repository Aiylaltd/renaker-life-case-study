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

gsap.registerPlugin(ScrollTrigger);

type Stage = "loading" | "orientation" | "story" | "exiting" | "done";

/** Ambitions + Aiyla + Start — all swap inside one fixed stage. */
const STORY_STEPS = prologueAmbitions.length + 2;
const AIYLA_STEP = prologueAmbitions.length;
const START_STEP = prologueAmbitions.length + 1;

/**
 * HTML/CSS prologue above the persistent V1 canvas.
 * Loading → orientation → ambitions → Aiyla → Start → existing cover scroll.
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

  const [stage, setStage] = useState<Stage>("loading");
  const [progress, setProgress] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [starting, setStarting] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const finishedLoad = useRef(false);
  const stepRef = useRef(0);
  const busyRef = useRef(false);
  /** When set, story stage opens on this card instead of resetting to 0. */
  const entryStepRef = useRef<number | null>(null);
  const resumeFadeRef = useRef(false);
  const returningRef = useRef(false);
  const introTweenRef = useRef<gsap.core.Tween | null>(null);

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

  useEffect(() => {
    try {
      useGLTF.preload(sceneAssets.manchester);
      const dgs = sceneAssets.renaker.ANCHOR_DGS;
      const blade = sceneAssets.renaker.ANCHOR_BLADE;
      if (dgs) useGLTF.preload(dgs);
      if (blade) useGLTF.preload(blade);
    } catch {
      /* best-effort */
    }
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

    let raf = 0;
    const start = performance.now();
    const minDuration = 3400;
    const hardTimeout = 14000;

    const tick = (now: number) => {
      if (finishedLoad.current) return;
      const elapsed = now - start;
      const timeProgress = Math.min(1, elapsed / minDuration);
      const ready =
        modelRef.current === "ready" || modelRef.current === "fallback";

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
        setLoaderDone(true);
        window.setTimeout(() => setStage("orientation"), 450);
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, setLoaderDone, stage]);

  useEffect(() => {
    if (stage !== "orientation") return;
    const advance = () => setStage("story");
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 8) advance();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [stage]);

  const returnToOrientation = useCallback(() => {
    if (busyRef.current) return;
    const panel = panelRef.current;

    const finish = () => {
      busyRef.current = false;
      stepRef.current = 0;
      setStep(0);
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
  }, [reduced]);

  const goToStep = useCallback(
    (next: number) => {
      if (next < 0) {
        returnToOrientation();
        return;
      }
      if (next >= STORY_STEPS) return;
      if (next === stepRef.current) return;
      if (busyRef.current) return;

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
        duration: 0.22,
        ease: "power2.in",
        overwrite: true,
        onComplete: () => {
          stepRef.current = next;
          setStep(next);
          gsap.set(panel, { y: dir > 0 ? 18 : -18, autoAlpha: 0 });
          gsap.to(panel, {
            y: 0,
            autoAlpha: 1,
            duration: 0.26,
            ease: "power2.out",
            overwrite: true,
            onComplete: () => {
              busyRef.current = false;
            },
          });
        },
      });
    },
    [reduced, returnToOrientation],
  );

  // Step through cards with wheel / keys — stage stays fixed, no page scroll.
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
    if (panelRef.current) {
      gsap.set(panelRef.current, { y: 0, autoAlpha: 1 });
    }

    let wheelLock = 0;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = performance.now();
      if (now < wheelLock || busyRef.current) return;
      if (Math.abs(e.deltaY) < 6) return;

      wheelLock = now + 380;
      const dir = e.deltaY > 0 ? 1 : -1;
      goToStep(stepRef.current + dir);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        goToStep(stepRef.current + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goToStep(stepRef.current - 1);
      }
    };

    const root = rootRef.current;
    root?.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      root?.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [goToStep, stage]);

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
    entryStepRef.current = START_STEP;
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
    if (stage !== "story" || !resumeFadeRef.current) return;
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

  const flyIntoCityView = useCallback(() => {
    const cover = document.getElementById("section-cover");
    if (!cover) {
      setDemoIntroLock(false);
      setScrollCueVisible(true);
      return;
    }

    // Match cover ScrollTrigger: start "top top" → end "bottom top"
    const range = Math.max(1, cover.offsetHeight);
    const targetY = cover.offsetTop + range * prologueStart.introCoverProgress;

    const revealCue = () => {
      setDemoIntroLock(false);
      setScrollCueVisible(true);
    };

    if (reduced) {
      window.scrollTo(0, targetY);
      ScrollTrigger.refresh();
      revealCue();
      return;
    }

    setDemoIntroLock(true);
    const proxy = { y: window.scrollY };
    introTweenRef.current?.kill();
    introTweenRef.current = gsap.to(proxy, {
      y: targetY,
      duration: 2.4,
      ease: "power2.inOut",
      overwrite: true,
      onUpdate: () => {
        window.scrollTo(0, proxy.y);
      },
      onComplete: () => {
        introTweenRef.current = null;
        revealCue();
      },
    });
  }, [reduced, setDemoIntroLock, setScrollCueVisible]);

  const startExperience = useCallback(() => {
    if (starting || stage === "exiting" || stage === "done") return;
    setStarting(true);
    setStage("exiting");
    setScrollCueVisible(false);
    setDemoIntroLock(true);

    window.scrollTo(0, 0);
    setCoverReveal(0);
    setSceneMode("cover");
    setAttentionMode("cinematic");
    setExperienceStarted(true);

    const root = rootRef.current;
    const finish = () => {
      setStage("done");
      returningRef.current = false;
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        requestAnimationFrame(() => flyIntoCityView());
      });
    };

    if (reduced || !root) {
      finish();
      return;
    }

    gsap.to(root, {
      autoAlpha: 0,
      duration: 0.9,
      ease: "power2.inOut",
      onComplete: finish,
    });
  }, [
    flyIntoCityView,
    reduced,
    setAttentionMode,
    setCoverReveal,
    setDemoIntroLock,
    setExperienceStarted,
    setSceneMode,
    setScrollCueVisible,
    stage,
    starting,
  ]);

  // Block user scroll while the Start handoff flies into the city frame.
  useEffect(() => {
    if (stage !== "done") return;

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
  const showStart = step === START_STEP;

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
                {prologueOrientation.continueHint}
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
                        <ul className="prologue__tags">
                          {ambition.tags.map((tag) => (
                            <li key={tag}>{tag}</li>
                          ))}
                        </ul>
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
                <div className="prologue__box prologue__box--wide">
                  <p className="prologue__eyebrow">{prologueAiyla.eyebrow}</p>
                  <h3 className="prologue__display mt-4 text-accent">
                    {prologueAiyla.headline}
                  </h3>
                  <p className="prologue__support mt-6 max-w-2xl">
                    {prologueAiyla.body}
                  </p>
                  <ul className="prologue__tags mt-10">
                    {prologueAiyla.capabilities.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                  <div className="prologue__link-line" aria-hidden />
                </div>
              )}

              {showStart && (
                <div className="prologue__start-panel">
                  <div className="prologue__brand-block">
                    <RenakerLifeLogo
                      variant="light"
                      className="prologue__logo"
                    />
                  </div>
                  <h3 className="prologue__display mt-10">
                    {prologueStart.headline}
                  </h3>
                  <p className="prologue__support mt-5">
                    {prologueStart.supporting}
                  </p>
                  <button
                    type="button"
                    className={`prologue__cta mt-12 ${starting ? "is-active" : ""}`}
                    onClick={startExperience}
                    disabled={starting}
                  >
                    {prologueStart.cta}
                    <span aria-hidden> →</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="prologue__step-hint" aria-hidden>
            {step < START_STEP ? "Scroll" : "Ready"}
          </p>
        </div>
      )}
    </div>
  );
}
