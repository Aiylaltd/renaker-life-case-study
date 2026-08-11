import type { AnchorName } from "@/config/scene";
import { georgeProof, metrics } from "@/config/metrics";

export type CardSide = "left" | "right";

export type TowerPhase =
  | "arrive"
  | "profile"
  | "feature"
  | "outcome"
  | "clearing"
  | "depart"
  | "estate";

export type FeatureStateKind =
  | "chat"
  | "chat-locale"
  | "services"
  | "journey"
  | "human"
  | "ops-flow"
  | "comms"
  | "consolidate"
  | "outcome"
  | "management";

export interface LiveActivityExample {
  /** Illustrative UI copy — not live telemetry */
  text: string;
}

export interface ChatLine {
  role: "resident" | "ai";
  text: string;
}

export interface FeatureState {
  id: string;
  kind: FeatureStateKind;
  label?: string;
  headline?: string;
  supporting?: string;
  chat?: ChatLine[];
  /** Locale variant of chat (e.g. Chinese) */
  chatLocale?: ChatLine[];
  localeNote?: string;
  categories?: string[];
  /** Service discovery tiles with photoshoot imagery */
  serviceTiles?: { label: string; image: string }[];
  brandLogo?: string;
  brandLogoAlt?: string;
  journeySteps?: string[];
  human?: {
    name: string;
    value: string;
    detail: string;
    image?: string;
    imageAlt?: string;
  };
  opsSteps?: string[];
  opsPrompt?: string;
  opsResult?: string;
  functions?: string[];
  /** Illustrative development comparison bars (0–100) */
  comparisons?: { name: string; value: number }[];
  comparisonLabel?: string;
  /** Large outcome number */
  outcomeValue?: string;
  outcomeLabel?: string;
  /** Soft disclaimer when metric is illustrative / unverified */
  outcomeNote?: string;
  verified?: boolean;
}

export interface TowerChapter {
  id: string;
  /** null = estate-wide (no single tower focus) */
  anchor: AnchorName | null;
  developmentId: string | null;
  name: string;
  location?: string;
  homes?: string;
  statusLine?: string;
  /** Optional profile image override (estate-wide compiled shot) */
  profileImage?: string;
  profileImageAlt?: string;
  profileSide: CardSide;
  featureSide: CardSide;
  /** Illustrative activity examples — not live production events */
  liveActivity: LiveActivityExample[];
  chapterLabel: string;
  /** Short label for the vertical case-study side nav */
  navTitle: string;
  featureStates: FeatureState[];
}

const aiResolved = metrics.find((m) => m.id === "ai-resolved");

/**
 * Estate tour chapters — one progressing case study.
 * Metrics marked verified:false must not be treated as locked publication copy.
 */
export const towerChapters: TowerChapter[] = [
  {
    id: "dgs-resident",
    anchor: "ANCHOR_DGS",
    developmentId: "deansgate-square",
    name: "Deansgate Square",
    location: "Manchester",
    homes: "1,508 homes",
    statusLine: "Live on Renaker Life",
    profileSide: "left",
    featureSide: "left",
    liveActivity: [
      { text: "Resident query resolved" },
      { text: "Parcel notification sent" },
      { text: "Building information retrieved" },
      { text: "Service request routed" },
    ],
    chapterLabel: "Resident Experience",
    navTitle: "AI Concierge",
    featureStates: [
      {
        id: "dgs-answers",
        kind: "chat",
        label: "Resident Experience",
        headline: "AI Concierge",
        supporting:
          "Renaker Life gives residents an AI concierge that understands their building and can resolve everyday questions instantly.",
        chat: [
          { role: "resident", text: "My hob won’t turn on." },
          {
            role: "ai",
            text: "It sounds like the child lock may be active. Hold the lock symbol for around five seconds and try again.",
          },
          { role: "resident", text: "That worked, thanks." },
        ],
      },
      {
        id: "dgs-languages",
        kind: "chat-locale",
        label: "Resident Experience",
        headline: "Fluent in 200+\nLanguages",
        supporting:
          "Speaking naturally with any resident 24/7. Trained on processes, procedures, operational data and tone.",
        localeNote: "Same experience. Same intelligence. Different language.",
        chat: [
          { role: "resident", text: "My hob won’t turn on." },
          {
            role: "ai",
            text: "It sounds like the child lock may be active. Hold the lock symbol for around five seconds and try again.",
          },
          { role: "resident", text: "That worked, thanks." },
        ],
        chatLocale: [
          { role: "resident", text: "我的炉灶打不开。" },
          {
            role: "ai",
            text: "听起来可能是童锁开启了。按住锁定符号大约五秒，然后再试一次。",
          },
          { role: "resident", text: "可以了，谢谢。" },
        ],
      },
      {
        id: "dgs-outcome",
        kind: "outcome",
        outcomeValue: aiResolved?.value ?? "64%",
        outcomeLabel:
          "of inbound resident queries resolved by AI without human intervention.",
        verified: true,
      },
    ],
  },
  {
    id: "services-new-jackson",
    anchor: "ANCHOR_BLADE",
    developmentId: "blade-three60",
    name: "The Blade & Three60",
    location: "Manchester",
    homes: "857 homes",
    statusLine: "Live on Renaker Life",
    profileSide: "left",
    featureSide: "left",
    liveActivity: [
      { text: "Service booked" },
      { text: "Provider confirmed" },
      { text: "Resident notified" },
      { text: "Amenity booking confirmed" },
      { text: "Event registration completed" },
    ],
    chapterLabel: "Resident Services",
    navTitle: "Resident Services",
    featureStates: [
      {
        id: "services-discover",
        kind: "services",
        label: "Resident Services",
        headline: "Resident Services\nby Doorly",
        supporting:
          "Renaker Life connects residents directly to trusted, local service providers. Making booking a cleaner as easy as ordering an Uber.",
        brandLogo: "/images/doorly/doorly-logo-full.png",
        brandLogoAlt: "Doorly",
        serviceTiles: [
          { label: "Cleaning", image: "/images/doorly/services/cleaning.jpg" },
          { label: "Beauty", image: "/images/doorly/services/beauty.jpg" },
          {
            label: "Private chef",
            image: "/images/doorly/services/private-chef.jpg",
          },
          { label: "Pet care", image: "/images/doorly/services/pet-care.jpg" },
          { label: "DIY", image: "/images/doorly/services/diy.jpg" },
          { label: "Wellness", image: "/images/doorly/services/wellness.jpg" },
          { label: "Vehicle", image: "/images/doorly/services/vehicle.jpg" },
          { label: "Laundry", image: "/images/doorly/services/laundry.jpg" },
        ],
      },
      {
        id: "services-journey",
        kind: "journey",
        label: "Resident Services",
        headline: "Booked in moments.",
        supporting: "From discovery to confirmation — one clear path.",
        brandLogo: "/images/doorly/doorly-logo-full.png",
        brandLogoAlt: "Doorly",
        journeySteps: [
          "Choose service",
          "Choose provider",
          "Book",
          "Confirmation",
        ],
      },
      {
        id: "services-george",
        kind: "human",
        label: "Resident Services",
        headline: "Local demand.\nReal income.",
        brandLogo: "/images/doorly/doorly-logo-full.png",
        brandLogoAlt: "Doorly",
        human: {
          name: "Michael & George",
          value: georgeProof.value,
          detail:
            "Driving revenue into the local economy with top earners generating over £50,000 per year in bookings.",
          image: "/images/doorly/george.jpg",
          imageAlt: "Michael and George — Doorly local providers",
        },
      },
      {
        id: "services-outcome",
        kind: "outcome",
        outcomeValue: "",
        outcomeLabel:
          "Providing work for local providers, increasing resident experience and generating new revenue for developments through the Doorly revenue share scheme.",
        verified: true,
      },
    ],
  },
  {
    id: "crown-operations",
    anchor: "ANCHOR_CROWNST",
    developmentId: "crown-street",
    name: "Crown Street",
    location: "Manchester",
    homes: "664 homes",
    statusLine: "Live on Renaker Life",
    profileSide: "left",
    featureSide: "left",
    liveActivity: [
      { text: "Request categorised" },
      { text: "Task created" },
      { text: "Priority assigned" },
      { text: "Staff notified" },
      { text: "Announcement drafted" },
    ],
    chapterLabel: "Building Operations",
    navTitle: "Building Operations",
    featureStates: [
      {
        id: "ops-leak",
        kind: "ops-flow",
        label: "Building Operations",
        headline: "Less admin.\nMore operation.",
        supporting:
          "Aiyla AI does operational work. It does not simply answer questions.",
        chat: [
          {
            role: "resident",
            text: "There’s water leaking beneath my kitchen sink.",
          },
        ],
        opsSteps: [
          "AI understands request",
          "Categorises: Plumbing",
          "Determines priority",
          "Creates task",
          "Routes to building team",
          "Staff member assigned",
        ],
      },
      {
        id: "ops-comms",
        kind: "comms",
        label: "Building Operations",
        headline: "AI Communications",
        opsPrompt:
          "Create an announcement informing residents that Lift 2 will be unavailable between 10am and 12pm tomorrow.",
        opsResult:
          "Lift 2 will be unavailable tomorrow between 10:00 and 12:00 for scheduled maintenance. Please use Lift 1 during this time. Thank you for your patience.",
        supporting:
          "Drafted, ready for review — Renaker tone, building ready, automatically delivered to the right people.",
      },
      {
        id: "ops-outcome",
        kind: "outcome",
        // Qualitative close — numeric "24,000+" held in pendingMetrics until verified
        outcomeValue: "Handled.",
        outcomeLabel:
          "Requests categorised, tasks created, teams notified — without the admin bottleneck.",
        verified: true,
      },
    ],
  },
  {
    id: "castle-platform",
    anchor: "ANCHOR_CW",
    developmentId: "castle-wharf",
    name: "Castle Wharf",
    location: "Manchester",
    homes: "188 homes",
    statusLine: "Live on Renaker Life",
    profileSide: "left",
    featureSide: "left",
    liveActivity: [
      { text: "Parcel processed" },
      { text: "Move-in journey started" },
      { text: "Room booking confirmed" },
      { text: "Task completed" },
    ],
    chapterLabel: "One Operating System",
    navTitle: "One Platform",
    featureStates: [
      {
        id: "platform-fragment",
        kind: "consolidate",
        label: "One Operating System",
        headline: "From fragmented systems\nto one connected platform.",
        supporting:
          "Resident and building operations brought together in one place.",
        functions: [
          "Parcels",
          "Move-ins",
          "Service requests",
          "Room bookings",
          "Event bookings",
          "Communications",
          "Tasks",
          "Resident information",
        ],
      },
      {
        id: "platform-unified",
        kind: "consolidate",
        label: "One Operating System",
        headline: "One connected\nplatform.",
        supporting: "Residents. Operations. Management.",
        functions: [
          "Parcels",
          "Move-ins",
          "Service requests",
          "Room bookings",
          "Event bookings",
          "Communications",
          "Tasks",
          "Resident information",
        ],
      },
      {
        id: "platform-outcome",
        kind: "outcome",
        outcomeValue: "One",
        outcomeLabel: "connected operating environment for the building.",
        verified: true,
      },
    ],
  },
  {
    id: "estate-management",
    anchor: null,
    developmentId: null,
    name: "Renaker Estate",
    location: "Manchester",
    homes: "7 developments",
    statusLine: "All estates connected",
    profileImage: "/images/developments/estate.jpg",
    profileImageAlt: "Renaker developments across Manchester",
    profileSide: "left",
    featureSide: "left",
    liveActivity: [
      { text: "Estate report generated" },
      { text: "Development comparison ready" },
      { text: "Recurring themes identified" },
    ],
    chapterLabel: "Management Intelligence",
    navTitle: "Management",
    featureStates: [
      {
        id: "mgmt-connected",
        kind: "consolidate",
        label: "Management Intelligence",
        headline: "All estates\nconnected.",
        supporting:
          "Seven developments. One operating picture — performance, patterns and activity in a single view.",
        functions: [
          "Deansgate Square",
          "Three60",
          "The Blade",
          "Vista River Gardens",
          "Crown Street",
          "Bankside",
          "Castle Wharf",
        ],
      },
      {
        id: "mgmt-prompt",
        kind: "management",
        label: "Management Intelligence",
        headline: "Deep insight,\non demand.",
        supporting: "Instant reports from connected operational data.",
        opsPrompt:
          "Summarise all complaints over the last 6 months, response times and recurring trends.",
      },
      {
        id: "mgmt-response",
        kind: "management",
        label: "Management Intelligence",
        headline: "Deep insight,\non demand.",
        opsPrompt:
          "Summarise all complaints over the last 6 months, response times and recurring trends.",
        opsResult:
          "Complaint volume clustered around three themes: lift availability, parcel delays, and communal cleaning. Crown Street and Castle Wharf show the fastest first response; Deansgate Square holds the longest maintenance resolution times. Recurring trend: weekend parcel backlog after peak move-in periods.",
        outcomeNote: "Illustrative AI response — structure mirrors live reporting.",
      },
      {
        id: "mgmt-compare",
        kind: "management",
        label: "Management Intelligence",
        headline: "Compare\ndevelopments.",
        supporting: "See where the estate leads — and where it lags.",
        comparisonLabel: "First-response performance",
        comparisons: [
          { name: "Crown Street", value: 92 },
          { name: "Castle Wharf", value: 88 },
          { name: "The Blade", value: 81 },
          { name: "Three60", value: 76 },
          { name: "Bankside", value: 71 },
          { name: "Vista River Gardens", value: 68 },
          { name: "Deansgate Square", value: 62 },
        ],
        outcomeNote: "Illustrative comparison for story flow.",
      },
      {
        id: "mgmt-close",
        kind: "outcome",
        outcomeValue: "",
        outcomeLabel: "Captured untapped insight — at your fingertips.",
        verified: true,
      },
    ],
  },
];

export interface ChapterTiming {
  phase: TowerPhase;
  profileVisible: boolean;
  featureVisible: boolean;
  /** 0–1 progress across featureStates */
  featureStateIndex: number;
  cameraCalm: boolean;
}

/** Map local chapter progress 0–1 → UI / camera phase */
export function resolveChapterTiming(
  localT: number,
  opts?: { estateWide?: boolean; firstChapter?: boolean },
): ChapterTiming {
  const t = Math.max(0, Math.min(1, localT));
  const estateWide = opts?.estateWide === true;
  // Architecture-only hold after arrival — then profile, then feature
  const arriveEnd = opts?.firstChapter ? 0.28 : 0.18;
  const profileEnd = opts?.firstChapter ? 0.4 : 0.3;

  // Estate pull-out: architecture → estate profile card → feature states (same as towers)
  if (estateWide) {
    if (t < 0.12) {
      return {
        phase: "arrive",
        profileVisible: false,
        featureVisible: false,
        featureStateIndex: 0,
        cameraCalm: false,
      };
    }
    if (t < 0.26) {
      return {
        phase: "profile",
        profileVisible: true,
        featureVisible: false,
        featureStateIndex: 0,
        cameraCalm: true,
      };
    }
    if (t < 0.9) {
      const featureSpan = (t - 0.26) / 0.64;
      return {
        phase: featureSpan > 0.75 ? "outcome" : "feature",
        profileVisible: true,
        featureVisible: true,
        featureStateIndex: featureSpan,
        cameraCalm: true,
      };
    }
    return {
      phase: t < 0.96 ? "clearing" : "depart",
      profileVisible: false,
      featureVisible: false,
      featureStateIndex: 1,
      cameraCalm: t < 0.93,
    };
  }

  if (t < arriveEnd) {
    return {
      phase: "arrive",
      profileVisible: false,
      featureVisible: false,
      featureStateIndex: 0,
      cameraCalm: false,
    };
  }
  if (t < profileEnd) {
    return {
      phase: "profile",
      profileVisible: true,
      featureVisible: false,
      featureStateIndex: 0,
      cameraCalm: true,
    };
  }
  if (t < 0.82) {
    // Feature states after profile; outcome held toward end of this band
    const featureSpan = (t - profileEnd) / (0.82 - profileEnd);
    return {
      phase: featureSpan > 0.85 ? "outcome" : "feature",
      profileVisible: true,
      featureVisible: true,
      featureStateIndex: featureSpan,
      cameraCalm: true,
    };
  }
  if (t < 0.9) {
    return {
      phase: "clearing",
      profileVisible: true,
      featureVisible: false,
      featureStateIndex: 1,
      cameraCalm: true,
    };
  }
  if (t < 0.96) {
    return {
      phase: "clearing",
      profileVisible: false,
      featureVisible: false,
      featureStateIndex: 1,
      cameraCalm: false,
    };
  }
  return {
    phase: "depart",
    profileVisible: false,
    featureVisible: false,
    featureStateIndex: 1,
    cameraCalm: false,
  };
}

export function featureStateForProgress(
  chapter: TowerChapter,
  normalizedStateProgress: number,
): FeatureState {
  const states = chapter.featureStates;
  if (states.length === 0) {
    return {
      id: "empty",
      kind: "outcome",
      outcomeValue: "",
      outcomeLabel: "",
    };
  }
  const idx = Math.min(
    states.length - 1,
    Math.floor(normalizedStateProgress * states.length),
  );
  return states[idx];
}

/** One chargeable beat in the stepped estate tour */
export interface TowerBeat {
  id: string;
  chapterIndex: number;
  phase: TowerPhase;
  /** Discrete index into chapter.featureStates */
  featureStateIndex: number;
  profileVisible: boolean;
  featureVisible: boolean;
  cameraCalm: boolean;
  /** Mild camera progress within the chapter (0–1) */
  chapterLocal: number;
}

/** Discrete arrive → profile → feature states → clear beats (no free-scroll skipping) */
export function buildTowerBeats(): TowerBeat[] {
  const beats: TowerBeat[] = [];

  towerChapters.forEach((chapter, chapterIndex) => {
    const states = chapter.featureStates;
    const last = Math.max(0, states.length - 1);

    beats.push({
      id: `${chapter.id}-arrive`,
      chapterIndex,
      phase: "arrive",
      featureStateIndex: 0,
      profileVisible: false,
      featureVisible: false,
      cameraCalm: false,
      chapterLocal: 0.06,
    });

    beats.push({
      id: `${chapter.id}-profile`,
      chapterIndex,
      phase: "profile",
      featureStateIndex: 0,
      profileVisible: true,
      featureVisible: false,
      cameraCalm: true,
      chapterLocal: 0.22,
    });

    states.forEach((_, i) => {
      beats.push({
        id: `${chapter.id}-state-${i}`,
        chapterIndex,
        phase: i >= last ? "outcome" : "feature",
        featureStateIndex: i,
        profileVisible: true,
        featureVisible: true,
        cameraCalm: true,
        chapterLocal: 0.34 + (i / Math.max(1, states.length)) * 0.48,
      });
    });

    beats.push({
      id: `${chapter.id}-clear`,
      chapterIndex,
      phase: "clearing",
      featureStateIndex: last,
      profileVisible: false,
      featureVisible: false,
      cameraCalm: true,
      chapterLocal: 0.94,
    });
  });

  return beats;
}

export const towerBeats = buildTowerBeats();
