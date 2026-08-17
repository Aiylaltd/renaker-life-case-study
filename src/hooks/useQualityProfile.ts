"use client";

import { useEffect } from "react";
import { useReducedMotion } from "./useReducedMotion";
import { isMobileUiViewport, MOBILE_UI_MEDIA } from "./useIsMobileUi";
import { useScrollStore } from "@/store/scrollStore";
import { qualityProfiles, type QualityProfile } from "@/config/scene";

function detectProfile(reduced: boolean): QualityProfile {
  if (reduced) return "reduced";
  if (typeof window === "undefined") return "desktop";
  return isMobileUiViewport() ? "mobile" : "desktop";
}

export function useQualityProfile() {
  const reduced = useReducedMotion();
  const setQualityProfile = useScrollStore((s) => s.setQualityProfile);
  const profile = useScrollStore((s) => s.qualityProfile);

  useEffect(() => {
    const apply = () => setQualityProfile(detectProfile(reduced));
    apply();
    window.addEventListener("resize", apply);
    const mq = window.matchMedia(MOBILE_UI_MEDIA);
    mq.addEventListener("change", apply);
    return () => {
      window.removeEventListener("resize", apply);
      mq.removeEventListener("change", apply);
    };
  }, [reduced, setQualityProfile]);

  return { profile, settings: qualityProfiles[profile], reduced };
}
