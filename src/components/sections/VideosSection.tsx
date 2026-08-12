"use client";

import { sectionOrder, sections } from "@/config/caseStudy";
import { videoStories } from "@/config/videos";
import { VideoStory } from "@/components/ui/VideoStory";
import { useScrollStore } from "@/store/scrollStore";

/** Hold each card, then ease to the next — first card gets a longer lock. */
function lockedSlide(progress: number, count: number) {
  const max = Math.max(0, count - 1);
  if (max === 0) return 0;

  // Settle on the first card before any sideways motion
  const leadIn = 0.14;
  if (progress <= leadIn) return 0;

  const p = Math.max(
    0,
    Math.min(1, (progress - leadIn) / (1 - leadIn)),
  );

  // First card owns more of the scroll distance
  const weights =
    count === 3 ? [1.7, 1.1, 1] : Array.from({ length: count }, (_, i) =>
      i === 0 ? 1.6 : 1,
    );
  const total = weights.reduce((a, b) => a + b, 0);
  const edges: number[] = [0];
  let acc = 0;
  for (const w of weights) {
    acc += w / total;
    edges.push(acc);
  }

  let i = 0;
  for (let k = 0; k < max; k++) {
    if (p >= edges[k + 1]) i = k + 1;
    else {
      i = k;
      break;
    }
  }
  if (p >= edges[max]) return max;

  const start = edges[i];
  const end = edges[i + 1];
  const local = (p - start) / Math.max(0.0001, end - start);
  const hold = i === 0 ? 0.82 : 0.72;
  if (local < hold) return i;
  const t = (local - hold) / (1 - hold);
  const eased = t * t * (3 - 2 * t);
  return i + eased;
}

function videosProgress(sectionId: string, sectionProgress: number) {
  if (sectionId === "videos") return sectionProgress;
  const videosIdx = sectionOrder.indexOf("videos");
  const currentIdx = sectionOrder.indexOf(
    sectionId as (typeof sectionOrder)[number],
  );
  // Past videos → stay on the last card while the pin releases into finale
  if (currentIdx > videosIdx) return 1;
  return 0;
}

export function VideosSection() {
  const progress = useScrollStore((s) =>
    videosProgress(s.sectionId, s.sectionProgress),
  );

  const slide = lockedSlide(progress, videoStories.length);
  const activeIndex = Math.min(
    videoStories.length - 1,
    Math.round(slide),
  );

  return (
    <section
      id="section-videos"
      className="story-section--videos"
      aria-labelledby="videos-heading"
    >
      <div className="videos-stage">
        <div className="videos-stage__header">
          <h2 id="videos-heading" className="text-label text-muted-dark">
            {sections.videos.headline}
          </h2>
          <p className="videos-stage__hint" aria-hidden>
            Scroll to meet the next voice
          </p>
        </div>

        <div className="videos-viewport">
          <div
            className="videos-track"
            style={{
              transform: `translate3d(calc(-1 * ${slide} * (var(--video-card-w) + var(--video-gap))), 0, 0)`,
            }}
          >
            {videoStories.map((story, i) => (
              <VideoStory
                key={story.id}
                story={story}
                active={i === activeIndex}
                upcoming={i === activeIndex + 1}
              />
            ))}
          </div>
        </div>

        <div className="videos-dots" role="tablist" aria-label="Video stories">
          {videoStories.map((story, i) => (
            <span
              key={story.id}
              className={`videos-dots__dot ${i === activeIndex ? "is-active" : ""}`}
              role="presentation"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
