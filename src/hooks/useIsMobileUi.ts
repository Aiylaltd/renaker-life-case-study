"use client";

import { useEffect, useState } from "react";

/**
 * Phone / small-tablet UI + light 3D path.
 * Include short-edge landscape (iPhone landscape is >768px wide) so we
 * never fall into the desktop “load every tower” path on a phone.
 */
export const MOBILE_UI_MEDIA =
  "(max-width: 768px), (max-height: 540px) and (pointer: coarse)";

/**
 * iPad / large tablet — expo demo controls.
 * Coarse pointer at phone-landscape widths and up (excludes mouse desktops).
 */
export const TABLET_UI_MEDIA = "(pointer: coarse) and (min-width: 768px)";

/** Matches qualityProfile mobile breakpoint — UI/touch + light 3D path only. */
export function isMobileUiViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MOBILE_UI_MEDIA).matches;
}

export function isTabletUiViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(TABLET_UI_MEDIA).matches;
}

/** Touches on top nav / demo chrome — don't steal for section steppers */
export function isChromeTouchTarget(e: Event) {
  const t = e.target;
  return (
    t instanceof Element &&
    !!t.closest(".tower-case-nav, .demo-step-controls")
  );
}

/**
 * Always starts `false` (matches SSR), then resolves after mount.
 * Never read matchMedia in useState — that causes hydration mismatches on phones.
 */
export function useIsMobileUi() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_UI_MEDIA);
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return mobile;
}

/** iPad / tablet demo chrome — SSR-safe false until mount. */
export function useIsTabletUi() {
  const [tablet, setTablet] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(TABLET_UI_MEDIA);
    const apply = () => setTablet(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return tablet;
}
