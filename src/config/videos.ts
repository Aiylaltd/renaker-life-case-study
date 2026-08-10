export interface VideoStoryConfig {
  id: string;
  role: string;
  title: string;
  preview: string;
  /** Placeholder until filmed assets arrive */
  posterLabel: string;
  durationNote: string;
}

export const videoStories: VideoStoryConfig[] = [
  {
    id: "ceo",
    role: "CEO / Founder",
    title: "The vision",
    preview: "Why Renaker chose to build one connected resident experience.",
    posterLabel: "Video placeholder — CEO / founder",
    durationNote: "Approx. 30–60 seconds",
  },
  {
    id: "cto",
    role: "CTO",
    title: "How it works",
    preview: "The intelligence layer that connects buildings, people and place.",
    posterLabel: "Video placeholder — CTO",
    durationNote: "Approx. 30–60 seconds",
  },
  {
    id: "client",
    role: "Renaker client",
    title: "The impact",
    preview: "What changes when an estate runs on one intelligent platform.",
    posterLabel: "Video placeholder — Renaker client",
    durationNote: "Approx. 30–60 seconds",
  },
];
