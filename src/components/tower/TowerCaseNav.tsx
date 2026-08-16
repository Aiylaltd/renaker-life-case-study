"use client";

import { towerChapters } from "@/config/towerChapters";
import {
  jumpToStorySection,
  jumpToTowerChapter,
} from "@/hooks/useTowerTourSteps";
import { useScrollStore } from "@/store/scrollStore";

const AFTER_TOUR = [
  { id: "beyond", label: "Beyond", sectionId: "section-dhs-early" },
  { id: "trsre", label: "TRSRE", sectionId: "section-trsre" },
  { id: "videos", label: "Videos", sectionId: "section-videos" },
  { id: "contact", label: "Contact", sectionId: "section-finale" },
] as const;

function activeAfterId(
  sectionId: string,
  storyBridge: "none" | "beyond",
): (typeof AFTER_TOUR)[number]["id"] | null {
  if (sectionId === "finale") return "contact";
  if (sectionId === "videos") return "videos";
  if (sectionId === "trsre") return "trsre";
  if (sectionId === "dhs-early" || storyBridge === "beyond") return "beyond";
  return null;
}

export function TowerCaseNav({
  activeIndex,
  visible,
}: {
  activeIndex: number;
  visible: boolean;
}) {
  const sectionId = useScrollStore((s) => s.sectionId);
  const storyBridge = useScrollStore((s) => s.storyBridge);
  const afterActive = activeAfterId(sectionId, storyBridge);
  const afterOrder = AFTER_TOUR.map((item) => item.id);
  const afterActiveIdx = afterActive ? afterOrder.indexOf(afterActive) : -1;

  return (
    <nav
      className={`tower-case-nav ${visible ? "tower-case-nav--in" : "tower-case-nav--out"}`}
      aria-label="Case study chapters"
      aria-hidden={!visible}
    >
      <ol className="tower-case-nav__list">
        {towerChapters.map((chapter, i) => {
          const active = i === activeIndex;
          const done =
            (activeIndex >= 0 && i < activeIndex) || afterActiveIdx >= 0;
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
        {AFTER_TOUR.map((item, i) => {
          const active = item.id === afterActive;
          const done = afterActiveIdx > i;
          return (
            <li
              key={item.id}
              className={`tower-case-nav__item tower-case-nav__item--after ${
                active ? "tower-case-nav__item--active" : ""
              } ${done ? "tower-case-nav__item--done" : ""}`}
            >
              <button
                type="button"
                className="tower-case-nav__btn"
                aria-current={active ? "true" : undefined}
                onClick={() => {
                  void jumpToStorySection(item.sectionId);
                }}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
