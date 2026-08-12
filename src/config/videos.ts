export interface VideoStoryConfig {
  id: string;
  role: string;
  title: string;
  preview: string;
  /** Public path when the filmed asset is ready */
  src?: string;
  /** Placeholder until filmed assets arrive */
  posterLabel: string;
  durationNote: string;
}

export const videoStories: VideoStoryConfig[] = [
  {
    id: "michael",
    role: "Michael · CEO / Co-Founder",
    title: "The vision",
    preview: "Why Renaker chose to build one connected resident experience.",
    src: "/videos/case-study-m.mp4",
    posterLabel: "Michael — CEO / Co-Founder",
    durationNote: "Play",
  },
  {
    id: "jordan",
    role: "Jordan · CTO / Co-Founder",
    title: "How it works",
    preview: "The intelligence layer that connects buildings, people and place.",
    src: "/videos/case-study-j.mp4",
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
