"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import { OrbFallback } from "./orb-fallback";
import { useIsMobileUi } from "@/hooks/useIsMobileUi";

const LiquidBubbleCanvas = dynamic(
  () =>
    import("./liquid-bubble-scene").then((m) => ({
      default: m.LiquidBubbleScene,
    })),
  { ssr: false, loading: () => <OrbFallback /> },
);

function supportsWebGL() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

/** Keep the WebGL orb mounted once warm — remounting is what caused flicker. */
export function FinaleLiquidOrb({ active }: { active: boolean }) {
  const mobileUi = useIsMobileUi();
  const [enable3D, setEnable3D] = useState(false);
  const [warmed, setWarmed] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (active) setWarmed(true);
  }, [active]);

  useEffect(() => {
    // Second WebGL context + main city scene OOMs many iPhones — CSS orb only.
    if (mobileUi) {
      setEnable3D(false);
      return;
    }
    const update = () => {
      setEnable3D(!failed && supportsWebGL());
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [failed, mobileUi]);

  const showCanvas = enable3D && warmed;

  return (
    <div
      className={`finale-orb ${active ? "is-on" : ""}`}
      aria-label="Aiyla"
    >
      <span className="finale-orb__glow" aria-hidden />
      <div className="finale-orb__stage">
        {showCanvas ? (
          <LiquidBubbleCanvas
            mergeProgress={1}
            mobile={false}
            interactive={false}
            className="absolute inset-0 h-full w-full"
            onContextLost={() => setFailed(true)}
          />
        ) : (
          <OrbFallback className="opacity-90" />
        )}
      </div>
      <div className="finale-orb__mark" aria-hidden>
        <Image
          src="/images/brand/aiyla-wordmark.png"
          alt=""
          width={1024}
          height={168}
          className="finale-orb__wordmark"
          priority={false}
        />
      </div>
    </div>
  );
}
