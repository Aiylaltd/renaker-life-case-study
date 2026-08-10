"use client";

import { useSyncExternalStore } from "react";
import { Html } from "@react-three/drei";
import { AnchorRegistry } from "@/scene/AnchorRegistry";
import {
  EMPTY_TOWER_DEBUG,
  TowerDebugRegistry,
} from "@/scene/TowerDebugRegistry";
import { useScrollStore } from "@/store/scrollStore";

export function DebugAnchors() {
  const anchors = AnchorRegistry.getAll();
  const cameraTarget = useScrollStore((s) => s.cameraTarget);
  const towers = useSyncExternalStore(
    (cb) => TowerDebugRegistry.subscribe(cb),
    () => TowerDebugRegistry.getAll(),
    () => EMPTY_TOWER_DEBUG,
  );

  return (
    <group>
      {/* Ground reference ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[40, 42, 64]} />
        <meshBasicMaterial color="#C45C26" transparent opacity={0.35} />
      </mesh>

      {anchors.map((a) => (
        <group key={a.name} position={a.position.toArray()}>
          <mesh>
            <sphereGeometry args={[8, 16, 16]} />
            <meshBasicMaterial
              color={a.source === "glb" ? "#2d6a4f" : "#C45C26"}
            />
          </mesh>
          {/* Vertical axis to ground */}
          <mesh position={[0, 40, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 80, 6]} />
            <meshBasicMaterial
              color={a.source === "glb" ? "#2d6a4f" : "#C45C26"}
              transparent
              opacity={0.5}
            />
          </mesh>
          <Html distanceFactor={80} style={{ pointerEvents: "none" }}>
            <div className="rounded bg-ink/85 px-2 py-1 text-[10px] text-stone whitespace-nowrap">
              {a.name}
              <br />
              {a.position.x.toFixed(1)}, {a.position.y.toFixed(1)},{" "}
              {a.position.z.toFixed(1)}
              <br />
              <span className="opacity-70">{a.source}</span>
            </div>
          </Html>
        </group>
      ))}

      {towers.map((t) => {
        const size = t.bboxMax.clone().sub(t.bboxMin);
        return (
          <group key={`bbox-${t.anchor}`}>
            <mesh position={t.bboxCenter.toArray()}>
              <boxGeometry args={[size.x, size.y, size.z]} />
              <meshBasicMaterial
                color="#C45C26"
                wireframe
                transparent
                opacity={0.45}
              />
            </mesh>
            <mesh position={t.origin.toArray()}>
              <sphereGeometry args={[5, 12, 12]} />
              <meshBasicMaterial color="#f5f2ed" />
            </mesh>
          </group>
        );
      })}

      {/* Camera look-at */}
      <mesh position={cameraTarget}>
        <octahedronGeometry args={[6]} />
        <meshBasicMaterial color="#60a5fa" />
      </mesh>
    </group>
  );
}
