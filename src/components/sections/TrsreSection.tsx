"use client";

import { trsreCopy, trsreImages, trsrePins } from "@/config/trsre";
import { trsreProof } from "@/config/metrics";
import { useScrollStore } from "@/store/scrollStore";

const BEATS = 3;

/** Same even scroll-lock as Digital High Street. */
function lockedBeat(progress: number, beats: number) {
  const p = Math.max(0, Math.min(0.999, progress));
  const scaled = p * beats;
  const i = Math.min(beats - 1, Math.floor(scaled));
  return { index: i, local: scaled - i };
}

export function TrsreSection() {
  const progress = useScrollStore((s) =>
    s.sectionId === "trsre" ? s.sectionProgress : 0,
  );

  const { index: beat } = lockedBeat(progress, BEATS);

  return (
    <section
      id="section-trsre"
      className="story-section--pin story-section--trsre"
      aria-labelledby="trsre-heading"
    >
      <div className="city-scroll-stage">
        <div className="container-wide city-scroll-layout">
          <div className="city-scroll-copy">
            {beat === 0 && (
              <article className="city-scroll-card city-scroll-card--enter">
                <p className="city-scroll-card__label">TRSRE</p>
                <h2 id="trsre-heading" className="city-scroll-card__title">
                  {trsreCopy.headline}
                </h2>
                <p className="city-scroll-card__body">
                  {trsreCopy.supporting}
                </p>
                <div className="trsre-pin-legend" aria-label="Hunt difficulty">
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
              </article>
            )}

            {beat === 1 && (
              <article className="city-scroll-card city-scroll-card--enter">
                <p className="city-scroll-card__label">Exploration</p>
                <p className="city-scroll-card__metric">{trsreProof.steps}</p>
                <h2 className="city-scroll-card__title city-scroll-card__title--md">
                  {trsreProof.stepsLabel}
                </h2>
                <p className="city-scroll-card__body">{trsreCopy.mapLine}</p>
              </article>
            )}

            {beat === 2 && (
              <article className="city-scroll-card city-scroll-card--enter">
                <p className="city-scroll-card__label">Impact</p>
                <blockquote className="city-scroll-card__quote">
                  “{trsreProof.quote}”
                </blockquote>
                <p className="city-scroll-card__note">{trsreProof.quoteNote}</p>
              </article>
            )}
          </div>

          <div className="city-scroll-media">
            <div className="city-scroll-card city-scroll-card--media city-scroll-card--enter">
              {beat === 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={trsreImages.heroCity}
                  alt="TRSRE hunt layered over Manchester"
                  className="trsre-media__img trsre-media__img--hero"
                />
              ) : null}
              {beat === 1 ? (
                <div className="trsre-media__grid">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={trsreImages.bunny} alt="" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={trsreImages.hunt1} alt="" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={trsreImages.explore} alt="" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={trsreImages.hunt2} alt="" />
                </div>
              ) : null}
              {beat === 2 ? (
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
    </section>
  );
}
