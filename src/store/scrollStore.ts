"use client";

import { create } from "zustand";
import type { SectionId } from "@/config/caseStudy";
import type { AnchorName } from "@/config/scene";

export type SceneMode =
  | "loading"
  | "cover"
  | "reveal"
  | "approach"
  | "overview"
  | "estate"
  | "estate-overview"
  | "quiet"
  | "dhs"
  | "home"
  | "doorly"
  | "trsre"
  | "finale";

/** Cinematic = camera may move; editorial = settle for reading */
export type AttentionMode = "cinematic" | "editorial";

interface ScrollState {
  progress: number;
  sectionId: SectionId | "loader";
  sectionProgress: number;
  sceneMode: SceneMode;
  attentionMode: AttentionMode;
  /** 0 = dark cover world, 1 = bright architectural Manchester */
  coverReveal: number;
  activeDevelopment: AnchorName | null;
  /** 0–1 progress within the active building's estate slice */
  estateBuildingProgress: number;
  /** Index into towerChapters during the estate tour */
  towerChapterIndex: number;
  /** 0–1 progress within the active tower chapter */
  towerLocalProgress: number;
  towerProfileVisible: boolean;
  towerFeatureVisible: boolean;
  /** When true, CameraDirector keeps framing nearly still for reading */
  towerCameraCalm: boolean;
  /**
   * True once the live camera has reached the current tower/estate framing.
   * Overlay cards must wait for this — scroll progress alone is not enough.
   */
  towerCameraSettled: boolean;
  /** Discrete feature-state index within the active chapter */
  towerFeatureStateIndex: number;
  /** Index into towerBeats when the stepped tour is active */
  towerBeatIndex: number;
  /** When true, wheel is charged per-beat (prologue-style) instead of free scroll */
  towerTourStepped: boolean;
  /**
   * Post-management bridge: “Beyond the buildings” holds on the estate frame
   * before the camera drops into the Digital High Street city view.
   */
  storyBridge: "none" | "beyond";
  activeBusinesses: AnchorName[];
  /** Beat 4 — scatter purple pulses across the city while queries list */
  dhsVisionPulse: boolean;
  /** After Breakout — hold the risen overlook through remaining DHS beats */
  dhsBreakoutRise: boolean;
  /** TRSRE pin showcase beat onward — map pins visible in FOV */
  trsreShowPins: boolean;
  cityAwake: number;
  dhsIntensity: number;
  trsreIntensity: number;
  doorlyIntensity: number;
  haze: number;
  orbReveal: number;
  loaderDone: boolean;
  /** Prologue finished — unlocks existing V1 scroll/camera story */
  experienceStarted: boolean;
  /** Auto-scroll into the first city view after Start — blocks user scroll */
  demoIntroLock: boolean;
  /** Post-intro prompt: scroll to continue the estate tour */
  scrollCueVisible: boolean;
  /** Bump to force CameraDirector to hard-cut to the current composition */
  cameraSnapNonce: number;
  modelLoadingState: "idle" | "loading" | "ready" | "fallback";
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  qualityProfile: "desktop" | "mobile" | "reduced";
  setProgress: (v: number) => void;
  setSection: (id: SectionId | "loader", progress?: number) => void;
  setSceneMode: (mode: SceneMode) => void;
  setAttentionMode: (mode: AttentionMode) => void;
  setCoverReveal: (v: number) => void;
  setActiveDevelopment: (a: AnchorName | null) => void;
  setEstateBuildingProgress: (v: number) => void;
  setTowerJourney: (
    partial: Partial<{
      towerChapterIndex: number;
      towerLocalProgress: number;
      towerProfileVisible: boolean;
      towerFeatureVisible: boolean;
      towerCameraCalm: boolean;
      towerCameraSettled: boolean;
      towerFeatureStateIndex: number;
      towerBeatIndex: number;
    }>,
  ) => void;
  setTowerCameraSettled: (v: boolean) => void;
  setTowerTourStepped: (v: boolean) => void;
  setStoryBridge: (v: ScrollState["storyBridge"]) => void;
  setActiveBusinesses: (a: AnchorName[]) => void;
  setDhsVisionPulse: (v: boolean) => void;
  setDhsBreakoutRise: (v: boolean) => void;
  setTrsreShowPins: (v: boolean) => void;
  setCityAwake: (v: number) => void;
  setDhsIntensity: (v: number) => void;
  setTrsreIntensity: (v: number) => void;
  setDoorlyIntensity: (v: number) => void;
  setHaze: (v: number) => void;
  setOrbReveal: (v: number) => void;
  setLoaderDone: (v: boolean) => void;
  setExperienceStarted: (v: boolean) => void;
  setDemoIntroLock: (v: boolean) => void;
  setScrollCueVisible: (v: boolean) => void;
  requestCameraSnap: () => void;
  setModelLoadingState: (s: ScrollState["modelLoadingState"]) => void;
  setCameraDebug: (
    position: [number, number, number],
    target: [number, number, number],
  ) => void;
  setQualityProfile: (p: ScrollState["qualityProfile"]) => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  progress: 0,
  sectionId: "loader",
  sectionProgress: 0,
  sceneMode: "loading",
  attentionMode: "cinematic",
  coverReveal: 0,
  activeDevelopment: null,
  estateBuildingProgress: 0,
  towerChapterIndex: 0,
  towerLocalProgress: 0,
  towerProfileVisible: false,
  towerFeatureVisible: false,
  towerCameraCalm: false,
  towerCameraSettled: false,
  towerFeatureStateIndex: 0,
  towerBeatIndex: 0,
  towerTourStepped: false,
  storyBridge: "none",
  activeBusinesses: [],
  dhsVisionPulse: false,
  dhsBreakoutRise: false,
  trsreShowPins: false,
  cityAwake: 0,
  dhsIntensity: 0,
  trsreIntensity: 0,
  doorlyIntensity: 0,
  haze: 0,
  orbReveal: 0,
  loaderDone: false,
  experienceStarted: false,
  demoIntroLock: false,
  scrollCueVisible: false,
  cameraSnapNonce: 0,
  modelLoadingState: "fallback",
  cameraPosition: [80, 520, 780],
  cameraTarget: [0, 40, 0],
  qualityProfile: "desktop",
  setProgress: (progress) => set({ progress }),
  setSection: (sectionId, sectionProgress = 0) =>
    set({ sectionId, sectionProgress }),
  setSceneMode: (sceneMode) => set({ sceneMode }),
  setAttentionMode: (attentionMode) => set({ attentionMode }),
  setCoverReveal: (coverReveal) => set({ coverReveal }),
  setActiveDevelopment: (activeDevelopment) => set({ activeDevelopment }),
  setEstateBuildingProgress: (estateBuildingProgress) =>
    set({ estateBuildingProgress }),
  setTowerJourney: (partial) => set(partial),
  setTowerCameraSettled: (towerCameraSettled) => set({ towerCameraSettled }),
  setTowerTourStepped: (towerTourStepped) => set({ towerTourStepped }),
  setStoryBridge: (storyBridge) => set({ storyBridge }),
  setActiveBusinesses: (activeBusinesses) => set({ activeBusinesses }),
  setDhsVisionPulse: (dhsVisionPulse) => set({ dhsVisionPulse }),
  setDhsBreakoutRise: (dhsBreakoutRise) => set({ dhsBreakoutRise }),
  setTrsreShowPins: (trsreShowPins) => set({ trsreShowPins }),
  setCityAwake: (cityAwake) => set({ cityAwake }),
  setDhsIntensity: (dhsIntensity) => set({ dhsIntensity }),
  setTrsreIntensity: (trsreIntensity) => set({ trsreIntensity }),
  setDoorlyIntensity: (doorlyIntensity) => set({ doorlyIntensity }),
  setHaze: (haze) => set({ haze }),
  setOrbReveal: (orbReveal) => set({ orbReveal }),
  setLoaderDone: (loaderDone) => set({ loaderDone }),
  setExperienceStarted: (experienceStarted) => set({ experienceStarted }),
  setDemoIntroLock: (demoIntroLock) => set({ demoIntroLock }),
  setScrollCueVisible: (scrollCueVisible) => set({ scrollCueVisible }),
  requestCameraSnap: () =>
    set((s) => ({ cameraSnapNonce: s.cameraSnapNonce + 1 })),
  setModelLoadingState: (modelLoadingState) => set({ modelLoadingState }),
  setCameraDebug: (cameraPosition, cameraTarget) =>
    set({ cameraPosition, cameraTarget }),
  setQualityProfile: (qualityProfile) => set({ qualityProfile }),
}));
