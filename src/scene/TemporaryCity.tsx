"use client";

import { useMemo } from "react";
import { developments } from "@/config/developments";
import { AnchorRegistry } from "@/scene/AnchorRegistry";
import { seededRandom } from "@/scene/quality";
import { useScrollStore } from "@/store/scrollStore";
import { BUSINESS_ANCHORS } from "@/config/scene";

function CityBlocks({ density }: { density: number }) {
  const blocks = useMemo(() => {
    const rand = seededRandom(42);
    const items: {
      position: [number, number, number];
      scale: [number, number, number];
    }[] = [];
    const count = Math.floor(120 * density);
    for (let i = 0; i < count; i++) {
      const x = (rand() - 0.5) * 70;
      const z = (rand() - 0.5) * 70;
      if (Math.hypot(x, z) < 6) continue;
      const h = 1.5 + rand() * 8;
      const w = 1.2 + rand() * 2.2;
      const d = 1.2 + rand() * 2.2;
      items.push({
        position: [x, h / 2, z],
        scale: [w, h, d],
      });
    }
    return items;
  }, [density]);

  return (
    <group>
      {blocks.map((b, i) => (
        <mesh key={i} position={b.position} castShadow={false} receiveShadow>
          <boxGeometry args={b.scale} />
          <meshStandardMaterial
            color="#f1f0e8"
            roughness={0.92}
            metalness={0.02}
          />
        </mesh>
      ))}
    </group>
  );
}

function RenakerTowers({ active }: { active: string | null }) {
  return (
    <group>
      {developments.map((dev) => {
        const pos = AnchorRegistry.getPosition(dev.anchor);
        const isActive = active === dev.anchor;
        return (
          <group key={dev.id} position={[pos.x, 0, pos.z]}>
            <mesh position={[0, dev.tempHeight / 2, 0]}>
              <boxGeometry args={[3.2, dev.tempHeight, 3.2]} />
              <meshStandardMaterial
                color={isActive ? "#ebe4da" : dev.tempColor}
                roughness={0.55}
                metalness={0.15}
              />
            </mesh>
            <mesh position={[0, dev.tempHeight + 0.3, 0]}>
              <boxGeometry args={[3.4, 0.4, 3.4]} />
              <meshStandardMaterial
                color="#2a2a2e"
                roughness={0.4}
                metalness={0.3}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function BusinessMarkers({ scale = 1 }: { scale?: number }) {
  const active = useScrollStore((s) => s.activeBusinesses);
  const intensity = useScrollStore((s) => s.dhsIntensity);

  return (
    <group>
      {BUSINESS_ANCHORS.map((name) => {
        const pos = AnchorRegistry.getPosition(name);
        const focused = active.length === 1 && active[0] === name;
        const lit = active.includes(name) || intensity > 0.45;
        return (
          <mesh key={name} position={[pos.x, 12 * scale, pos.z]}>
            <sphereGeometry
              args={[Math.max(0.45, (focused ? 9 : 6) * scale), 16, 16]}
            />
            <meshStandardMaterial
              color={focused ? "#c4b5fd" : lit ? "#e8dcc8" : "#d4cfc4"}
              emissive={focused ? "#7c3aed" : lit ? "#f0e6d4" : "#000000"}
              emissiveIntensity={focused ? 1.8 : lit ? 0.85 : 0}
              roughness={0.35}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export function TemporaryCity({
  density = 1,
  markersOnly = false,
  hideTowers = false,
}: {
  density?: number;
  markersOnly?: boolean;
  /** Avoid duplicate box towers when real GLBs are loading */
  hideTowers?: boolean;
}) {
  const activeDev = useScrollStore((s) => s.activeDevelopment);
  const haze = useScrollStore((s) => s.haze);

  if (markersOnly) {
    return (
      <group visible={haze < 0.95}>
        <BusinessMarkers scale={1} />
      </group>
    );
  }

  return (
    <group visible={haze < 0.95}>
      <CityBlocks density={density} />
      {!hideTowers && <RenakerTowers active={activeDev} />}
      <BusinessMarkers scale={1} />
    </group>
  );
}
