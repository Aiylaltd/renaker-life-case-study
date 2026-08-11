"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { AnchorRegistry } from "@/scene/AnchorRegistry";
import { useScrollStore } from "@/store/scrollStore";
import { BUSINESS_ANCHORS } from "@/config/scene";

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
        return (
          <mesh key={name}>
            <tubeGeometry args={[curve, 48, lit ? 1.4 : 0.8, 6, false]} />
            <meshStandardMaterial
              color="#7c3aed"
              emissive="#8b5cf6"
              emissiveIntensity={0.35 + intensity * 0.85 + (lit ? 0.7 : 0)}
              transparent
              opacity={0.4 + intensity * 0.55}
              roughness={0.35}
            />
          </mesh>
        );
      })}
    </group>
  );
}
