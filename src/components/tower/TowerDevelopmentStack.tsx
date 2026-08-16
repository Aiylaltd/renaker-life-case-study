"use client";

import { useEffect, useRef, useState } from "react";
import {
  estateTourDevelopments,
  developments,
} from "@/config/developments";
import type {
  CardSide,
  FeatureState,
  TowerChapter,
} from "@/config/towerChapters";
import { FeatureStateViews } from "@/components/tower/FeatureStateViews";

function resolveDevelopmentImage(chapter: TowerChapter) {
  if (chapter.profileImage) {
    return {
      image: chapter.profileImage,
      imageAlt: chapter.profileImageAlt ?? chapter.name,
    };
  }
  const fromTour = estateTourDevelopments.find(
    (d) => d.id === chapter.developmentId || d.anchor === chapter.anchor,
  );
  if (fromTour) {
    return { image: fromTour.image, imageAlt: fromTour.imageAlt };
  }
  const fromAll = developments.find(
    (d) => d.id === chapter.developmentId || d.anchor === chapter.anchor,
  );
  return {
    image: fromAll?.image ?? "/images/developments/dgs.png",
    imageAlt: fromAll?.imageAlt ?? chapter.name,
  };
}

export function TowerDevelopmentStack({
  chapter,
  state,
  profileVisible,
  featureVisible,
  side = "left",
}: {
  chapter: TowerChapter;
  state: FeatureState;
  profileVisible: boolean;
  featureVisible: boolean;
  side?: CardSide;
}) {
  const feed = chapter.liveActivity;
  const [cursor, setCursor] = useState(0);
  const featurePanelRef = useRef<HTMLDivElement>(null);
  const { image, imageAlt } = resolveDevelopmentImage(chapter);
  const isOutcome = state.kind === "outcome";
  const isAdmin = chapter.audience === "admin";
  const label = state.label ?? chapter.chapterLabel;

  useEffect(() => {
    if (!profileVisible || feed.length === 0) return;
    setCursor(0);
    const id = window.setInterval(() => {
      setCursor((c) => (c + 1) % feed.length);
    }, 3600);
    return () => window.clearInterval(id);
  }, [profileVisible, chapter.id, feed.length]);

  // Community (and other tall states) can leave the panel scrolled down —
  // reset so short outcome cards aren't sitting above the fold.
  useEffect(() => {
    const panel = featurePanelRef.current;
    if (panel) panel.scrollTop = 0;
  }, [state.id, featureVisible]);

  const activity = feed[cursor % feed.length];

  return (
    <div
      className={`tower-stack tower-stack--${side} ${
        profileVisible ? "tower-stack--in" : "tower-stack--out"
      } ${featureVisible ? "tower-stack--expanded" : ""} ${
        isOutcome ? "tower-stack--outcome" : ""
      } ${isAdmin ? "tower-stack--admin" : "tower-stack--resident"}`}
      aria-hidden={!profileVisible}
      aria-label={`${chapter.name} case study`}
    >
      <div className="tower-stack__shell">
        <div className="tower-stack__feature-wrap" aria-hidden={!featureVisible}>
          <div className="tower-stack__feature" ref={featurePanelRef}>
            <div key={state.id} className="tower-feature__inner">
              {label && !isOutcome ? (
                <p className="tower-feature__label">{label}</p>
              ) : null}
              {state.headline && !isOutcome ? (
                <h2 className="tower-feature__headline">{state.headline}</h2>
              ) : null}
              {state.supporting && !isOutcome ? (
                <p className="tower-feature__supporting">{state.supporting}</p>
              ) : null}
              <div
                className={`tower-feature__body ${
                  isOutcome ? "tower-feature__body--outcome" : ""
                }`}
              >
                <FeatureStateViews state={state} />
              </div>
            </div>
          </div>
        </div>

        <div className="tower-stack__profile">
          <div className="tower-stack__identity">
            <div className="tower-stack__media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={imageAlt} />
            </div>
            <div className="tower-stack__copy">
              <p className="tower-card__name">{chapter.name}</p>
              {chapter.location ? (
                <p className="tower-card__meta">{chapter.location}</p>
              ) : null}
              {chapter.homes ? (
                <p className="tower-card__meta">{chapter.homes}</p>
              ) : null}
              {chapter.statusLine ? (
                <p className="tower-card__live">
                  <span className="tower-card__live-dot" aria-hidden />
                  {chapter.statusLine}
                </p>
              ) : null}
            </div>
          </div>

          {activity ? (
            <div className="tower-card__activity">
              <div className="tower-card__activity-head">
                <p className="tower-card__activity-label">AI activity</p>
                <p className="tower-card__activity-note">Illustrative</p>
              </div>
              <p
                key={`${activity.text}-${cursor}`}
                className="tower-card__activity-item"
              >
                {activity.text}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
