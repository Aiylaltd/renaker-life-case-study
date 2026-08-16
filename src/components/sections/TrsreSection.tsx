"use client";

import { useEffect, useRef } from "react";
import { trsreCopy, trsreImages, trsrePins, trsreVideos } from "@/config/trsre";
import { trsreProof } from "@/config/metrics";
import { useScrollStore } from "@/store/scrollStore";

/**
 * 0 = Beyond-style intro title
 * 1 = map pin showcase in FOV
 * 2 = 300 codes (title style) + video frame only
 * 3–4 = explore / impact cards
 */
const BEATS = 5;

function lockedBeat(progress: number, beats: number) {
  const p = Math.max(0, Math.min(0.999, progress));
  const scaled = p * beats;
  const i = Math.min(beats - 1, Math.floor(scaled));
  return { index: i, local: scaled - i };
}

export function TrsreSection() {
  const sectionId = useScrollStore((s) => s.sectionId);
  const progress = useScrollStore((s) =>
    s.sectionId === "trsre" ? s.sectionProgress : 0,
  );
  const setTrsreShowPins = useScrollStore((s) => s.setTrsreShowPins);
  const videoRef = useRef<HTMLVideoElement>(null);

  const inTrsre = sectionId === "trsre";
  const { index: beat } = lockedBeat(progress, BEATS);
  const showPanel = beat >= 3;

  useEffect(() => {
    setTrsreShowPins(inTrsre && beat >= 1);
    return () => setTrsreShowPins(false);
  }, [inTrsre, beat, setTrsreShowPins]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (inTrsre && beat === 2) {
      el.currentTime = 0;
      void el.play().catch(() => {
        /* autoplay may be blocked until gesture — muted should allow it */
      });
    } else {
      el.pause();
    }
  }, [inTrsre, beat]);

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
