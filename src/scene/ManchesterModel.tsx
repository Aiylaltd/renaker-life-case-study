"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { AnchorRegistry } from "@/scene/AnchorRegistry";
import { cityWorldScale, sceneAssets } from "@/config/scene";
import { useScrollStore } from "@/store/scrollStore";

/**
 * Loads Manchester city GLB, restores metre scale, styles the white city,
 * and ingests any named ANCHOR_* nodes into the registry (world space).
 */
export function ManchesterModel() {
  const setModelLoadingState = useScrollStore((s) => s.setModelLoadingState);
  const gltf = useGLTF(sceneAssets.manchester);
  const groupRef = useRef<THREE.Group>(null);

  const prepared = useMemo(() => {
    const root = gltf.scene.clone(true);

    root.traverse((obj) => {
      // Strip Blender leftovers that aren't part of the city
      if (
        obj.name === "Cube.006" ||
        obj.name === "Icosphere.296" ||
        obj.name.startsWith("Icosphere")
      ) {
        obj.visible = false;
        return;
      }

      // Anchor empties stay in the graph for ingest, but never render
      if (obj.name.startsWith("ANCHOR_")) {
        obj.visible = false;
        return;
      }

      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;

      const name = (mesh.name || mesh.parent?.name || "").toLowerCase();
      const isRoad = name.includes("road") || name.includes("motorway");
      const isPedestrian =
        name.includes("pedestrian") || name.includes("areas");
      const isTerrain = name.includes("terrain");

      let color = "#ebe6dc";
      let roughness = 0.88;
      if (isRoad) {
        color = "#c4bdb0";
        roughness = 0.95;
      } else if (isPedestrian) {
        color = "#d8d1c4";
        roughness = 0.9;
      } else if (isTerrain) {
        color = "#d0c9bb";
        roughness = 1;
      } else {
        color = "#f4f1ea";
      }

      mesh.material = new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness: 0.02,
      });
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      mesh.frustumCulled = true;
    });

    return root;
  }, [gltf.scene]);

  useLayoutEffect(() => {
    setModelLoadingState("loading");
    const group = groupRef.current;
    if (!group) return;
    group.updateWorldMatrix(true, true);
    // Raycast each anchor onto Terrain so towers sit on the local surface
    AnchorRegistry.ingestScene(group, true);
    setModelLoadingState("ready");
  }, [prepared, setModelLoadingState]);

  return (
    <group ref={groupRef} scale={cityWorldScale} name="manchester-city">
      <primitive object={prepared} />
    </group>
  );
}
