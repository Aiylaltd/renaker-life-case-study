"use client";

import type { CardSide, FeatureState, TowerChapter } from "@/config/towerChapters";
import { FeatureStateViews } from "@/components/tower/FeatureStateViews";

export function TowerFeatureCard({
  chapter,
  state,
  visible,
  side,
  wide = false,
}: {
  chapter: TowerChapter;
  state: FeatureState;
  visible: boolean;
  side: CardSide;
  /** Estate-wide management card — breaks left/right pattern */
  wide?: boolean;
}) {
  const isOutcome = state.kind === "outcome";
  const label = state.label ?? chapter.chapterLabel;
  const headline = state.headline;
  const supporting = state.supporting;

  return (
    <article
      className={`tower-card tower-card--feature tower-card--${side} ${
        wide ? "tower-card--wide" : ""
      } ${visible ? "tower-card--in" : "tower-card--out"} ${
        isOutcome ? "tower-card--outcome" : ""
      }`}
      aria-hidden={!visible}
      aria-label={`${chapter.chapterLabel} case study`}
    >
      <div key={state.id} className="tower-feature__inner">
        {label && !isOutcome ? (
          <p className="tower-feature__label">{label}</p>
        ) : null}

        {headline && !isOutcome ? (
          <h2 className="tower-feature__headline">{headline}</h2>
        ) : null}

        {supporting && !isOutcome ? (
          <p className="tower-feature__supporting">{supporting}</p>
        ) : null}

        <div className="tower-feature__body">
          <FeatureStateViews state={state} />
        </div>
      </div>
    </article>
  );
}
