"use client";

import { useEffect } from "react";
import { useReducedMotion } from "./useReducedMotion";
import { useScrollStore } from "@/store/scrollStore";
import { qualityProfiles, type QualityProfile } from "@/config/scene";

function detectProfile(reduced: boolean): QualityProfile {
  if (reduced) return "reduced";
  if (typeof window === "undefined") return "desktop";
  return window.matchMedia("(max-width: 768px)").matches ? "mobile" : "desktop";
}

export function useQualityProfile() {
  const reduced = useReducedMotion();
  const setQualityProfile = useScrollStore((s) => s.setQualityProfile);
  const profile = useScrollStore((s) => s.qualityProfile);

  useEffect(() => {
    const apply = () => setQualityProfile(detectProfile(reduced));
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [reduced, setQualityProfile]);

  return { profile, settings: qualityProfiles[profile], reduced };
}
