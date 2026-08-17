"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useScrollStore } from "@/store/scrollStore";
import { AnchorRegistry } from "@/scene/AnchorRegistry";
import { cameraDefaults, RENAKER_ANCHORS } from "@/config/scene";
import { getDevelopmentByAnchor } from "@/config/developments";
import type { AnchorName } from "@/config/scene";
import { isMobileUiViewport } from "@/hooks/useIsMobileUi";

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
 * When calm (feature card reading), freeze near the settled frame.
 */
function estateComposition(
  buildingProgress: number,
  active: AnchorName,
  calm: boolean,
) {
  const progress = calm
    ? 0.62 + (buildingProgress - 0.62) * 0.15
    : buildingProgress;
  const { fov } = towerArrivalFrame(active, progress);
  _desiredPos.copy(_towerPos);
  _desiredTarget.copy(_towerTarget);
  return { lerp: calm ? 0.012 : 0.026, fov };
}

/**
 * Cover → first tower: blend wide reveal into DGS arrival.
 * Progress is authored to finish near the settled estate frame (no pull-back).
 */
/**
 * Cover → DGS: buildingProgress is 0→1 approach blend.
 * Starts from the wide city reveal and eases onto the settled tower frame.
 */
function approachComposition(buildingProgress: number, active: AnchorName) {
  const blend = easeInOutCubic(THREE.MathUtils.clamp(buildingProgress, 0, 1));
  // Start from a late city reveal pose (approach begins ~cover 0.72)
  revealFrame(THREE.MathUtils.lerp(0.72, 1, blend));
  const { fov } = towerArrivalFrame(active, 0.62);

  _desiredPos.lerpVectors(_fromPos, _towerPos, blend);
  _desiredTarget.lerpVectors(_fromTarget, _towerTarget, blend);

  return {
    // Ease in, then settle — never accelerate into the destination
    lerp: THREE.MathUtils.lerp(0.018, 0.012, blend),
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
      state.towerCameraCalm,
    );
  } else if (mode === "estate-overview") {
    // Zoomed out above the portfolio, still facing the towers
    let cx = 0;
    let cy = 0;
    let cz = 0;
    for (const name of RENAKER_ANCHORS) {
      const p = AnchorRegistry.getPosition(name);
      cx += p.x;
      cy += p.y;
      cz += p.z;
    }
    const n = RENAKER_ANCHORS.length || 1;
    cx /= n;
    cy /= n;
    cz /= n;
    _desiredPos.set(cx + 160, 760, cz + 980);
    _desiredTarget.set(cx - 30, cy + 140, cz - 60);
    lerp = state.towerCameraCalm ? 0.01 : 0.03;
    fov = 46;
  } else if (mode === "home" && active) {
    const a = AnchorRegistry.getPosition(active);
    _desiredPos.set(a.x + 110, 140, a.z + 180);
    _desiredTarget.set(a.x, 70, a.z);
    lerp = 0.02;
  } else if (mode === "dhs") {
    const focused =
      state.activeBusinesses.length === 1
        ? state.activeBusinesses[0]
        : null;
    if (focused) {
      const a = AnchorRegistry.getPosition(focused);
      // Mid frame: pin readable, city still in view
      _desiredPos.set(a.x + 95, 125, a.z + 185);
      _desiredTarget.set(a.x, 16, a.z);
      lerp = 0.024;
      fov = 42;
    } else if (state.dhsBreakoutRise) {
      // After Breakout — rise only from that pin for vision + insight cards
      const breakout = AnchorRegistry.getPosition("ANCHOR_BIZ3");
      _desiredPos.set(breakout.x + 95, 300, breakout.z + 210);
      _desiredTarget.set(breakout.x, 24, breakout.z);
      lerp = 0.018;
      fov = 48;
    } else {
      // Wide overlook for DHS intro
      _desiredPos.set(80, 320, 560);
      _desiredTarget.set(10, 40, 20);
      lerp = 0.016;
      fov = 46;
    }
  } else if (mode === "doorly") {
    const a = AnchorRegistry.getPosition("ANCHOR_BANKSIDE");
    _desiredPos.set(a.x + 160, 180, a.z + 200);
    _desiredTarget.set(a.x, 80, a.z);
    lerp = state.attentionMode === "editorial" ? 0.01 : 0.018;
  } else if (mode === "trsre") {
    const dgs = AnchorRegistry.getPosition("ANCHOR_DGS");
    const bankside = AnchorRegistry.getPosition("ANCHOR_BANKSIDE");
    // Hold one settled POV for intro + Discover (and later cards) —
    // travel here once on enter from DHS; no further scroll-driven moves.
    _desiredPos.set(bankside.x + 200, 574, bankside.z + 420);
    _desiredTarget.set(dgs.x, dgs.y + 140, dgs.z);
    lerp = 0.018;
    fov = 54;
  } else if (mode === "finale") {
    // Locked — scrolling the short finale must not keep moving the camera
    _desiredPos.set(0, 700, 620);
    _desiredTarget.set(0, 90, 0);
    lerp = 0.02;
  } else if (mode === "quiet" || mode === "overview") {
    _desiredPos.set(-120, 400, 620);
    _desiredTarget.set(40, 40, -20);
    lerp =
      state.attentionMode === "editorial"
        ? 0.04
        : 0.018;
  }

  return { lerp, fov };
}

export function CameraDirector() {
  const { camera } = useThree();
  const lookAt = useRef(new THREE.Vector3(...cameraDefaults.overview.target));
  const setCameraDebug = useScrollStore((s) => s.setCameraDebug);
  const setTowerCameraSettled = useScrollStore((s) => s.setTowerCameraSettled);
  const debugTimer = useRef(0);
  const vel = useRef(new THREE.Vector3());
  const lookVel = useRef(new THREE.Vector3());
  const lastActive = useRef<string | null>(null);
  const lastMode = useRef<string | null>(null);
  const lastDhsFocus = useRef<string | null>(null);
  const lastSnapNonce = useRef(0);
  const settledHold = useRef(0);

  useFrame((_, delta) => {
    const state = useScrollStore.getState();
    const active = state.activeDevelopment;
    const composition = compositionForState();
    let lerp = composition.lerp;
    const fov = composition.fov;

    // Hard cut (Start handoff) — skip easing so we don't fly from the default pose
    if (state.cameraSnapNonce !== lastSnapNonce.current) {
      lastSnapNonce.current = state.cameraSnapNonce;
      lastActive.current = active;
      lastMode.current = state.sceneMode;
      lastDhsFocus.current =
        state.activeBusinesses.length === 1
          ? state.activeBusinesses[0]
          : null;
      camera.position.copy(_desiredPos);
      lookAt.current.copy(_desiredTarget);
      vel.current.set(0, 0, 0);
      lookVel.current.set(0, 0, 0);
      settledHold.current = 0;
      setTowerCameraSettled(false);
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
      // Kill residual momentum so tower handoffs don't bounce
      vel.current.set(0, 0, 0);
      lookVel.current.set(0, 0, 0);
      settledHold.current = 0;
      if (state.towerCameraSettled) setTowerCameraSettled(false);
      lerp = Math.min(lerp, state.sceneMode === "approach" ? 0.018 : 0.024);
    }

    // DHS pin changes — commit toward the focused place
    const dhsFocus =
      state.sceneMode === "dhs" && state.activeBusinesses.length === 1
        ? state.activeBusinesses[0]
        : state.sceneMode === "dhs"
          ? "__wide__"
          : null;
    if (dhsFocus !== lastDhsFocus.current) {
      lastDhsFocus.current = dhsFocus;
      if (state.sceneMode === "dhs" && dhsFocus && dhsFocus !== "__wide__") {
        lerp = Math.max(lerp, 0.036);
      }
    }

    if (state.sceneMode !== lastMode.current) {
      const prev = lastMode.current;
      lastMode.current = state.sceneMode;
      if (state.sceneMode === "dhs" || state.sceneMode === "trsre") {
        // Arrive in the city / aerial frame without a hard stop
        vel.current.multiplyScalar(0.25);
        lookVel.current.multiplyScalar(0.25);
        lerp = Math.max(lerp, state.sceneMode === "trsre" ? 0.028 : 0.022);
      } else {
        vel.current.set(0, 0, 0);
        lookVel.current.set(0, 0, 0);
      }
      settledHold.current = 0;
      // Only clear settle when leaving the tour framing — not on every estate tick
      if (
        state.sceneMode === "approach" ||
        state.sceneMode === "reveal" ||
        state.sceneMode === "cover" ||
        state.sceneMode === "loading"
      ) {
        if (state.towerCameraSettled) setTowerCameraSettled(false);
      } else if (
        (state.sceneMode === "estate" || state.sceneMode === "estate-overview") &&
        prev !== "estate" &&
        prev !== "estate-overview"
      ) {
        if (state.towerCameraSettled) setTowerCameraSettled(false);
      }
      if (
        state.sceneMode === "approach" ||
        state.sceneMode === "reveal" ||
        state.sceneMode === "estate"
      ) {
        lerp = Math.min(lerp, 0.018);
      }
    }

    const dt = Math.min(delta, 0.05);
    const smooth = 1 - Math.exp(-lerp * 60 * dt);

    // Critically-damped-ish follow: damp velocity hard to avoid bungee overshoot
    _toPos.copy(_desiredPos).sub(camera.position);
    vel.current.lerp(_toPos, smooth);
    vel.current.multiplyScalar(0.82);
    camera.position.addScaledVector(vel.current, smooth);
    // Direct blend toward target so we can't spring past the destination
    camera.position.lerp(_desiredPos, smooth * 0.4);

    lookAt.current.lerp(_desiredTarget, smooth);
    lookVel.current.set(0, 0, 0);
    camera.lookAt(lookAt.current);

    if ("fov" in camera) {
      const persp = camera as THREE.PerspectiveCamera;
      persp.fov = THREE.MathUtils.lerp(persp.fov, fov, smooth);
      persp.updateProjectionMatrix();
    }

    // Cards wait until the camera is near the tower frame (city units are large)
    const mode = state.sceneMode;
    if (mode === "estate" || mode === "estate-overview") {
      const posDist = camera.position.distanceTo(_desiredPos);
      const lookDist = lookAt.current.distanceTo(_desiredTarget);
      const mobile = isMobileUiViewport();
      const closeEnough = mobile
        ? posDist < 160 && lookDist < 120
        : posDist < 90 && lookDist < 70;
      settledHold.current += dt;
      const settleAfter = mobile ? 0.35 : 1.1;
      // Distance settle OR time fallback so cards can never get stuck hidden
      if (
        !state.towerCameraSettled &&
        ((closeEnough && settledHold.current > 0.15) ||
          settledHold.current > settleAfter)
      ) {
        setTowerCameraSettled(true);
      }
    } else if (state.towerCameraSettled) {
      settledHold.current = 0;
      setTowerCameraSettled(false);
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
