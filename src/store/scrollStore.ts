"use client";

import { create } from "zustand";
import type { SectionId } from "@/config/caseStudy";
import type { AnchorName } from "@/config/scene";

export type SceneMode =
  | "loading"
  | "cover"
  | "reveal"
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
  activeBusinesses: AnchorName[];
  cityAwake: number;
  dhsIntensity: number;
  trsreIntensity: number;
  doorlyIntensity: number;
  haze: number;
  orbReveal: number;
  loaderDone: boolean;
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
  setActiveBusinesses: (a: AnchorName[]) => void;
  setCityAwake: (v: number) => void;
  setDhsIntensity: (v: number) => void;
  setTrsreIntensity: (v: number) => void;
  setDoorlyIntensity: (v: number) => void;
  setHaze: (v: number) => void;
  setOrbReveal: (v: number) => void;
  setLoaderDone: (v: boolean) => void;
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
  activeBusinesses: [],
  cityAwake: 0,
  dhsIntensity: 0,
  trsreIntensity: 0,
  doorlyIntensity: 0,
  haze: 0,
  orbReveal: 0,
  loaderDone: false,
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
  setActiveBusinesses: (activeBusinesses) => set({ activeBusinesses }),
  setCityAwake: (cityAwake) => set({ cityAwake }),
  setDhsIntensity: (dhsIntensity) => set({ dhsIntensity }),
  setTrsreIntensity: (trsreIntensity) => set({ trsreIntensity }),
  setDoorlyIntensity: (doorlyIntensity) => set({ doorlyIntensity }),
  setHaze: (haze) => set({ haze }),
  setOrbReveal: (orbReveal) => set({ orbReveal }),
  setLoaderDone: (loaderDone) => set({ loaderDone }),
  setModelLoadingState: (modelLoadingState) => set({ modelLoadingState }),
  setCameraDebug: (cameraPosition, cameraTarget) =>
    set({ cameraPosition, cameraTarget }),
  setQualityProfile: (qualityProfile) => set({ qualityProfile }),
}));
