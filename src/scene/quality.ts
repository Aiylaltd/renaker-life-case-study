import { qualityProfiles, type QualityProfile } from "@/config/scene";

export function getQualitySettings(profile: QualityProfile) {
  return qualityProfiles[profile];
}

export function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}
