"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AnchorRegistry } from "@/scene/AnchorRegistry";
import { useScrollStore } from "@/store/scrollStore";
import { BUSINESS_ANCHORS } from "@/config/scene";
import { dhsSearchBeats } from "@/config/dhsWalkthrough";

const partners = dhsSearchBeats.map((b) => b.business);

/** Scattered offsets (city metres) around Deansgate — illustrative search hits */
const VISION_PULSE_OFFSETS: [number, number][] = [
  [90, 140],
  [-160, 60],
  [210, -80],
  [-40, -180],
  [280, 40],
  [-240, -40],
  [40, 220],
  [160, -160],
  [-120, 200],
  [320, -120],
  [-300, 100],
  [0, -260],
];

function makeCurve(from: THREE.Vector3, to: THREE.Vector3) {
  const mid = from.clone().lerp(to, 0.5);
  mid.y += 40 + from.distanceTo(to) * 0.12;
  return new THREE.QuadraticBezierCurve3(from, mid, to);
}

/** Proper tube paths for Digital High Street connections */
export function DigitalHighStreetPaths({ maxPaths = 6 }: { maxPaths?: number }) {
  const intensity = useScrollStore((s) => s.dhsIntensity);
  const active = useScrollStore((s) => s.activeBusinesses);

  const paths = useMemo(() => {
    const origin = AnchorRegistry.getPosition("ANCHOR_DGS");
    origin.y = 40;
    return BUSINESS_ANCHORS.slice(0, maxPaths).map((name) => {
      const to = AnchorRegistry.getPosition(name);
      to.y = 18;
      return { name, curve: makeCurve(origin, to) };
    });
  }, [maxPaths]);

  if (intensity < 0.01) return null;

  return (
    <group>
      {paths.map(({ name, curve }) => {
        const lit = active.includes(name);
        const focused = active.length === 1 && lit;
        return (
          <mesh key={name}>
            <tubeGeometry
              args={[curve, 48, focused ? 1.8 : lit ? 1.2 : 0.7, 6, false]}
            />
            <meshStandardMaterial
              color="#7c3aed"
              emissive="#8b5cf6"
              emissiveIntensity={
                0.25 + intensity * 0.55 + (focused ? 1.1 : lit ? 0.45 : 0)
              }
              transparent
              opacity={0.28 + intensity * 0.4 + (focused ? 0.35 : 0)}
              roughness={0.35}
            />
          </mesh>
        );
      })}
      <DigitalHighStreetHotspots />
      <DhsVisionPulses />
    </group>
  );
}

/** Purple building glow for focused / soft partner pins. */
function DigitalHighStreetHotspots() {
  const intensity = useScrollStore((s) => s.dhsIntensity);
  const active = useScrollStore((s) => s.activeBusinesses);
  const visionPulse = useScrollStore((s) => s.dhsVisionPulse);
  const focused = active.length === 1 ? active[0] : null;

  if (intensity < 0.05 || visionPulse) return null;

  return (
    <group>
      {partners.map((biz) => {
        const pos = AnchorRegistry.getPosition(biz.anchor);
        const on = focused === biz.anchor;
        const soft = !focused && active.includes(biz.anchor);
        if (!on && !soft && intensity < 0.35) return null;

        return (
          <group key={biz.id} position={[pos.x, 0, pos.z]}>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 1.2, 0]}
              renderOrder={2}
            >
              <circleGeometry args={[on ? 42 : 22, 40]} />
              <meshBasicMaterial
                color="#8b5cf6"
                transparent
                opacity={on ? 0.34 : soft ? 0.12 : 0.05}
                depthWrite={false}
              />
            </mesh>

            <mesh position={[0, on ? 28 : 16, 0]} renderOrder={2}>
              <cylinderGeometry
                args={[on ? 22 : 12, on ? 30 : 16, on ? 56 : 32, 28, 1, true]}
              />
              <meshBasicMaterial
                color="#7c3aed"
                transparent
                opacity={on ? 0.2 : soft ? 0.07 : 0.03}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>

            <mesh position={[0, on ? 18 : 10, 0]}>
              <sphereGeometry args={[on ? 5.5 : 3.2, 20, 20]} />
              <meshStandardMaterial
                color="#c4b5fd"
                emissive="#8b5cf6"
                emissiveIntensity={on ? 2.4 : 0.7}
                transparent
                opacity={on ? 0.95 : 0.45}
                roughness={0.25}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/**
 * Beat 4 — staggered purple pulses at scattered city points
 * while the illustrative query list plays.
 */
function DhsVisionPulses() {
  const active = useScrollStore((s) => s.dhsVisionPulse);
  const group = useRef<THREE.Group>(null);
  const mats = useRef<THREE.MeshBasicMaterial[]>([]);
  const cores = useRef<THREE.MeshStandardMaterial[]>([]);

  const points = useMemo(() => {
    const origin = AnchorRegistry.getPosition("ANCHOR_DGS");
    return VISION_PULSE_OFFSETS.map(([dx, dz], i) => ({
      id: `pulse-${i}`,
      x: origin.x + dx,
      z: origin.z + dz,
      phase: (i * 0.73) % Math.PI * 2,
      speed: 1.1 + (i % 5) * 0.22,
    }));
  }, []);

  useFrame(({ clock }) => {
    if (!active || !group.current) return;
    const t = clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      const meta = points[i];
      if (!meta) return;
      const wave = Math.sin(t * meta.speed + meta.phase);
      const pulse = Math.max(0, wave);
      const ring = mats.current[i];
      const core = cores.current[i];
      if (ring) {
        ring.opacity = 0.08 + pulse * 0.32;
      }
      if (core) {
        core.opacity = 0.2 + pulse * 0.75;
        core.emissiveIntensity = 0.4 + pulse * 2.2;
      }
      const scale = 0.55 + pulse * 1.15;
      child.scale.setScalar(scale);
    });
  });

  if (!active) return null;

  return (
    <group ref={group}>
      {points.map((p, i) => (
        <group key={p.id} position={[p.x, 0, p.z]}>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 1.4, 0]}
            renderOrder={2}
          >
            <circleGeometry args={[36, 36]} />
            <meshBasicMaterial
              ref={(m) => {
                if (m) mats.current[i] = m;
              }}
              color="#8b5cf6"
              transparent
              opacity={0.15}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, 14, 0]}>
            <sphereGeometry args={[4.2, 16, 16]} />
            <meshStandardMaterial
              ref={(m) => {
                if (m) cores.current[i] = m;
              }}
              color="#c4b5fd"
              emissive="#8b5cf6"
              emissiveIntensity={1}
              transparent
              opacity={0.55}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
