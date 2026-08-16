/**
 * Prologue / orientation copy — HTML intro before the existing V1 3D scroll.
 * Does not alter later case-study sections.
 */

export const prologueLoadingPhrases = [
  "Building Manchester…",
  "Raising towers…",
  "Connecting residents…",
  "Preparing building operations…",
  "Connecting the city…",
  "Bringing Renaker Life online…",
];

export const prologueOrientation = {
  brand: "Renaker Life",
  headline: "A Digital Experience to Match Incredible Buildings",
  body: "Renaker, one of the UK’s leading residential developers, chose Aiyla to create a digital experience worthy of its buildings — replacing fragmented systems with one intelligent platform and transforming how residents live, teams operate and management understands the estate.",
  continueHint: "Scroll to continue",
  stats: [
    { value: "7", label: "Developments" },
    { value: "4.5k", label: "Homes" },
    { value: "6.5k", label: "Residents" },
    { value: "24k", label: "AI Tasks Complete" },
  ],
};

export type PrologueAmbitionId = "problem" | "solution";

export interface PrologueAmbition {
  id: PrologueAmbitionId;
  index: string;
  label: string;
  shortLabel: string;
  headline: string;
  body: string;
  tags: string[];
  /** Optional live result card — replaces tags when present */
  result?: {
    title: string;
    body: string;
  };
}

/** Surfaces shown as white pills at the foot of each ambition copy card */
export const prologueSurfaces = ["App", "Web", "AI"] as const;

/**
 * 01 = the industry problem Renaker faced · 02 = what Renaker Life unlocked.
 * Start CTA follows as the Aiyla/start beat.
 */
export const prologueAmbitions: PrologueAmbition[] = [
  {
    id: "problem",
    index: "01",
    label: "The Challenge",
    shortLabel: "Challenge",
    headline: "Traditional systems were failing everyone.",
    body: "Resident engagement was low. Teams worked across dozens of disconnected systems and manual processes. Management lacked one clear view across the estate, and AI had no practical role in day-to-day operations.",
    tags: ["Fragmented tools", "Low engagement", "Teams frustrated", "No AI"],
  },
  {
    id: "solution",
    index: "02",
    label: "The Platform",
    shortLabel: "Platform",
    headline: "One operating system. Every layer of the estate.",
    body: "One connected platform delivered across resident, operational and management experiences — with Aiyla AI working across them all.",
    tags: [],
    result: {
      title: "A complete estate-wide transformation in three months.",
      body: "Renaker replaced its incumbent platform and migrated resident, operational and management workflows to Aiyla.",
    },
  },
];

export const prologueAiyla = {
  poweredBy: "Powered by Aiyla",
  body: "The intelligence behind Renaker Life — answering residents, supporting teams and connecting the estate to the city.",
};

export const prologueStart = {
  brand: "Renaker Life",
  headline: "Explore the estate.",
  prompt: "Click below",
  supporting: "See Renaker Life operating across Manchester.",
  cta: "Start the experience",
  /** Cover-section progress for the first wide city frame (reveal, before tower approach). */
  introCoverProgress: 0.52,
  scrollCue: "Scroll to explore the estate",
};
