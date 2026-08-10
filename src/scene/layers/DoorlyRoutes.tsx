"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { AnchorRegistry } from "@/scene/AnchorRegistry";
import { useScrollStore } from "@/store/scrollStore";
import { seededRandom } from "@/scene/quality";

export function DoorlyRoutes() {
  const intensity = useScrollStore((s) => s.doorlyIntensity);

  const routes = useMemo(() => {
    const target = AnchorRegistry.getPosition("ANCHOR_BANKSIDE");
    target.y = 50;
    const rand = seededRandom(99);
    return Array.from({ length: 5 }, (_, i) => {
      const angle = (i / 5) * Math.PI * 2 + rand() * 0.4;
      const dist = 180 + rand() * 160;
      const from = new THREE.Vector3(
        target.x + Math.cos(angle) * dist,
        12,
        target.z + Math.sin(angle) * dist,
      );
      const mid = from.clone().lerp(target, 0.5);
      mid.y = 70 + rand() * 40;
      return new THREE.QuadraticBezierCurve3(from, mid, target.clone());
    });
  }, []);

  if (intensity < 0.02) return null;

  return (
    <group>
      {routes.map((curve, i) => (
        <mesh key={i}>
          <tubeGeometry args={[curve, 40, 0.9, 5, false]} />
          <meshStandardMaterial
            color="#d8cfc0"
            emissive="#efe6d8"
            emissiveIntensity={0.55 * intensity}
            transparent
            opacity={0.5 * intensity}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}
