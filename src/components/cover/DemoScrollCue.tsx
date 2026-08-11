"use client";

import { useEffect } from "react";
import { prologueStart } from "@/config/prologue";
import { useScrollStore } from "@/store/scrollStore";

/**
 * Shown after the Start handoff lands on the first city view.
 * Dismisses as soon as the user scrolls onward.
 */
export function DemoScrollCue() {
  const visible = useScrollStore((s) => s.scrollCueVisible);
  const setScrollCueVisible = useScrollStore((s) => s.setScrollCueVisible);

  useEffect(() => {
    if (!visible) return;

    const landingY = window.scrollY;
    const dismiss = () => setScrollCueVisible(false);

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 4) return;
      dismiss();
    };
    const onScroll = () => {
      if (Math.abs(window.scrollY - landingY) > 28) dismiss();
    };
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === "ArrowDown" ||
        e.key === "PageDown" ||
        e.key === " " ||
        e.key === "ArrowUp" ||
        e.key === "PageUp"
      ) {
        dismiss();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, [setScrollCueVisible, visible]);

  if (!visible) return null;

  return (
    <div className="demo-scroll-cue" role="status">
      <span className="demo-scroll-cue__label">{prologueStart.scrollCue}</span>
      <span className="demo-scroll-cue__chevron" aria-hidden />
    </div>
  );
}
