"use client";

import type { VideoStoryConfig } from "@/config/videos";
import { GlassPanel } from "@/components/ui/GlassPanel";

export function VideoStory({ story }: { story: VideoStoryConfig }) {
  return (
    <article className="w-full max-w-3xl mx-auto" aria-labelledby={`video-${story.id}`}>
      <GlassPanel variant="light" className="p-3 md:p-4">
        <div
          className="placeholder-surface relative aspect-video w-full overflow-hidden rounded-[1.1rem]"
          role="img"
          aria-label={story.posterLabel}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-ink/50">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-ink/15 bg-white/50">
              <span className="ml-1 text-lg" aria-hidden>
                ▶
              </span>
            </div>
            <p className="text-label">{story.posterLabel}</p>
            <p className="text-xs text-muted-dark">{story.durationNote}</p>
          </div>
        </div>
        <div className="px-3 pb-3 pt-5 md:px-5 md:pb-5">
          <p className="text-label text-muted-dark">{story.role}</p>
          <h3 id={`video-${story.id}`} className="mt-2 text-headline">
            {story.title}
          </h3>
          <p className="mt-3 text-body text-ink/70">{story.preview}</p>
          {/* Captions: attach <track kind="captions"> when video sources arrive */}
        </div>
      </GlassPanel>
    </article>
  );
}
