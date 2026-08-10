"use client";

import { Suspense, useEffect } from "react";
import { Environment, useGLTF } from "@react-three/drei";
import { TemporaryCity } from "@/scene/TemporaryCity";
import { CameraDirector } from "@/scene/CameraDirector";
import { ManchesterModel } from "@/scene/ManchesterModel";
import { RenakerModels } from "@/scene/RenakerModels";
import { DigitalHighStreetPaths } from "@/scene/layers/DigitalHighStreet";
import { TRSREMarkers, TRSRERoutes } from "@/scene/layers/TRSREMarkers";
import { DoorlyRoutes } from "@/scene/layers/DoorlyRoutes";
import { FinaleOrb } from "@/scene/layers/FinaleOrb";
import { sceneAssets } from "@/config/scene";
import { useScrollStore } from "@/store/scrollStore";
import { getQualitySettings } from "@/scene/quality";
import { DebugAnchors } from "@/components/debug/DebugAnchors";
import { ModelErrorBoundary } from "@/scene/ModelErrorBoundary";

if (typeof window !== "undefined") {
  useGLTF.setDecoderPath("/draco/");
}

function Atmosphere() {
  const haze = useScrollStore((s) => s.haze);
  const cityAwake = useScrollStore((s) => s.cityAwake);
  const coverReveal = useScrollStore((s) => s.coverReveal);

  // Dark cover → warm architectural Manchester
  const bgDark = "#0c0c0e";
  const bgLight = "#b9b1a3";
  const groundDark = "#121214";
  const groundLight = "#d6cfc3";
  const t = coverReveal;
  const bg = lerpHex(bgDark, bgLight, t);
  const ground = lerpHex(groundDark, groundLight, t);

  return (
    <>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 500 + t * 400, 2200 + t * 1600]} />
      <ambientLight intensity={0.12 + t * 0.5 + cityAwake * 0.1} />
      <hemisphereLight
        args={["#f7f2ea", t > 0.4 ? "#8a8378" : "#1a1a1e", 0.25 + t * 0.5]}
      />
      <directionalLight
        position={[600, 900, 400]}
        intensity={0.15 + t * 1.25}
        color="#fff8f0"
      />
      <directionalLight
        position={[-400, 300, -200]}
        intensity={0.08 + t * 0.4}
        color="#d8dde8"
      />
      {/* Sparse warm window lights during dark cover */}
      <pointLight
        position={[-160, 80, 740]}
        intensity={(1 - t) * 2.2}
        distance={280}
        color="#C45C26"
      />
      <pointLight
        position={[-390, 70, 860]}
        intensity={(1 - t) * 1.6}
        distance={220}
        color="#e8c4a0"
      />
      <pointLight
        position={[-850, 60, 380]}
        intensity={(1 - t) * 1.4}
        distance={240}
        color="#C45C26"
      />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2, 0]}
        receiveShadow
      >
        <circleGeometry args={[1800, 64]} />
        <meshStandardMaterial color={ground} roughness={1} metalness={0} />
      </mesh>
      {/* Mist veil during reveal */}
      <mesh position={[0, 120, 0]} visible={t > 0.05 && t < 0.95}>
        <sphereGeometry args={[900, 24, 24]} />
        <meshBasicMaterial
          color="#d8d2c6"
          transparent
          opacity={(1 - Math.abs(t - 0.5) * 2) * 0.22}
          side={2}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 200, 0]} visible={haze > 0.15}>
        <sphereGeometry args={[1400, 24, 24]} />
        <meshBasicMaterial
          color="#f1f0e8"
          transparent
          opacity={haze * 0.45}
          side={2}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

function lerpHex(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ar = (pa >> 16) & 255;
  const ag = (pa >> 8) & 255;
  const ab = pa & 255;
  const br = (pb >> 16) & 255;
  const bg = (pb >> 8) & 255;
  const bb = pb & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)}`;
}

function RealCityWorld() {
  const modelLoadingState = useScrollStore((s) => s.modelLoadingState);
  const setModelLoadingState = useScrollStore((s) => s.setModelLoadingState);
  const showProceduralFallback =
    modelLoadingState !== "ready";

  useEffect(() => {
    const t = window.setTimeout(() => {
      const state = useScrollStore.getState().modelLoadingState;
      if (state === "loading" || state === "idle") {
        console.warn(
          "[SceneManager] Model load timeout — keeping procedural city visible",
        );
        setModelLoadingState("fallback");
      }
    }, 12000);
    return () => window.clearTimeout(t);
  }, [setModelLoadingState]);

  return (
    <>
      {/* Soft procedural city while Manchester streams — no fake Renaker towers */}
      {showProceduralFallback && (
        <TemporaryCity density={0.45} hideTowers />
      )}

      <ModelErrorBoundary name="manchester">
        <Suspense fallback={null}>
          <ManchesterModel />
        </Suspense>
      </ModelErrorBoundary>

      <ModelErrorBoundary name="renaker-towers">
        <Suspense fallback={null}>
          <RenakerModels />
        </Suspense>
      </ModelErrorBoundary>

      {!showProceduralFallback && (
        <TemporaryCity density={0} markersOnly />
      )}
    </>
  );
}

export function SceneManager({ debug = false }: { debug?: boolean }) {
  const profile = useScrollStore((s) => s.qualityProfile);
  const settings = getQualitySettings(profile);
  const setModelLoadingState = useScrollStore((s) => s.setModelLoadingState);
  const useRealCity = sceneAssets.enableGlbLoading;

  useEffect(() => {
    if (!useRealCity) {
      setModelLoadingState("fallback");
    } else {
      setModelLoadingState("loading");
    }
  }, [setModelLoadingState, useRealCity]);

  return (
    <>
      <Atmosphere />
      <CameraDirector />

      {useRealCity ? (
        <RealCityWorld />
      ) : (
        <TemporaryCity density={settings.cityDensity} />
      )}

      <DigitalHighStreetPaths maxPaths={settings.maxDhsPaths} />
      <DoorlyRoutes />
      <TRSREMarkers maxPins={settings.maxTrsrePins} />
      <TRSRERoutes />
      <Suspense fallback={null}>
        <FinaleOrb />
      </Suspense>
      <Environment preset="city" environmentIntensity={0.35} />
      {debug && <DebugAnchors />}
    </>
  );
}
