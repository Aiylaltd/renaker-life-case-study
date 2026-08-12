"use client";

import { useEffect, useRef } from "react";
import type { VideoStoryConfig } from "@/config/videos";
import { GlassPanel } from "@/components/ui/GlassPanel";

export function VideoStory({
  story,
  active = true,
  upcoming = false,
}: {
  story: VideoStoryConfig;
  active?: boolean;
  upcoming?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (!active) {
      el.pause();
    }
  }, [active]);

  return (
    <article
      className={`video-card ${active ? "is-active" : ""} ${upcoming ? "is-upcoming" : ""}`}
      aria-labelledby={`video-${story.id}`}
      aria-hidden={!active && !upcoming}
    >
      <GlassPanel variant="light" className="video-card__panel">
        {story.src ? (
          <div className="video-card__media">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              controls={active}
              playsInline
              preload="metadata"
              aria-label={story.posterLabel}
            >
              <source src={story.src} type="video/mp4" />
            </video>
          </div>
        ) : (
          <div
            className="video-card__media video-card__media--placeholder"
            role="img"
            aria-label={story.posterLabel}
          >
            <div className="video-card__placeholder">
              <div className="video-card__play" aria-hidden>
                ▶
              </div>
              <p className="text-label">{story.posterLabel}</p>
              <p className="text-xs text-muted-dark">{story.durationNote}</p>
            </div>
          </div>
        )}
        <div className="video-card__copy">
          <p className="text-label text-muted-dark">{story.role}</p>
          <h3 id={`video-${story.id}`} className="mt-2 text-headline">
            {story.title}
          </h3>
          <p className="mt-3 text-body text-ink/70">{story.preview}</p>
        </div>
      </GlassPanel>
    </article>
  );
}
