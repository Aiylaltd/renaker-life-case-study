"use client";

import { useEffect, useState } from "react";
import { dhsVisionPrompts } from "@/config/dhsWalkthrough";

/**
 * Beat 4 — wide centered panel: query feed + Digital High Street pitch.
 */
export function DhsVisionSearchCard({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) {
      setStep(0);
      return;
    }

    setStep(0);

    const timers = dhsVisionPrompts.map((_, i) =>
      window.setTimeout(() => setStep(i + 1), 550 + i * 750),
    );

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [active]);

  if (!active) return null;

  return (
    <div
      className="dhs-beat-copy--panel dhs-vision-card"
      aria-live="polite"
    >
      <div className="dhs-vision-card__grid">
        <div className="dhs-vision-card__pitch">
          <p className="text-label text-muted-dark">The Digital High Street</p>
          <h2 className="dhs-vision-card__pitch-label mt-3 text-headline editorial-type">
            The best of Manchester at resident fingertips
          </h2>
          <p className="dhs-vision-card__pitch-body">
            Resident AI concierge guiding through your local area offerings.
          </p>
        </div>

        <div className="dhs-vision-card__feed">
          <div className="dhs-vision-card__input">
            <ul className="dhs-vision-card__list">
              {dhsVisionPrompts.map((item, i) => {
                const visible = step > i;
                return (
                  <li
                    key={item.id}
                    className={`dhs-vision-card__row ${
                      visible ? "is-visible" : ""
                    }`}
                  >
                    <p className="dhs-vision-card__prompt">
                      “{item.prompt}”
                    </p>
                    <p className="dhs-vision-card__result">
                      <span>{item.resultName}</span>
                      <span>{item.distance}</span>
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
