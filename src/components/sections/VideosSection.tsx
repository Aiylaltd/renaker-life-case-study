"use client";

import { sections } from "@/config/caseStudy";
import { videoStories } from "@/config/videos";
import { VideoStory } from "@/components/ui/VideoStory";
import { useScrollStore } from "@/store/scrollStore";

export function VideosSection() {
  const progress = useScrollStore((s) =>
    s.sectionId === "videos" ? s.sectionProgress : 0,
  );
  const idx = Math.min(
    videoStories.length - 1,
    Math.floor(progress * videoStories.length),
  );

  return (
    <section
      id="section-videos"
      className="story-section--pin"
      aria-labelledby="videos-heading"
    >
      <div className="sticky top-0 flex min-h-[100svh] flex-col items-center justify-center gap-8 py-12">
        <h2 id="videos-heading" className="text-label text-muted-dark">
          {sections.videos.headline}
        </h2>
        <VideoStory story={videoStories[idx]} />
      </div>
    </section>
  );
}
