"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useScrollStore } from "@/store/scrollStore";
import { seededRandom } from "@/scene/quality";

/** Procedural placeholder for the final Aiyla orb asset. */
export function FinaleOrb() {
  const reveal = useScrollStore((s) => s.orbReveal);
  const haze = useScrollStore((s) => s.haze);
  const group = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const rand = seededRandom(314);
    const count = 80;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 8 + rand() * 22;
      const theta = rand() * Math.PI * 2;
      const phi = rand() * Math.PI;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi) * 0.5 + 8;
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.visible = reveal > 0.01 || haze > 0.4;
    const t = clock.getElapsedTime();
    group.current.rotation.y = t * 0.12;
    if (pointsRef.current) {
      pointsRef.current.rotation.y = -t * 0.05;
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = Math.min(1, haze * 0.8 + reveal * 0.4);
    }
  });

  return (
    <group ref={group} position={[0, 10, 0]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.18}
          color="#e8e0f4"
          transparent
          opacity={0.5}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <mesh scale={Math.max(0.001, reveal)}>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshStandardMaterial
          color="#2a1f38"
          emissive="#8b6bb8"
          emissiveIntensity={0.85 * reveal}
          roughness={0.25}
          metalness={0.4}
          transparent
          opacity={0.92}
        />
      </mesh>
      <mesh scale={Math.max(0.001, reveal * 1.35)}>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial
          color="#c9a0e8"
          transparent
          opacity={0.12 * reveal}
          wireframe
        />
      </mesh>
    </group>
  );
}
