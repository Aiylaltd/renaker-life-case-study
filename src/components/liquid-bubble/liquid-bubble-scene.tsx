"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { LiquidShaderMaterial } from "./liquid-shader-material";
import { OrbFallback } from "./orb-fallback";

function CentralLiquidBlob({
  mergeProgress,
  mobile,
}: {
  mergeProgress: number;
  mobile: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const material = useMemo(() => new LiquidShaderMaterial(), []);

  useEffect(() => {
    material.transparent = true;
    material.depthWrite = false;
    return () => material.dispose();
  }, [material]);

  useFrame((state) => {
    if (!meshRef.current) return;

    material.uTime = state.clock.elapsedTime;
    material.uMouse.set(0, 0);

    const merge = THREE.MathUtils.clamp(mergeProgress, 0, 1);
    material.uDistort = THREE.MathUtils.lerp(0.65, 1.15, merge);

    meshRef.current.rotation.y =
      state.clock.elapsedTime * (mobile ? 0.05 : 0.065);
    meshRef.current.rotation.x =
      Math.sin(state.clock.elapsedTime * 0.2) * 0.03;

    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(1, 1.1, merge));
  });

  return (
    <mesh ref={meshRef} material={material}>
      <icosahedronGeometry args={[1.22, mobile ? 6 : 12]} />
    </mesh>
  );
}

export function LiquidBubbleScene({
  mergeProgress,
  interactive: _interactive = false,
  mobile = false,
  className = "",
  onContextLost,
}: {
  mergeProgress: number;
  interactive?: boolean;
  mobile?: boolean;
  className?: string;
  onContextLost?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(true);
  const [webglLost, setWebglLost] = useState(false);
  const lostReported = useRef(false);

  useEffect(() => {
    // Stay mounted for the life of the finale — no mount/unmount flicker
    setMounted(true);
  }, []);

  const showCanvas = mounted && !webglLost;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {!showCanvas && <OrbFallback />}
      {showCanvas && (
        <Canvas
          camera={{ position: [0, 0, 5.5], fov: 42 }}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: "default",
            failIfMajorPerformanceCaveat: false,
            stencil: false,
            depth: true,
          }}
          dpr={1}
          style={{ background: "transparent" }}
          frameloop="always"
          onCreated={({ gl }) => {
            gl.setClearColor("#000000", 0);
            const el = gl.domElement;
            const onLost = (event: Event) => {
              event.preventDefault();
              setWebglLost(true);
              if (!lostReported.current) {
                lostReported.current = true;
                onContextLost?.();
              }
            };
            el.addEventListener("webglcontextlost", onLost, false);
          }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.55} />
            <directionalLight position={[4, 6, 5]} intensity={1.15} color="#ffffff" />
            <directionalLight position={[-4, -2, 3]} intensity={0.5} color="#c4b5fd" />
            <pointLight position={[0, 0, 3]} intensity={0.55} color="#f9a8d4" />
            <CentralLiquidBlob mergeProgress={mergeProgress} mobile={mobile} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
