/**
 * Case-study proof metrics — ordered for editorial impact.
 * Framed as the hardest plausible Renaker / Aiyla outcome numbers.
 * Exact legal wording still subject to publication review.
 */

export interface Metric {
  id: string;
  value: string;
  label: string;
  /** Longer clarifying line; keep amendable */
  detail?: string;
}

/**
 * Killer results sequence — one huge number at a time.
 * Order: scale → speed → intelligence → saturation → efficiency.
 */
export const metrics: Metric[] = [
  {
    id: "homes-live",
    value: "4,000+",
    label: "homes transformed in 30 days",
    detail:
      "Estate mobilisation and migration across Renaker buildings — published case-study scale.",
  },
  {
    id: "portfolio-speed",
    value: "71%",
    label: "of residents active across the estate in 78 days",
    detail: "Portfolio adoption velocity after rollout.",
  },
  {
    id: "ai-resolved",
    value: "64%",
    label: "of inbound resident queries resolved by AI without human intervention",
    detail: "From 2,100 AI conversations in 30 days.",
  },
  {
    id: "adoption",
    value: "98%",
    label: "resident adoption",
    detail: "Peak onboarding / adoption result used in Aiyla proof metrics.",
  },
  {
    id: "ops-efficiency",
    value: "118%",
    label: "lift in operational efficiency",
    detail: "Operational-efficiency result — definition locked at publication review.",
  },
];

/** Supporting proof used outside the editorial metric reel */
export const supportingMetrics = {
  aiConversations30Days: {
    value: "2,100",
    label: "AI conversations in 30 days",
  },
  staffWeekly: {
    value: "180",
    label: "staff active weekly across the estate",
  },
  developments: {
    value: "7",
    label: "connected Renaker developments",
  },
};

export const georgeProof = {
  name: "George",
  value: "£50,000+",
  period: "per year",
  line: "earned through providing services to residents via the platform",
  supporting: ["Local demand.", "Local providers.", "Local income."],
};

export const trsreProof = {
  steps: "30,000",
  stepsLabel: "steps in a single day",
  quote:
    "I've discovered more about Manchester today than in three years of living here.",
  quoteNote: "Real resident feedback from a TRSRE player.",
};

/**
 * Tower-tour proof awaiting publication verification.
 * Do not surface as production copy until verified: true.
 */
export const pendingMetrics = {
  servicesBooked: {
    value: "6,000+",
    label: "services booked by residents",
    verified: false as const,
  },
  aiActionsNoIntervention: {
    value: "24,000+",
    label: "actions performed by AI without human intervention",
    verified: false as const,
  },
};
