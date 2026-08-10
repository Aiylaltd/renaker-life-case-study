"use client";

import { Component, type ReactNode, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { SceneManager } from "@/scene/SceneManager";
import { useQualityProfile } from "@/hooks/useQualityProfile";
import { useDebug3d } from "@/hooks/useDebug3d";
import { cameraDefaults } from "@/config/scene";

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
  const { settings, reduced } = useQualityProfile();
  const debug = useDebug3d();
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="scene-canvas" aria-hidden />;
  }

  return (
    <>
      <div className="scene-canvas" aria-hidden>
        <CanvasErrorBoundary onError={setError}>
          <Canvas
            dpr={settings.dpr}
            gl={{
              antialias: !reduced,
              powerPreference: "high-performance",
              alpha: false,
              failIfMajorPerformanceCaveat: false,
              preserveDrawingBuffer: true,
            }}
            camera={{
              fov: cameraDefaults.fov,
              near: cameraDefaults.near,
              far: cameraDefaults.far,
              position: cameraDefaults.overview.position,
            }}
            frameloop="always"
            style={{ width: "100%", height: "100%", display: "block" }}
            onCreated={({ gl }) => {
              gl.setClearColor("#c4bdb0", 1);
              console.info(
                "[SceneCanvas] WebGL ready",
                gl.getContext().getParameter(gl.getContext().VERSION),
              );
            }}
          >
            <SceneManager debug={debug} />
          </Canvas>
        </CanvasErrorBoundary>
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
