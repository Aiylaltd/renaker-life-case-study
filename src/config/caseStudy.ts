export const seo = {
  title: "Renaker Life — Connected Living Across Manchester | Aiyla",
  description:
    "How Renaker is creating one connected resident experience across Manchester — buildings, neighbourhood and city — powered by Aiyla.",
  ogImage: "/images/og/renaker-life-og.svg",
  url: "https://aiyla.co.uk/case-studies/renaker-life",
  siteName: "Aiyla",
};

export const brand = {
  product: "Renaker Life",
  poweredBy: "Aiyla",
  positioning: "The AI Operating System for Buildings",
  oneLiner: "One intelligent platform",
};

export const loaderMessages = [
  "Setting foundations…",
  "Building scenery…",
  "Raising towers…",
  "Laying roads…",
  "Connecting pathways…",
  "Switching on the lights…",
  "Connecting residents…",
  "Routing requests…",
  "Teaching the buildings…",
  "Opening the high street…",
  "Checking the lifts…",
  "Finding the good coffee…",
  "Bringing Manchester online…",
  "Almost home…",
];

/** Indices treated as occasional humour (understated) */
export const loaderHumourIndices = [11];

export const loaderComplete = {
  welcome: "Welcome home",
};

export const cover = {
  eyebrow: "Case study",
  title: "Renaker Life",
  supporting:
    "The resident, concierge and management platform connecting Renaker's communities across Manchester.",
  poweredBy: "Powered by Aiyla AI.",
  scrollHint: "Scroll to enter",
};

export const sections = {
  cover: {
    id: "cover",
  },
  hero: {
    id: "hero",
    headline: "Seven developments.\nOne connected estate.",
    supporting:
      "A slow architectural journey through Renaker's Manchester communities — each live on Renaker Life.",
    estateLine: "This is not a single-building pilot. This is a connected estate.",
    overviewLine: "One estate. Thousands of daily interactions.",
  },
  problem: {
    id: "problem",
    headline: "Too many channels.\nToo little connection.",
    body: "Residents and building teams were managing interactions across many different channels, systems and processes.",
    resolvedHeadline: "One experience.\nPowered by AI.",
    resolvedBody:
      "Renaker Life brought the resident experience, concierge/building operations and management into one connected platform powered by Aiyla AI.",
    channels: [
      "Email",
      "Resident requests",
      "Maintenance",
      "Parcels",
      "Announcements",
      "Amenities",
      "Events",
      "Community",
      "Staff tasks",
      "Concierge",
    ],
  },
  dhsEarly: {
    id: "dhs-early",
    bridge: "Life doesn't stop at the front door.",
    headline: "The Digital High Street",
    body: "Local bricks-and-mortar businesses build a meaningful digital footprint inside Renaker Life. Structured local data becomes searchable by AI.",
    askHeadline: "Ask your neighbourhood.",
    businessHeadline: "A digital footprint for the physical high street.",
    businessBody:
      "Businesses can understand how nearby residents discover and engage with them — and begin building a direct digital relationship with the surrounding community.",
  },
  resident: {
    id: "resident",
    bridge: "Resident experience",
    headline: "Everything residents need to communicate, solve problems, interact with their community and experience their neighbourhood.",
    conciergeHeadline: "Ask. Solve. Move on.",
    marketplaceHeadline: "More than an address.",
    serviceHeadline: "From problem to the right person.",
  },
  staff: {
    id: "staff",
    bridge: "Concierge & building teams",
    headline: "One operational workspace for requests, parcels, tasks, communications and day-to-day building activity.",
    supporting: "Prioritised work. Clear ownership. Automatic updates.",
  },
  management: {
    id: "management",
    bridge: "Management intelligence",
    headline: "From information to intelligence.",
    prompt:
      "Summarise recurring resident complaints from the last six months and identify the three operational improvements likely to have the greatest impact.",
    note: "Representative example — not a fabricated case-study report.",
  },
  results: {
    id: "results",
    headline: "Results that matter.",
  },
  doorly: {
    id: "doorly",
  },
  dhsDeep: {
    id: "dhs-deep",
    bridge: "And the connection works both ways.",
    headline: "Be discoverable for what makes you different.",
    supporting: "Turn nearby residents into an engaged local audience.",
    notOffers:
      "This is not simply offers. Local brick-and-mortar businesses create rich digital profiles AI can search naturally.",
  },
  trsre: {
    id: "trsre",
  },
  placemaking: {
    id: "placemaking",
    headline: "Residential communities can power local communities.",
    lines: [
      "Discovery for residents.",
      "Customers for local businesses.",
      "Income for local providers.",
      "More exploration.",
      "Stronger places.",
    ],
    philosophy:
      "Technology should not pull residents away from the places they live. It should help them experience them.",
  },
  videos: {
    id: "videos",
    headline: "People behind the platform.",
  },
  finale: {
    id: "finale",
    brand: "Aiyla",
    line: "The intelligence behind Renaker Life.",
    supporting: "Connecting buildings, residents and the city around them.",
  },
} as const;

/** Locked V2 narrative order */
export const sectionOrder = [
  "cover",
  "hero",
  "problem",
  "resident",
  "staff",
  "management",
  "results",
  "dhs-early",
  "dhs-deep",
  "doorly",
  "trsre",
  "placemaking",
  "videos",
  "finale",
] as const;

export type SectionId = (typeof sectionOrder)[number];

export const residentChatDemo = {
  messages: [
    { from: "resident" as const, text: "My hob won't turn on?" },
    {
      from: "ai" as const,
      text: "It sounds like the child lock may be active. Hold the lock icon for around five seconds and try again.",
    },
    { from: "resident" as const, text: "Thanks, that's it!" },
  ],
};

export const marketplaceDemo = {
  title: "Dining table",
  price: "£120",
  seller: "Resident · Deansgate Square",
  chat: [
    { from: "buyer" as const, text: "Is this still available?" },
    { from: "seller" as const, text: "Yes — collection tonight works." },
  ],
};

export const serviceRequestDemo = {
  request: "There's water leaking underneath my kitchen sink.",
  steps: [
    "Resident request",
    "AI understands",
    "Severity determined",
    "Task created",
    "Routed to staff",
    "Staff assigned",
  ],
};

export const staffFlowDemo = {
  steps: [
    { label: "Task arrives", detail: "Leak — kitchen sink · High" },
    { label: "Prioritised", detail: "Assigned to building team" },
    { label: "In progress", detail: "Resident notified automatically" },
    { label: "Complete", detail: "Closed with photo confirmation" },
  ],
};

export const managementReportDemo = {
  issues: [
    {
      id: "01",
      title: "Lift communications during downtime",
    },
    {
      id: "02",
      title: "Parcel congestion during peak evening hours",
    },
    {
      id: "03",
      title: "Amenity-booking confusion",
    },
  ],
  actions: [
    "Proactive lift-status messaging templates for residents",
    "Staggered parcel collection windows and locker capacity alerts",
    "Simplified amenity booking flow with clearer availability cues",
  ],
};
