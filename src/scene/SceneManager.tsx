"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
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

const BG_DARK = new THREE.Color("#050506");
const BG_LIGHT = new THREE.Color("#b9b1a3");
const GROUND_DARK = new THREE.Color("#08080a");
const GROUND_LIGHT = new THREE.Color("#d6cfc3");
const _bg = new THREE.Color();
const _ground = new THREE.Color();

/**
 * Imperative atmosphere — cover scroll updates lights/fog without React re-renders.
 */
function Atmosphere() {
  const { scene, gl } = useThree();
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const groundMat = useRef<THREE.MeshLambertMaterial>(null);
  const lastT = useRef(-1);

  useFrame(() => {
    const t = useScrollStore.getState().coverReveal;
    const cityAwake = useScrollStore.getState().cityAwake;
    if (Math.abs(t - lastT.current) < 0.002 && Math.abs(t - 1) > 0.01) return;
    lastT.current = t;

    _bg.copy(BG_DARK).lerp(BG_LIGHT, t);
    _ground.copy(GROUND_DARK).lerp(GROUND_LIGHT, t);
    scene.background = _bg;
    gl.setClearColor(_bg, 1);

    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.copy(_bg);
      scene.fog.near = 280 + t * 620;
      scene.fog.far = 1400 + t * 2400;
    }

    if (ambientRef.current) {
      ambientRef.current.intensity = 0.08 + t * 0.52 + cityAwake * 0.08;
    }
    if (hemiRef.current) {
      hemiRef.current.intensity = 0.12 + t * 0.55;
      hemiRef.current.groundColor.set(t > 0.4 ? "#8a8378" : "#0e0e12");
    }
    if (keyRef.current) keyRef.current.intensity = 0.08 + t * 1.1;
    if (fillRef.current) fillRef.current.intensity = 0.04 + t * 0.35;
    if (groundMat.current) groundMat.current.color.copy(_ground);
  });

  return (
    <>
      <fog attach="fog" args={["#050506", 280, 1400]} />
      <ambientLight ref={ambientRef} intensity={0.08} />
      <hemisphereLight
        ref={hemiRef}
        args={["#f7f2ea", "#0e0e12", 0.12]}
      />
      <directionalLight
        ref={keyRef}
        position={[600, 900, 400]}
        intensity={0.08}
        color="#fff8f0"
      />
      <directionalLight
        ref={fillRef}
        position={[-400, 300, -200]}
        intensity={0.04}
        color="#d8dde8"
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <circleGeometry args={[1800, 32]} />
        <meshLambertMaterial ref={groundMat} color="#08080a" />
      </mesh>
    </>
  );
}

/**
 * Towers mount during the HTML loading screen (canvas renders under the veil)
 * so GPU upload / shader compile happens off-screen — not when Start is clicked.
 */
function EarlyTowers() {
  return (
    <ModelErrorBoundary name="renaker-towers">
      <Suspense fallback={null}>
        <RenakerModels />
      </Suspense>
    </ModelErrorBoundary>
  );
}

function DeferredOverlays({
  maxDhsPaths,
  maxTrsrePins,
}: {
  maxDhsPaths: number;
  maxTrsrePins: number;
}) {
  const [layer, setLayer] = useState<"none" | "dhs" | "doorly" | "trsre" | "finale">(
    "none",
  );

  useEffect(() => {
    const rank = { none: 0, dhs: 1, doorly: 2, trsre: 3, finale: 4 } as const;
    return useScrollStore.subscribe((s) => {
      let next: typeof layer = "none";
      if (s.sceneMode === "finale" || s.orbReveal > 0.05) next = "finale";
      else if (s.sceneMode === "trsre" || s.trsreIntensity > 0.05) next = "trsre";
      else if (s.sceneMode === "doorly" || s.doorlyIntensity > 0.05) next = "doorly";
      else if (s.sceneMode === "dhs" || s.dhsIntensity > 0.05) next = "dhs";
      setLayer((prev) => (rank[next] >= rank[prev] ? next : prev));
    });
  }, []);

  if (layer === "none") return null;

  return (
    <>
      {(layer === "dhs" || layer === "doorly" || layer === "trsre" || layer === "finale") && (
        <DigitalHighStreetPaths maxPaths={maxDhsPaths} />
      )}
      {(layer === "doorly" || layer === "trsre" || layer === "finale") && <DoorlyRoutes />}
      {(layer === "trsre" || layer === "finale") && (
        <>
          <TRSREMarkers maxPins={maxTrsrePins} />
          <TRSRERoutes />
        </>
      )}
      {layer === "finale" && (
        <Suspense fallback={null}>
          <FinaleOrb />
        </Suspense>
      )}
    </>
  );
}

function RealCityWorld() {
  const modelLoadingState = useScrollStore((s) => s.modelLoadingState);
  const setModelLoadingState = useScrollStore((s) => s.setModelLoadingState);
  const showProceduralFallback = modelLoadingState !== "ready";

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
      {showProceduralFallback && (
        <TemporaryCity density={0.45} hideTowers />
      )}

      <ModelErrorBoundary name="manchester">
        <Suspense fallback={null}>
          <ManchesterModel />
        </Suspense>
      </ModelErrorBoundary>

      <EarlyTowers />

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

      <DeferredOverlays
        maxDhsPaths={settings.maxDhsPaths}
        maxTrsrePins={settings.maxTrsrePins}
      />
      {debug && <DebugAnchors />}
    </>
  );
}
