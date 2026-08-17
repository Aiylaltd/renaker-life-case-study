"use client";

import { Component, type ReactNode, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { SceneManager } from "@/scene/SceneManager";
import { useQualityProfile } from "@/hooks/useQualityProfile";
import { useDebug3d } from "@/hooks/useDebug3d";
import { cameraDefaults } from "@/config/scene";
import { useScrollStore } from "@/store/scrollStore";
import { useIsMobileUi } from "@/hooks/useIsMobileUi";

class CanvasErrorBoundary extends Component<
  { children: ReactNode; onError: (msg: string) => void },
  { error: string | null }
> {
  state = { error: null as string | null };

  static getDerivedStateFromError(error: Error) {
    return { error: error.message || "WebGL failed" };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error.message || "WebGL failed");
    console.error("[SceneCanvas]", error);
  }

  render() {
    if (this.state.error) return null;
    return this.props.children;
  }
}

export function SceneCanvas() {
  useQualityProfile();
  const debug = useDebug3d();
  const mobileUi = useIsMobileUi();
  const experienceStarted = useScrollStore((s) => s.experienceStarted);
  const loaderDone = useScrollStore((s) => s.loaderDone);
  const sectionId = useScrollStore((s) => s.sectionId);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  // Wait until mobile detection has run (same tick as useIsMobileUi effect).
  const [viewportReady, setViewportReady] = useState(false);

  useEffect(() => {
    setMounted(true);
    setViewportReady(true);
  }, []);

  // Desktop: warm city under the loading veil.
  // Mobile: defer WebGL until Start — preloading ~33MB GLBs crashes many iPhones.
  const warmScene = mobileUi
    ? experienceStarted
    : !loaderDone || experienceStarted;
  const editorialHold = sectionId === "videos";
  const runScene = warmScene && !editorialHold;
  const mountCanvas =
    viewportReady && (!mobileUi || experienceStarted);

  if (!mounted) {
    return <div className="scene-canvas" aria-hidden />;
  }

  return (
    <>
      <div className="scene-canvas" aria-hidden>
        {mountCanvas ? (
          <CanvasErrorBoundary onError={setError}>
            <Canvas
              dpr={1}
              gl={{
                antialias: false,
                powerPreference: mobileUi ? "low-power" : "high-performance",
                alpha: false,
                stencil: false,
                depth: true,
                failIfMajorPerformanceCaveat: false,
                preserveDrawingBuffer: false,
              }}
              camera={{
                fov: cameraDefaults.fov,
                near: cameraDefaults.near,
                far: cameraDefaults.far,
                position: cameraDefaults.overview.position,
              }}
              frameloop={runScene ? "always" : "never"}
              style={{ width: "100%", height: "100%", display: "block" }}
              onCreated={({ gl }) => {
                gl.setClearColor("#050506", 1);
                gl.shadowMap.enabled = false;
              }}
            >
              <SceneManager debug={debug} />
            </Canvas>
          </CanvasErrorBoundary>
        ) : null}
      </div>

      {error && (
        <div
          style={{
            position: "fixed",
            left: 16,
            bottom: 16,
            zIndex: 90,
            maxWidth: 360,
            borderRadius: 12,
            background: "rgba(10,10,11,0.88)",
            color: "#f5f2ed",
            padding: "12px 14px",
            fontSize: 12,
            lineHeight: 1.4,
          }}
        >
          3D failed to start: {error}
        </div>
      )}
    </>
  );
}
