import type { AnchorName } from "./scene";

export type OverlaySide = "left" | "right";

export interface LiveActivityItem {
  time: string;
  title: string;
  detail: string;
}

export interface DevelopmentCamera {
  /** Camera offset from anchor at arrival (metres) */
  arrivalOffset: [number, number, number];
  /** Orbit sweep in degrees around the tower (Y axis) */
  orbitStartDeg: number;
  orbitEndDeg: number;
  /** Look-at offset from anchor */
  targetOffset: [number, number, number];
  fov: number;
  overlaySide: OverlaySide;
}

export interface DevelopmentPlacement {
  /** Fine-tune after anchor (metres) */
  offset: [number, number, number];
  /** Extra yaw on top of anchor rotation (degrees) */
  yawDeg: number;
  scale: number;
}

export interface Development {
  id: string;
  anchor: AnchorName;
  name: string;
  location: string;
  homes: string;
  statusLine: string;
  shortLine: string;
  image: string;
  imageAlt: string;
  tempHeight: number;
  tempColor: string;
  placement: DevelopmentPlacement;
  camera: DevelopmentCamera;
  liveFeed: LiveActivityItem[];
}

const defaultPlacement = (): DevelopmentPlacement => ({
  offset: [0, 0, 0],
  yawDeg: 0,
  scale: 1,
});

/**
 * Seven-development estate tour.
 * Camera + live feeds are art-directed per building.
 */
export const developments: Development[] = [
  {
    id: "deansgate-square",
    anchor: "ANCHOR_DGS",
    name: "Deansgate Square",
    location: "Manchester",
    homes: "1,508 homes",
    statusLine: "Live on Renaker Life",
    shortLine: "Four towers. One connected experience.",
    image: "/images/developments/dgs.png",
    imageAlt: "Deansgate Square residential towers in Manchester",
    tempHeight: 28,
    tempColor: "#3a3a3e",
    placement: defaultPlacement(),
    camera: {
      arrivalOffset: [180, 140, 240],
      orbitStartDeg: -12,
      orbitEndDeg: 28,
      targetOffset: [0, 95, 0],
      fov: 40,
      overlaySide: "left",
    },
    liveFeed: [
      {
        time: "14:32",
        title: "Parcel processed",
        detail: "Resident automatically notified",
      },
      {
        time: "14:31",
        title: "AI request resolved",
        detail: "No staff intervention",
      },
      {
        time: "14:29",
        title: "Maintenance request",
        detail: "Routed to Building Team",
      },
    ],
  },
  {
    id: "three60",
    anchor: "ANCHOR_360",
    name: "Three60",
    location: "Manchester",
    homes: "443 homes",
    statusLine: "Live on Renaker Life",
    shortLine: "A landmark on the skyline.",
    image: "/images/developments/three60.png",
    imageAlt: "Three60 residential tower in Manchester",
    tempHeight: 22,
    tempColor: "#4a4550",
    placement: defaultPlacement(),
    camera: {
      arrivalOffset: [150, 155, 200],
      orbitStartDeg: -8,
      orbitEndDeg: 32,
      targetOffset: [0, 100, 0],
      fov: 38,
      overlaySide: "right",
    },
    liveFeed: [
      {
        time: "11:18",
        title: "Amenity booking",
        detail: "Sky lounge confirmed",
      },
      {
        time: "11:14",
        title: "Event registration",
        detail: "Resident signed up",
      },
      {
        time: "11:02",
        title: "Announcement delivered",
        detail: "Building-wide notice",
      },
    ],
  },
  {
    id: "the-blade",
    anchor: "ANCHOR_BLADE",
    name: "The Blade",
    location: "Manchester",
    homes: "414 homes",
    statusLine: "Live on Renaker Life",
    shortLine: "Precision living, connected operations.",
    image: "/images/developments/the-blade.png",
    imageAlt: "The Blade residential tower in Manchester",
    tempHeight: 24,
    tempColor: "#2f3438",
    placement: defaultPlacement(),
    camera: {
      arrivalOffset: [130, 150, 210],
      orbitStartDeg: -18,
      orbitEndDeg: 22,
      targetOffset: [0, 92, 0],
      fov: 39,
      overlaySide: "left",
    },
    liveFeed: [
      {
        time: "09:47",
        title: "Service request",
        detail: "AI categorised",
      },
      {
        time: "09:46",
        title: "Task created",
        detail: "Routed to Building Team",
      },
      {
        time: "09:40",
        title: "Resident update",
        detail: "ETA shared automatically",
      },
    ],
  },
  {
    id: "vista-river-gardens",
    anchor: "ANCHOR_VRG",
    name: "Vista River Gardens",
    location: "Manchester",
    homes: "484 homes",
    statusLine: "Live on Renaker Life",
    shortLine: "Riverside living, digitally linked.",
    image: "/images/developments/vrg.png",
    imageAlt: "Vista River Gardens in Manchester",
    tempHeight: 20,
    tempColor: "#3d4248",
    placement: defaultPlacement(),
    camera: {
      arrivalOffset: [200, 130, 180],
      orbitStartDeg: -22,
      orbitEndDeg: 18,
      targetOffset: [0, 80, 0],
      fov: 41,
      overlaySide: "right",
    },
    liveFeed: [
      {
        time: "16:05",
        title: "Marketplace listing",
        detail: "Neighbour-to-neighbour",
      },
      {
        time: "15:58",
        title: "Concierge question",
        detail: "AI answered instantly",
      },
      {
        time: "15:51",
        title: "Community post",
        detail: "Building chat active",
      },
    ],
  },
  {
    id: "crown-street",
    anchor: "ANCHOR_CROWNST",
    name: "Crown Street",
    location: "Manchester",
    homes: "664 homes",
    statusLine: "Live on Renaker Life",
    shortLine: "Neighbourhood scale, estate intelligence.",
    image: "/images/developments/crown-st.png",
    imageAlt: "Crown Street residential towers in Manchester",
    tempHeight: 18,
    tempColor: "#454048",
    placement: defaultPlacement(),
    camera: {
      arrivalOffset: [170, 135, 230],
      orbitStartDeg: -10,
      orbitEndDeg: 40,
      targetOffset: [0, 85, 0],
      fov: 40,
      overlaySide: "left",
    },
    liveFeed: [
      {
        time: "13:22",
        title: "Parcel activity",
        detail: "Reception processed",
      },
      {
        time: "13:18",
        title: "Contractor task",
        detail: "Access arranged",
      },
      {
        time: "13:11",
        title: "Communication sent",
        detail: "Residents notified",
      },
    ],
  },
  {
    id: "bankside",
    anchor: "ANCHOR_BANKSIDE",
    name: "Bankside",
    location: "Manchester",
    homes: "444 homes",
    statusLine: "Live on Renaker Life",
    shortLine: "Colliers Yard, connected.",
    image: "/images/developments/bankside.png",
    imageAlt: "Bankside residential tower in Manchester",
    tempHeight: 21,
    tempColor: "#383c42",
    placement: defaultPlacement(),
    camera: {
      arrivalOffset: [160, 145, 190],
      orbitStartDeg: -25,
      orbitEndDeg: 15,
      targetOffset: [0, 88, 0],
      fov: 39,
      overlaySide: "right",
    },
    liveFeed: [
      {
        time: "10:08",
        title: "Resident onboarding",
        detail: "Welcome journey started",
      },
      {
        time: "10:04",
        title: "AI conversation",
        detail: "Move-in question resolved",
      },
      {
        time: "09:55",
        title: "Amenity activity",
        detail: "Gym booking confirmed",
      },
    ],
  },
  {
    id: "castle-wharf",
    anchor: "ANCHOR_CW",
    name: "Castle Wharf",
    location: "Manchester",
    homes: "188 homes",
    statusLine: "Live on Renaker Life",
    shortLine: "Canal-side living, one platform.",
    image: "/images/developments/castle-wharf.png",
    imageAlt: "Castle Wharf beside Castlefield canal basin",
    tempHeight: 14,
    tempColor: "#41464c",
    placement: defaultPlacement(),
    camera: {
      arrivalOffset: [140, 120, 200],
      orbitStartDeg: -14,
      orbitEndDeg: 26,
      targetOffset: [0, 70, 0],
      fov: 42,
      overlaySide: "left",
    },
    liveFeed: [
      {
        time: "08:41",
        title: "Management insight",
        detail: "Portfolio signal raised",
      },
      {
        time: "08:36",
        title: "Operational activity",
        detail: "Task completed on site",
      },
      {
        time: "08:29",
        title: "Resident communication",
        detail: "Building notice delivered",
      },
    ],
  },
];

export function getDevelopmentByAnchor(anchor: AnchorName) {
  return developments.find((d) => d.anchor === anchor);
}
