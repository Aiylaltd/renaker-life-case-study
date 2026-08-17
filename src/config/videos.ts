export interface VideoStoryConfig {
  id: string;
  role: string;
  /** Brand prefix shown bold before role (e.g. AIYLA) */
  brand?: string;
  title: string;
  preview: string;
  /** Public path when the filmed asset is ready */
  src?: string;
  /** Still shown before / while the video is idle */
  poster?: string;
  /** Placeholder until filmed assets arrive */
  posterLabel: string;
  durationNote: string;
}

export const videoStories: VideoStoryConfig[] = [
  {
    id: "michael",
    brand: "AIYLA",
    role: "Michael · CEO / Co-Founder",
    title: "The vision",
    preview: "Why Renaker chose to build one connected resident experience.",
    src: "/videos/case-study-m.mp4",
    poster: "/images/videos/michael-poster.png",
    posterLabel: "Michael — CEO / Co-Founder",
    durationNote: "Play",
  },
  {
    id: "jordan",
    brand: "AIYLA",
    role: "Jordan · CTO / Co-Founder",
    title: "How it works",
    preview: "The intelligence layer that connects buildings, people and place.",
    src: "/videos/case-study-j.mp4",
    poster: "/images/videos/jordan-poster.png",
    posterLabel: "Jordan — CTO / Co-Founder",
    durationNote: "Play",
  },
  {
    id: "client",
    role: "Renaker client",
    title: "The impact",
    preview: "What changes when an estate runs on one intelligent platform.",
    posterLabel: "Video coming soon — Renaker client",
    durationNote: "Awaiting final cut",
  },
];

/** Stories ready to show — hides placeholder cards with no filmed asset. */
export const publishedVideoStories = videoStories.filter((v) => Boolean(v.src));
