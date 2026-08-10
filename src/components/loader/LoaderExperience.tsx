"use client";

import { useEffect, useRef, useState } from "react";
import {
  brand,
  cover,
  loaderComplete,
  loaderHumourIndices,
  loaderMessages,
} from "@/config/caseStudy";
import { useScrollStore } from "@/store/scrollStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Dark Renaker Life case-study cover + integrated loading.
 * City renders behind; this is a translucent charcoal brand layer.
 */
export function LoaderExperience() {
  const modelLoadingState = useScrollStore((s) => s.modelLoadingState);
  const modelRef = useRef(modelLoadingState);
  modelRef.current = modelLoadingState;

  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [phase, setPhase] = useState<"loading" | "welcome" | "done">("loading");
  const setLoaderDone = useScrollStore((s) => s.setLoaderDone);
  const setSceneMode = useScrollStore((s) => s.setSceneMode);
  const setCoverReveal = useScrollStore((s) => s.setCoverReveal);
  const reduced = useReducedMotion();
  const finished = useRef(false);

  useEffect(() => {
    setSceneMode("cover");
    setCoverReveal(reduced ? 0.15 : 0);
  }, [reduced, setCoverReveal, setSceneMode]);

  useEffect(() => {
    if (reduced) {
      setProgress(100);
      setPhase("welcome");
      const t = window.setTimeout(() => {
        setPhase("done");
        setLoaderDone(true);
        setSceneMode("cover");
      }, 400);
      return () => window.clearTimeout(t);
    }

    let raf = 0;
    const start = performance.now();
    const minDuration = 3200;
    const hardTimeout = 14000;

    const tick = (now: number) => {
      if (finished.current) return;

      const elapsed = now - start;
      const timeProgress = Math.min(1, elapsed / minDuration);
      const ready =
        modelRef.current === "ready" || modelRef.current === "fallback";

      let p = Math.floor(timeProgress * (ready ? 100 : 90));
      if (ready && timeProgress >= 1) p = 100;
      if (elapsed > hardTimeout) p = 100;

      setProgress(p);
      setMsgIndex(
        Math.min(
          loaderMessages.length - 1,
          Math.floor((p / 100) * loaderMessages.length),
        ),
      );

      if (p >= 100) {
        finished.current = true;
        setPhase("welcome");
        window.setTimeout(() => {
          setPhase("done");
          setLoaderDone(true);
          setSceneMode("cover");
        }, 1100);
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, setLoaderDone, setSceneMode]);

  const humorous = loaderHumourIndices.includes(msgIndex);
  const coverReveal = useScrollStore((s) => s.coverReveal);
  // Stay on screen through the dark cover; dissolve during reveal scroll
  const veilOpacity = Math.max(0, 1 - coverReveal * 1.35);
  const copyOpacity = Math.max(0, 1 - coverReveal * 1.8);
  const dismissed = phase === "done" && coverReveal > 0.85;

  return (
    <div
      className={`loader-screen loader-screen--cover ${dismissed ? "is-done" : ""}`}
      style={{ pointerEvents: phase === "done" ? "none" : "auto" }}
      role="status"
      aria-live="polite"
      aria-busy={phase === "loading"}
    >
      <div
        className="loader-cover-veil"
        aria-hidden
        style={{ opacity: veilOpacity }}
      />
      <div
        className="container-narrow relative z-[1] px-6 text-center"
        style={{ opacity: copyOpacity }}
      >
        <p className="text-label tracking-[0.22em] text-stone/55">
          {cover.eyebrow}
        </p>
        <h1 className="mt-5 text-display text-stone">{cover.title}</h1>
        <p className="mx-auto mt-6 max-w-xl text-subhead text-stone/70">
          {cover.supporting}
        </p>
        <p className="mt-4 text-sm tracking-wide text-stone/45">
          {cover.poweredBy}
        </p>

        {phase === "loading" && (
          <>
            <div className="mx-auto mt-12 h-[2px] w-48 overflow-hidden rounded-full bg-stone/15">
              <div
                className="h-full bg-accent transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p
              className={`mt-7 text-sm ${
                humorous ? "text-stone/45" : "text-stone/60"
              }`}
            >
              {loaderMessages[msgIndex]}
            </p>
            <p className="mt-2 text-xs text-stone/35 tabular-nums">
              {progress}%
            </p>
          </>
        )}

        {phase === "welcome" && (
          <p className="mt-12 text-2xl font-medium tracking-tight text-stone animate-[dev-card-enter_1s_var(--ease-premium)_both]">
            {loaderComplete.welcome}
          </p>
        )}

        {phase === "done" && (
          <p className="mt-14 text-xs tracking-[0.2em] uppercase text-stone/40">
            {cover.scrollHint}
          </p>
        )}

        <p className="sr-only">{brand.product}</p>
      </div>
    </div>
  );
}
