"use client";

import { sections } from "@/config/caseStudy";
import { useScrollStore } from "@/store/scrollStore";

/**
 * Holds after Management, before the city drop —
 * same placement shell as “Seven developments”.
 */
export function BeyondBridgeOverlay() {
  const visible = useScrollStore((s) => s.storyBridge === "beyond");

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[19] flex items-end pb-[12vh] md:items-center md:pb-0 ${
        visible ? "" : "invisible"
      }`}
      aria-hidden={!visible}
    >
      <div className="container-wide w-full">
        {visible ? (
          <div>
            <h2 className="max-w-3xl text-display editorial-type">
              {sections.beyond.headline}
            </h2>
            <p className="mt-5 max-w-xl text-subhead text-ink/70">
              {sections.beyond.supporting}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
