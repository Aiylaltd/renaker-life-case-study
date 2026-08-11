"use client";

import { towerChapters } from "@/config/towerChapters";
import {
  jumpToStorySection,
  jumpToTowerChapter,
} from "@/hooks/useTowerTourSteps";

const AFTER_TOUR = [
  { id: "beyond", label: "Beyond", sectionId: "section-dhs-early" },
  { id: "trsre", label: "TRSRE", sectionId: "section-trsre" },
  { id: "videos", label: "Videos", sectionId: "section-videos" },
] as const;

export function TowerCaseNav({
  activeIndex,
  visible,
}: {
  activeIndex: number;
  visible: boolean;
}) {
  return (
    <nav
      className={`tower-case-nav ${visible ? "tower-case-nav--in" : "tower-case-nav--out"}`}
      aria-label="Case study chapters"
      aria-hidden={!visible}
    >
      <ol className="tower-case-nav__list">
        {towerChapters.map((chapter, i) => {
          const active = i === activeIndex;
          const done = activeIndex >= 0 && i < activeIndex;
          return (
            <li
              key={chapter.id}
              className={`tower-case-nav__item ${
                active ? "tower-case-nav__item--active" : ""
              } ${done ? "tower-case-nav__item--done" : ""}`}
            >
              <button
                type="button"
                className="tower-case-nav__btn"
                aria-current={active ? "true" : undefined}
                onClick={() => {
                  void jumpToTowerChapter(i);
                }}
              >
                {chapter.navTitle}
              </button>
            </li>
          );
        })}
        {AFTER_TOUR.map((item) => (
          <li key={item.id} className="tower-case-nav__item tower-case-nav__item--after">
            <button
              type="button"
              className="tower-case-nav__btn"
              onClick={() => {
                void jumpToStorySection(item.sectionId);
              }}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
