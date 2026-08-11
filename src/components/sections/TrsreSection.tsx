"use client";

import { trsreCopy, trsreImages, trsrePins } from "@/config/trsre";
import { trsreProof } from "@/config/metrics";
import { useScrollStore } from "@/store/scrollStore";

export function TrsreSection() {
  const progress = useScrollStore((s) =>
    s.sectionId === "trsre" ? s.sectionProgress : 0,
  );

  return (
    <section
      id="section-trsre"
      className="story-section--pin story-section--trsre"
      aria-labelledby="trsre-heading"
    >
      <div className="sticky top-0 flex min-h-[100svh] items-start py-[12vh]">
        <div className="container-wide grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="max-w-xl">
            {progress < 0.34 && (
              <div>
                <p className="text-label text-muted-dark">TRSRE</p>
                <h2
                  id="trsre-heading"
                  className="mt-3 text-display editorial-type"
                >
                  {trsreCopy.headline}
                </h2>
                <p className="mt-4 text-subhead text-ink/70">
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
              </div>
            )}

            {progress >= 0.34 && progress < 0.62 && (
              <div>
                <p className="text-metric">{trsreProof.steps}</p>
                <p className="mt-3 text-subhead text-ink/70">
                  {trsreProof.stepsLabel}
                </p>
                <p className="mt-6 text-body text-ink/65">
                  {trsreCopy.mapLine}
                </p>
              </div>
            )}

            {progress >= 0.62 && (
              <div>
                <blockquote className="text-display editorial-type max-w-3xl">
                  “{trsreProof.quote}”
                </blockquote>
                <p className="mt-5 text-sm text-ink/50">
                  {trsreProof.quoteNote}
                </p>
              </div>
            )}
          </div>

          <div className="trsre-media">
            {progress < 0.34 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={trsreImages.heroCity}
                alt="TRSRE hunt layered over Manchester"
                className="trsre-media__img trsre-media__img--hero"
              />
            ) : null}
            {progress >= 0.34 && progress < 0.62 ? (
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
            {progress >= 0.62 ? (
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
    </section>
  );
}
