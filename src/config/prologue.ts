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
  headline: "A digital experience built to match the buildings.",
  body: "Renaker, one of Manchester’s leading residential developers, partnered with Aiyla to create a digital experience worthy of its buildings — replacing fragmented systems with one intelligent platform and transforming how residents live, teams operate and management understands the estate.",
  continueHint: "Scroll to continue",
  stats: [
    { value: "7", label: "Developments" },
    { value: "4.5k", label: "Homes" },
    { value: "6.5k", label: "Residents" },
    { value: "24k", label: "AI Tasks Complete" },
  ],
};

export type PrologueAmbitionId =
  | "resident"
  | "operations"
  | "management"
  | "city";

export interface PrologueAmbition {
  id: PrologueAmbitionId;
  index: string;
  label: string;
  shortLabel: string;
  headline: string;
  body: string;
  tags: string[];
}

/** Surfaces shown as white pills at the foot of each ambition copy card */
export const prologueSurfaces = ["App", "Web", "AI"] as const;

export const prologueAmbitions: PrologueAmbition[] = [
  {
    id: "resident",
    index: "01",
    label: "Resident Experience",
    shortLabel: "Residents",
    headline: "Make living effortless.",
    body: "Everything residents need in one place — answers, requests, communication, community and everyday services.",
    tags: ["AI Concierge", "Requests", "Community", "Services"],
  },
  {
    id: "operations",
    index: "02",
    label: "Building Operations",
    shortLabel: "Operations",
    headline: "Run buildings better.",
    body: "One connected workspace for concierge and building teams to manage the day-to-day operation of every development.",
    tags: ["Tasks", "Parcels", "Requests", "Communications", "Automation"],
  },
  {
    id: "management",
    index: "03",
    label: "Management Intelligence",
    shortLabel: "Management",
    headline: "Turn activity into intelligence.",
    body: "Unlock and visualise what is happening across the estate — compare developments, identify trends and interrogate operational data.",
    tags: ["Portfolio View", "Reporting", "Comparison", "AI Insight"],
  },
  {
    id: "city",
    index: "04",
    label: "Placemaking",
    shortLabel: "Placemaking",
    headline: "Connect home to Manchester.",
    body: "Extend the resident experience beyond the building — into local businesses, culture, services and the neighbourhood around them.",
    tags: ["Digital High Street", "Local Discovery", "Services", "Placemaking"],
  },
];

export const prologueAiyla = {
  poweredBy: "Powered by Aiyla",
  body: "One intelligence layer connecting residents, operations, management and the city around them.",
};

export const prologueStart = {
  brand: "Renaker Life",
  headline: "Explore the estate.",
  supporting: "See Renaker Life operating across Manchester.",
  cta: "Start the experience",
  /** Cover-section progress for the first wide city frame (reveal, before tower approach). */
  introCoverProgress: 0.52,
  scrollCue: "Scroll to explore the estate",
};
