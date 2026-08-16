import type { AnchorName } from "@/config/scene";

/**
 * Digital High Street search walkthrough — data-driven, easy to replace.
 * Beats 1–3: real partners + genuine Renaker Life offers.
 * Beat 4: illustrative fictional prompts (not claimed live businesses).
 */

export interface DhsOffer {
  label: string;
  detail?: string;
}

export interface DhsPartnerBusiness {
  id: string;
  anchor: AnchorName;
  name: string;
  category: string;
  distance: string;
  logo: string;
  header: string;
  offers: DhsOffer[];
}

export interface DhsSearchBeat {
  id: string;
  prompt: string;
  business: DhsPartnerBusiness;
}

export interface DhsVisionPrompt {
  id: string;
  prompt: string;
  /** Fictional nearby result — conceptual only */
  resultName: string;
  distance: string;
}

export const dhsSearchBeats: DhsSearchBeat[] = [
  {
    id: "dining",
    prompt: "Where do you recommend for fancy sushi tonight?",
    business: {
      id: "sexy-fish",
      anchor: "ANCHOR_BIZ2",
      name: "Sexy Fish",
      category: "Dining",
      distance: "0.4 mi",
      logo: "/images/dhs/sexy-fish-logo.png",
      header: "/images/dhs/sexy-fish-header.png",
      offers: [
        {
          label: "30% off your bill",
          detail: "Renaker Life Access",
        },
      ],
    },
  },
  {
    id: "product",
    prompt: "I need a birthday present today for my niece who likes art.",
    business: {
      id: "millesime",
      anchor: "ANCHOR_BIZ1",
      name: "Millesime Art",
      category: "Art & gallery",
      distance: "0.3 mi",
      logo: "/images/dhs/millesime-logo.png",
      header: "/images/dhs/millesime-header.png",
      offers: [
        {
          label: "Free consultation & installation",
          detail: "Renaker Life Access",
        },
        {
          label: "10% off artworks",
          detail: "Renaker Life Access",
        },
      ],
    },
  },
  {
    id: "activity",
    prompt:
      "Looking for a fun activity this weekend for a group of friends, any ideas?",
    business: {
      id: "breakout",
      anchor: "ANCHOR_BIZ3",
      name: "Breakout Manchester",
      category: "Activity",
      distance: "0.5 mi",
      logo: "/images/dhs/breakout-logo.png",
      header: "/images/dhs/breakout-header.png",
      offers: [
        {
          label: "10% OFF ESCAPE ROOMS",
          detail: "Renaker Life Access",
        },
      ],
    },
  },
];

/** Illustrative only — fictional names, not real brands. */
export const dhsVisionPrompts: DhsVisionPrompt[] = [
  {
    id: "ipad-case",
    prompt: "Find me a floral iPad case.",
    resultName: "Paper & Petal",
    distance: "0.2 mi",
  },
  {
    id: "charger",
    prompt: "I need an iPhone charger now.",
    resultName: "Corner Charge",
    distance: "0.3 mi",
  },
  {
    id: "lens",
    prompt: "Where can I buy a camera lens?",
    resultName: "Northern Optics",
    distance: "0.4 mi",
  },
  {
    id: "bread",
    prompt: "Fresh bread nearby?",
    resultName: "Mill Lane Bakery",
    distance: "0.2 mi",
  },
];

export function dhsBeatIndexToSearch(beat: number): DhsSearchBeat | null {
  if (beat >= 1 && beat <= 3) return dhsSearchBeats[beat - 1] ?? null;
  return null;
}

export function dhsActiveAnchorsForBeat(beat: number): AnchorName[] {
  const search = dhsBeatIndexToSearch(beat);
  if (search) return [search.business.anchor];
  return [];
}
