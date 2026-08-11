"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useScrollStore } from "@/store/scrollStore";
import { AnchorRegistry } from "@/scene/AnchorRegistry";
import { cameraDefaults } from "@/config/scene";
import { getDevelopmentByAnchor } from "@/config/developments";
import type { AnchorName } from "@/config/scene";

const _desiredPos = new THREE.Vector3();
const _desiredTarget = new THREE.Vector3();
const _offset = new THREE.Vector3();
const _orbited = new THREE.Vector3();
const _toPos = new THREE.Vector3();
const _toLook = new THREE.Vector3();
const _fromPos = new THREE.Vector3();
const _fromTarget = new THREE.Vector3();
const _towerPos = new THREE.Vector3();
const _towerTarget = new THREE.Vector3();

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * Wide opening frame from the far (north) end of the city,
 * looking south toward Deansgate Square — towers read in the distance
 * with the city fabric filling the foreground.
 */
function revealFrame(t: number) {
  const e = easeInOutCubic(THREE.MathUtils.clamp(t, 0, 1));
  const dgs = AnchorRegistry.getPosition("ANCHOR_DGS");

  _fromPos.set(
    dgs.x + THREE.MathUtils.lerp(480, 400, e),
    THREE.MathUtils.lerp(680, 580, e),
    dgs.z + THREE.MathUtils.lerp(-1180, -1020, e),
  );
  _fromTarget.set(
    dgs.x,
    dgs.y + THREE.MathUtils.lerp(30, 55, e),
    dgs.z,
  );
}

function towerArrivalFrame(active: AnchorName, buildingProgress: number) {
  const dev = getDevelopmentByAnchor(active);
  const a = AnchorRegistry.getPosition(active);
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
  // Slow, shallow orbit — ease across most of the stop so it never feels twitchy
  const orbitT = easeInOutCubic(THREE.MathUtils.clamp((p - 0.2) / 0.9, 0, 1));
  const orbitDeg = THREE.MathUtils.lerp(
    cam.orbitStartDeg,
    cam.orbitEndDeg,
    orbitT,
  );
  const orbitRad = THREE.MathUtils.degToRad(orbitDeg);

  _offset.set(...cam.arrivalOffset);
  // Milder push-in so arrival doesn't lunge
  const widen = THREE.MathUtils.lerp(
    1.12,
    1,
    easeInOutCubic(Math.min(1, p / 0.65)),
  );
  _orbited.set(
    (_offset.x * Math.cos(orbitRad) - _offset.z * Math.sin(orbitRad)) * widen,
    _offset.y * THREE.MathUtils.lerp(1.06, 1, Math.min(1, p / 0.6)),
    (_offset.x * Math.sin(orbitRad) + _offset.z * Math.cos(orbitRad)) * widen,
  );

  _towerPos.set(a.x + _orbited.x, a.y + _orbited.y, a.z + _orbited.z);
  _towerTarget.set(
    a.x + cam.targetOffset[0],
    a.y + cam.targetOffset[1],
    a.z + cam.targetOffset[2],
  );

  return { fov: cam.fov };
}

/**
 * Settled framing per building — light orbit after arrival.
 */
function estateComposition(buildingProgress: number, active: AnchorName) {
  const { fov } = towerArrivalFrame(active, buildingProgress);
  _desiredPos.copy(_towerPos);
  _desiredTarget.copy(_towerTarget);
  return { lerp: 0.026, fov };
}

/**
 * Cover → first tower: blend wide reveal into DGS arrival.
 * Progress is authored to finish near the settled estate frame (no pull-back).
 */
function approachComposition(buildingProgress: number, active: AnchorName) {
  revealFrame(1);
  const { fov } = towerArrivalFrame(active, Math.max(buildingProgress, 0.55));
  // Map 0.35→0.75 building progress onto 0→1 blend so late cover sits on the tower
  const blend = easeInOutCubic(
    THREE.MathUtils.clamp((buildingProgress - 0.3) / 0.45, 0, 1),
  );

  _desiredPos.lerpVectors(_fromPos, _towerPos, blend);
  _desiredTarget.lerpVectors(_fromTarget, _towerTarget, blend);

  return {
    lerp: THREE.MathUtils.lerp(0.022, 0.03, blend),
    fov: THREE.MathUtils.lerp(48, fov, blend),
  };
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
  const cover = state.coverReveal;

  _desiredPos.set(...overview.position);
  _desiredTarget.set(...overview.target);
  let lerp = reduced ? 0.08 : 0.018;
  let fov = cameraDefaults.fov;

  if (mode === "cover" || mode === "loading") {
    const dgs = AnchorRegistry.getPosition("ANCHOR_DGS");
    const height = 580 + (1 - cover) * 100;
    _desiredPos.set(dgs.x + 480, height, dgs.z - 1180);
    _desiredTarget.set(dgs.x, dgs.y + 30, dgs.z);
    lerp = 0.02;
    fov = 48;
  } else if (mode === "reveal") {
    const t = THREE.MathUtils.clamp(state.sectionProgress, 0, 1);
    revealFrame(t);
    _desiredPos.copy(_fromPos);
    _desiredTarget.copy(_fromTarget);
    lerp = 0.03;
    fov = 48;
  } else if (mode === "approach") {
    // Never fall through to city overview mid-handoff
    return approachComposition(
      state.estateBuildingProgress,
      active ?? "ANCHOR_DGS",
    );
  } else if (mode === "estate") {
    return estateComposition(
      state.estateBuildingProgress || 0.62,
      active ?? "ANCHOR_DGS",
    );
  } else if (mode === "estate-overview") {
    _desiredPos.set(-40, 520, 780);
    _desiredTarget.set(-200, 40, 200);
    lerp = 0.032;
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
    lerp =
      state.attentionMode === "editorial" || state.sectionId === "problem"
        ? 0.04
        : 0.018;
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
  const lastActive = useRef<string | null>(null);
  const lastMode = useRef<string | null>(null);
  const lastSnapNonce = useRef(0);

  useFrame((_, delta) => {
    const state = useScrollStore.getState();
    const active = state.activeDevelopment;
    let { lerp, fov } = compositionForState();

    // Hard cut (Start handoff) — skip easing so we don't fly from the default pose
    if (state.cameraSnapNonce !== lastSnapNonce.current) {
      lastSnapNonce.current = state.cameraSnapNonce;
      lastActive.current = active;
      lastMode.current = state.sceneMode;
      camera.position.copy(_desiredPos);
      lookAt.current.copy(_desiredTarget);
      vel.current.set(0, 0, 0);
      lookVel.current.set(0, 0, 0);
      camera.lookAt(lookAt.current);
      if ("fov" in camera) {
        const persp = camera as THREE.PerspectiveCamera;
        persp.fov = fov;
        persp.updateProjectionMatrix();
      }
      return;
    }

    if (active !== lastActive.current) {
      lastActive.current = active;
      // Soft handoff between towers — never punch the lerp up
      lerp = Math.min(lerp, state.sceneMode === "approach" ? 0.022 : 0.03);
    }

    if (state.sceneMode !== lastMode.current) {
      lastMode.current = state.sceneMode;
      if (state.sceneMode === "approach" || state.sceneMode === "reveal") {
        lerp = Math.min(lerp, 0.024);
      }
    }

    const dt = Math.min(delta, 0.05);
    const smooth = 1 - Math.exp(-lerp * 60 * dt);

    _toPos.copy(_desiredPos).sub(camera.position);
    vel.current.lerp(_toPos, smooth);
    camera.position.addScaledVector(vel.current, smooth);

    lookAt.current.lerp(_desiredTarget, smooth * 0.9);
    _toLook.copy(_desiredTarget).sub(lookAt.current);
    lookVel.current.lerp(_toLook, smooth);
    lookAt.current.addScaledVector(lookVel.current, smooth * 0.3);
    camera.lookAt(lookAt.current);

    if ("fov" in camera) {
      const persp = camera as THREE.PerspectiveCamera;
      persp.fov = THREE.MathUtils.lerp(persp.fov, fov, smooth);
      persp.updateProjectionMatrix();
    }

    debugTimer.current += delta;
    if (debugTimer.current > 0.75) {
      debugTimer.current = 0;
      setCameraDebug(
        [camera.position.x, camera.position.y, camera.position.z],
        [lookAt.current.x, lookAt.current.y, lookAt.current.z],
      );
    }
  });

  return null;
}
