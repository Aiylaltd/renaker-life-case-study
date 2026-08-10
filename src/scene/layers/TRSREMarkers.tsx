"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { trsrePinConfig } from "@/config/scene";
import { seededRandom } from "@/scene/quality";
import { useScrollStore } from "@/store/scrollStore";

export function TRSREMarkers({ maxPins = 40 }: { maxPins?: number }) {
  const intensity = useScrollStore((s) => s.trsreIntensity);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const positions = useMemo(() => {
    const rand = seededRandom(trsrePinConfig.seed);
    const count = Math.min(trsrePinConfig.count, maxPins);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      let x = 0;
      let z = 0;
      for (let attempt = 0; attempt < 6; attempt++) {
        x = (rand() - 0.5) * trsrePinConfig.spreadX;
        z = (rand() - 0.5) * trsrePinConfig.spreadZ;
        if (Math.hypot(x, z) > 80) break;
      }
      const y =
        trsrePinConfig.minY +
        rand() * (trsrePinConfig.maxY - trsrePinConfig.minY);
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  }, [maxPins]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.visible = intensity > 0.01;
    const t = clock.getElapsedTime();
    const reveal = Math.floor(intensity * positions.length);

    positions.forEach((p, i) => {
      const shown = i < reveal;
      const pulse = shown ? 1 + Math.sin(t * 2.2 + i) * 0.08 : 0;
      dummy.position.copy(p);
      dummy.scale.setScalar(
        shown ? 4.5 * pulse * Math.min(1, intensity * 1.4) : 0,
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, positions.length]}
      frustumCulled
    >
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#2a2a2e"
        emissive="#d4c4a8"
        emissiveIntensity={0.9}
        roughness={0.35}
      />
    </instancedMesh>
  );
}

export function TRSRERoutes() {
  const intensity = useScrollStore((s) => s.trsreIntensity);

  const routes = useMemo(() => {
    const rand = seededRandom(trsrePinConfig.seed + 7);
    return Array.from({ length: 4 }, () => {
      const a = new THREE.Vector3(
        (rand() - 0.5) * 700,
        10,
        (rand() - 0.5) * 700,
      );
      const b = new THREE.Vector3(
        (rand() - 0.5) * 700,
        10,
        (rand() - 0.5) * 700,
      );
      const mid = a.clone().lerp(b, 0.5);
      mid.y = 40;
      return new THREE.QuadraticBezierCurve3(a, mid, b);
    });
  }, []);

  if (intensity < 0.2) return null;

  return (
    <group>
      {routes.map((curve, i) => (
        <mesh key={i}>
          <tubeGeometry args={[curve, 32, 0.7, 5, false]} />
          <meshStandardMaterial
            color="#cfc3b0"
            emissive="#e8dcc8"
            emissiveIntensity={0.4 * intensity}
            transparent
            opacity={0.45 * intensity}
          />
        </mesh>
      ))}
    </group>
  );
}
