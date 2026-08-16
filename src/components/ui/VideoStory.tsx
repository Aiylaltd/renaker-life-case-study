"use client";

import { useEffect, useRef, useState } from "react";
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
  const activeRef = useRef(active);
  activeRef.current = active;
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (active) return;

    const t = window.setTimeout(() => {
      if (!activeRef.current) {
        videoRef.current?.pause();
        setPlaying(false);
      }
    }, 200);
    return () => window.clearTimeout(t);
  }, [active]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);

    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
    };
  }, [story.src]);

  const playVideo = () => {
    const el = videoRef.current;
    if (!el) return;
    void el.play().catch(() => {
      /* autoplay / gesture policies */
    });
  };

  return (
    <article
      className={`video-card ${active ? "is-active" : ""} ${upcoming ? "is-upcoming" : ""}`}
      aria-labelledby={`video-${story.id}`}
      aria-hidden={!active && !upcoming}
    >
      <GlassPanel variant="light" className="video-card__panel">
        {story.src ? (
          <div
            className="video-card__media"
            style={
              story.poster
                ? {
                    backgroundImage: `url(${story.poster})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            <video
              ref={videoRef}
              controls={playing}
              playsInline
              preload={active || upcoming ? "metadata" : "none"}
              poster={story.poster}
              aria-label={story.posterLabel}
            >
              <source src={story.src} type="video/mp4" />
            </video>
            <button
              type="button"
              className={`video-card__play-overlay ${playing ? "is-playing" : ""}`}
              onClick={playVideo}
              aria-label={`Play ${story.posterLabel}`}
              tabIndex={active ? 0 : -1}
            >
              <span className="video-card__play" aria-hidden>
                ▶
              </span>
            </button>
          </div>
        ) : story.poster ? (
          <div
            className="video-card__media"
            role="img"
            aria-label={story.posterLabel}
          >
            <img
              src={story.poster}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="video-card__play-overlay" aria-hidden>
              <span className="video-card__play">▶</span>
            </div>
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
          <p className="text-label text-muted-dark">
            {story.brand ? (
              <>
                <strong className="font-semibold text-ink">{story.brand}</strong>
                {" · "}
                {story.role}
              </>
            ) : (
              story.role
            )}
          </p>
          <h3 id={`video-${story.id}`} className="mt-2 text-headline">
            {story.title}
          </h3>
          <p className="mt-3 text-body text-ink/70">{story.preview}</p>
        </div>
      </GlassPanel>
    </article>
  );
}
