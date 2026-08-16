/**
 * Scene / 3D asset configuration.
 *
 * Manchester.glb ships at Blender export scale 0.01 (OSM).
 * We apply cityWorldScale (100) so Renaker towers (metric) sit in situ.
 *
 * Named ANCHOR_* nodes are preferred when present in the GLB.
 * Until then, TEMPORARY fallbacks (city-metre space) are used.
 */

export type AnchorName =
  | "ANCHOR_DGS"
  | "ANCHOR_360"
  | "ANCHOR_BLADE"
  | "ANCHOR_VRG"
  | "ANCHOR_CROWNST"
  | "ANCHOR_BANKSIDE"
  | "ANCHOR_CW"
  | "ANCHOR_BIZ1"
  | "ANCHOR_BIZ2"
  | "ANCHOR_BIZ3";

export const RENAKER_ANCHORS: AnchorName[] = [
  "ANCHOR_DGS",
  "ANCHOR_360",
  "ANCHOR_BLADE",
  "ANCHOR_VRG",
  "ANCHOR_CROWNST",
  "ANCHOR_BANKSIDE",
  "ANCHOR_CW",
];

export const BUSINESS_ANCHORS: AnchorName[] = [
  "ANCHOR_BIZ1",
  "ANCHOR_BIZ2",
  "ANCHOR_BIZ3",
];

export const ALL_ANCHORS: AnchorName[] = [
  ...RENAKER_ANCHORS,
  ...BUSINESS_ANCHORS,
];

/** Configurable asset paths — update filenames here when finals land. */
export const sceneAssets = {
  /** Manchester (1).glb — correct ANCHOR_* empties including ANCHOR_BLADE/360 */
  manchester: "/models/manchester.glb?v=manchester1",
  renaker: {
    ANCHOR_DGS: "/models/renaker/dgs.glb",
    // Blade + Three60 ship as one combined GLB for now
    ANCHOR_360: "/models/renaker/blade-three60.glb",
    ANCHOR_BLADE: "/models/renaker/blade-three60.glb",
    ANCHOR_VRG: "/models/renaker/vrg.glb",
    ANCHOR_CROWNST: "/models/renaker/crownst.glb",
    ANCHOR_BANKSIDE: "/models/renaker/bankside.glb",
    ANCHOR_CW: "/models/renaker/cw.glb",
  } as Partial<Record<AnchorName, string>>,
  aiylaOrb: "/models/aiyla-orb.glb",
  enableGlbLoading: true,
};

/**
 * Manchester GLB node scale is 0.01. Multiplying the city root by 100
 * restores approximate metre space so Renaker tower GLBs sit correctly.
 */
export const cityWorldScale = 100;

/**
 * TEMPORARY FALLBACK ANCHOR COORDINATES — DEVELOPMENT ONLY
 * Units: city-metre space (after cityWorldScale).
 * Replace automatically when named ANCHOR_* nodes exist in manchester.glb.
 */
export const TEMPORARY_FALLBACK_ANCHORS: Record<
  AnchorName,
  [number, number, number]
> = {
  ANCHOR_DGS: [-280, 0, 220],
  ANCHOR_360: [-120, 0, -340],
  ANCHOR_BLADE: [160, 0, -420],
  ANCHOR_VRG: [420, 0, -140],
  ANCHOR_CROWNST: [380, 0, 320],
  ANCHOR_BANKSIDE: [-80, 0, 480],
  ANCHOR_CW: [-520, 0, -80],
  ANCHOR_BIZ1: [60, 0, 120],
  ANCHOR_BIZ2: [-220, 0, 40],
  ANCHOR_BIZ3: [200, 0, -100],
};

/** Unique tower GLB entries (Blade/Three60 share one file). */
export const renakerModelEntries: {
  id: string;
  path: string;
  anchors: AnchorName[];
  /** Place at this anchor (combined models use one placement) */
  placeAt: AnchorName;
  /** Object names to hide (oversized site pads, leftovers, etc.) */
  hideObjectNames?: string[];
  /** Material names to strip (site pads that spill past the tower) */
  hideMaterialNames?: string[];
}[] = [
  {
    id: "dgs",
    path: "/models/renaker/dgs.glb",
    anchors: ["ANCHOR_DGS"],
    placeAt: "ANCHOR_DGS",
  },
  {
    id: "blade-three60",
    path: "/models/renaker/blade-three60.glb",
    anchors: ["ANCHOR_BLADE", "ANCHOR_360"],
    placeAt: "ANCHOR_BLADE",
  },
  {
    id: "vrg",
    path: "/models/renaker/vrg.glb",
    anchors: ["ANCHOR_VRG"],
    placeAt: "ANCHOR_VRG",
  },
  {
    id: "crownst",
    path: "/models/renaker/crownst.glb?v=nopad2",
    anchors: ["ANCHOR_CROWNST"],
    placeAt: "ANCHOR_CROWNST",
    // Oversized dark site pads that spill past the tower footprint
    hideObjectNames: ["Plane.077", "Plane.078"],
    hideMaterialNames: ["Scan Street dirt tiles"],
  },
  {
    id: "bankside",
    path: "/models/renaker/bankside.glb",
    anchors: ["ANCHOR_BANKSIDE"],
    placeAt: "ANCHOR_BANKSIDE",
  },
  {
    id: "cw",
    path: "/models/renaker/cw.glb",
    anchors: ["ANCHOR_CW"],
    placeAt: "ANCHOR_CW",
  },
];

export type QualityProfile = "desktop" | "mobile" | "reduced";

export const qualityProfiles = {
  desktop: {
    dpr: 1 as number | [number, number],
    shadows: false,
    maxTrsrePins: 15,
    maxDhsPaths: 4,
    postprocessing: false,
    cityDensity: 1,
  },
  mobile: {
    dpr: 1 as number | [number, number],
    shadows: false,
    maxTrsrePins: 12,
    maxDhsPaths: 2,
    postprocessing: false,
    cityDensity: 0.55,
  },
  reduced: {
    dpr: 1 as number | [number, number],
    shadows: false,
    maxTrsrePins: 10,
    maxDhsPaths: 1,
    postprocessing: false,
    cityDensity: 0.4,
  },
} as const;

export const cameraDefaults = {
  fov: 42,
  near: 1,
  far: 6000,
  /** Wide establishing shot over Manchester */
  overview: {
    position: [80, 520, 780] as [number, number, number],
    target: [0, 40, 0] as [number, number, number],
  },
  /** Closer tower framing offset relative to an anchor (metres) */
  towerOffset: {
    position: [140, 160, 220] as [number, number, number],
    lookAtY: 90,
  },
};

export const trsrePinConfig = {
  count: 42,
  seed: 20260809,
  spreadX: 900,
  spreadZ: 900,
  minY: 55,
  maxY: 140,
};
