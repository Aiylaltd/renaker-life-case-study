"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useScrollStore } from "@/store/scrollStore";
import { AnchorRegistry } from "@/scene/AnchorRegistry";
import { cameraDefaults } from "@/config/scene";
import { developments, getDevelopmentByAnchor } from "@/config/developments";

const _pos = new THREE.Vector3();
const _desiredPos = new THREE.Vector3();
const _desiredTarget = new THREE.Vector3();
const _offset = new THREE.Vector3();
const _orbited = new THREE.Vector3();

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * Estate beat within a single building's scroll slice:
 * approach → arrive → orbit → hold → depart
 */
function estateComposition(buildingProgress: number, active: string) {
  const dev = getDevelopmentByAnchor(active as (typeof developments)[0]["anchor"]);
  const a = AnchorRegistry.getPosition(active as (typeof developments)[0]["anchor"]);
  const cam = dev?.camera ?? {
    arrivalOffset: cameraDefaults.towerOffset.position,
    orbitStartDeg: -10,
    orbitEndDeg: 25,
    targetOffset: [0, cameraDefaults.towerOffset.lookAtY, 0] as [
      number,
      number,
      number,
    ],
    fov: cameraDefaults.fov,
    overlaySide: "left" as const,
  };

  const p = THREE.MathUtils.clamp(buildingProgress, 0, 1);
  // Phase weights
  let phase: "approach" | "arrive" | "orbit" | "hold" | "depart" = "approach";
  let orbitT = 0;
  let approachT = 0;

  if (p < 0.18) {
    phase = "approach";
    approachT = easeInOutCubic(p / 0.18);
  } else if (p < 0.3) {
    phase = "arrive";
    approachT = 1;
    orbitT = 0;
  } else if (p < 0.72) {
    phase = "orbit";
    approachT = 1;
    orbitT = easeInOutCubic((p - 0.3) / 0.42);
  } else if (p < 0.88) {
    phase = "hold";
    approachT = 1;
    orbitT = 1;
  } else {
    phase = "depart";
    approachT = 1;
    orbitT = 1;
  }

  const orbitDeg = THREE.MathUtils.lerp(
    cam.orbitStartDeg,
    cam.orbitEndDeg,
    orbitT,
  );
  const orbitRad = THREE.MathUtils.degToRad(orbitDeg);

  _offset.set(...cam.arrivalOffset);
  // Pull back slightly on approach / push on depart
  if (phase === "approach") {
    _offset.multiplyScalar(THREE.MathUtils.lerp(1.55, 1, approachT));
    _offset.y *= THREE.MathUtils.lerp(1.35, 1, approachT);
  } else if (phase === "depart") {
    const d = (p - 0.88) / 0.12;
    _offset.multiplyScalar(THREE.MathUtils.lerp(1, 1.35, d));
    _offset.y *= THREE.MathUtils.lerp(1, 1.25, d);
  }

  _orbited.set(
    _offset.x * Math.cos(orbitRad) - _offset.z * Math.sin(orbitRad),
    _offset.y,
    _offset.x * Math.sin(orbitRad) + _offset.z * Math.cos(orbitRad),
  );

  // Offsets are authored relative to deck; a.y is the measured plinth top
  _desiredPos.set(
    a.x + _orbited.x,
    a.y + _orbited.y,
    a.z + _orbited.z,
  );
  _desiredTarget.set(
    a.x + cam.targetOffset[0],
    a.y + cam.targetOffset[1],
    a.z + cam.targetOffset[2],
  );

  // Heavy camera — low responsiveness
  const lerp =
    phase === "orbit" || phase === "hold"
      ? 0.014
      : phase === "approach"
        ? 0.018
        : 0.016;

  return { lerp, fov: cam.fov };
}

function compositionForState(): {
  lerp: number;
  fov: number;
} {
  const state = useScrollStore.getState();
  const { overview } = cameraDefaults;
  const active = state.activeDevelopment;
  const mode = state.sceneMode;
  const reduced = state.qualityProfile === "reduced";
  const cover = state.coverReveal; // 0 dark → 1 light

  _desiredPos.set(...overview.position);
  _desiredTarget.set(...overview.target);
  let lerp = reduced ? 0.08 : 0.018;
  let fov = cameraDefaults.fov;

  if (mode === "cover" || mode === "loading") {
    // Dark opening — high, slow drift over the city
    _desiredPos.set(-80, 380 + (1 - cover) * 80, 520);
    _desiredTarget.set(40, 30, 40);
    const t = performance.now() * 0.00008;
    _desiredPos.x += Math.sin(t) * 12;
    _desiredPos.z += Math.cos(t * 0.7) * 10;
    lerp = 0.012;
    fov = 44;
  } else if (mode === "reveal") {
    // Dark → light push-in
    const t = THREE.MathUtils.clamp(state.sectionProgress, 0, 1);
    const e = easeInOutCubic(t);
    _desiredPos.set(
      THREE.MathUtils.lerp(-80, 60, e),
      THREE.MathUtils.lerp(420, 320, e),
      THREE.MathUtils.lerp(520, 640, e),
    );
    _desiredTarget.set(
      THREE.MathUtils.lerp(40, 20, e),
      THREE.MathUtils.lerp(30, 50, e),
      THREE.MathUtils.lerp(40, 0, e),
    );
    lerp = 0.02;
  } else if (mode === "estate" && active) {
    return estateComposition(state.estateBuildingProgress, active);
  } else if (mode === "estate-overview") {
    _desiredPos.set(-40, 520, 780);
    _desiredTarget.set(-200, 40, 200);
    lerp = 0.014;
  } else if (mode === "home" && active) {
    const a = AnchorRegistry.getPosition(active);
    _desiredPos.set(a.x + 110, 140, a.z + 180);
    _desiredTarget.set(a.x, 70, a.z);
    lerp = 0.02;
  } else if (mode === "dhs") {
    _desiredPos.set(120, 220, 420);
    _desiredTarget.set(0, 20, 80);
    lerp = state.attentionMode === "editorial" ? 0.01 : 0.018;
  } else if (mode === "doorly") {
    const a = AnchorRegistry.getPosition("ANCHOR_BANKSIDE");
    _desiredPos.set(a.x + 160, 180, a.z + 200);
    _desiredTarget.set(a.x, 80, a.z);
    lerp = state.attentionMode === "editorial" ? 0.01 : 0.018;
  } else if (mode === "trsre") {
    _desiredPos.set(-100, 420, 560);
    _desiredTarget.set(0, 20, 0);
    lerp = state.attentionMode === "editorial" ? 0.01 : 0.016;
  } else if (mode === "finale") {
    _desiredPos.set(
      0,
      620 + state.orbReveal * 180,
      820 - state.orbReveal * 320,
    );
    _desiredTarget.set(0, 80 + state.orbReveal * 40, 0);
    lerp = 0.016;
  } else if (mode === "quiet" || mode === "overview") {
    _desiredPos.set(-120, 400, 620);
    _desiredTarget.set(40, 40, -20);
    lerp = state.attentionMode === "editorial" ? 0.008 : 0.012;
    if (state.attentionMode !== "editorial") {
      const t = performance.now() * 0.0001;
      _desiredPos.x += Math.sin(t) * 6;
      _desiredPos.z += Math.cos(t * 0.8) * 5;
    }
  }

  return { lerp, fov };
}

export function CameraDirector() {
  const { camera } = useThree();
  const lookAt = useRef(new THREE.Vector3(...cameraDefaults.overview.target));
  const setCameraDebug = useScrollStore((s) => s.setCameraDebug);
  const debugTimer = useRef(0);
  const vel = useRef(new THREE.Vector3());
  const lookVel = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const { lerp, fov } = compositionForState();
    // Critically-damped spring feel — scroll cannot yank the camera
    const dt = Math.min(delta, 0.05);
    const smooth = 1 - Math.exp(-lerp * 60 * dt);

    // Secondary inertia on position
    const toPos = _desiredPos.clone().sub(camera.position);
    vel.current.lerp(toPos, smooth);
    camera.position.addScaledVector(vel.current, smooth);

    lookAt.current.lerp(_desiredTarget, smooth * 0.85);
    const toLook = _desiredTarget.clone().sub(lookAt.current);
    lookVel.current.lerp(toLook, smooth);
    lookAt.current.addScaledVector(lookVel.current, smooth * 0.35);
    camera.lookAt(lookAt.current);

    if ("fov" in camera) {
      const persp = camera as THREE.PerspectiveCamera;
      persp.fov = THREE.MathUtils.lerp(persp.fov, fov, smooth);
      persp.updateProjectionMatrix();
    }

    debugTimer.current += delta;
    if (debugTimer.current > 0.25) {
      debugTimer.current = 0;
      setCameraDebug(
        [camera.position.x, camera.position.y, camera.position.z],
        [lookAt.current.x, lookAt.current.y, lookAt.current.z],
      );
    }
  });

  return null;
}
