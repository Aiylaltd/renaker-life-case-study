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

/** Last touch Y for direction while deciding card-vs-tour handoff */
let chromeTouchY: number | undefined;

/**
 * Touches/wheels the tour should not steal:
 * - nav / demo chrome
 * - building cards while they can still scroll in that direction
 *   (at the edge, or with no overflow, hand off to scroll-to-continue)
 */
export function isChromeTouchTarget(e: Event) {
  const t = e.target;
  if (!(t instanceof Element)) return false;
  if (t.closest(".tower-case-nav, .demo-step-controls")) return true;

  const panel = t.closest(".tower-stack__feature, .tower-card");
  if (!(panel instanceof HTMLElement)) return false;
  if (panel.scrollHeight <= panel.clientHeight + 1) return false;

  let dy = 0;
  if (e instanceof WheelEvent) {
    dy = e.deltaY;
  } else if (e instanceof TouchEvent) {
    const point = e.touches[0] ?? e.changedTouches[0];
    if (point) {
      const prev =
        typeof chromeTouchY === "number" ? chromeTouchY : point.clientY;
      dy = prev - point.clientY;
      chromeTouchY = point.clientY;
    }
  }

  if (dy === 0) return true;
  if (dy < 0 && panel.scrollTop <= 0) return false;
  if (dy > 0 && panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1) {
    return false;
  }
  return true;
}

export function seedChromeTouchY(y: number) {
  chromeTouchY = y;
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
