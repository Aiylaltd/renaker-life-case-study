"use client";

import { useScrollStore } from "@/store/scrollStore";

/**
 * Thin dark dissolve over the existing V1 cover runway.
 * Shown only after the prologue hands off — no brand deck (already covered).
 */
export function CoverVeil() {
  const experienceStarted = useScrollStore((s) => s.experienceStarted);
  const coverReveal = useScrollStore((s) => s.coverReveal);

  if (!experienceStarted) return null;

  const opacity = Math.max(0, 1 - coverReveal * 1.35);
  const dismissed = coverReveal > 0.82;

  return (
    <div
      className={`cover-veil ${dismissed ? "is-done" : ""}`}
      style={{ opacity }}
      aria-hidden
    >
      <div className="loader-cover-veil" />
      <div
        className="loader-cover-grid grid-lines"
        style={{ opacity: 0.18 }}
      />
    </div>
  );
}
