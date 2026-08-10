"use client";

import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AnchorRegistry } from "@/scene/AnchorRegistry";
import { TowerDebugRegistry } from "@/scene/TowerDebugRegistry";
import { renakerModelEntries, type AnchorName } from "@/config/scene";
import { getDevelopmentByAnchor } from "@/config/developments";
import { useScrollStore } from "@/store/scrollStore";
import { ModelErrorBoundary } from "@/scene/ModelErrorBoundary";

const _yaw = new THREE.Quaternion();
const _offset = new THREE.Vector3();

function TowerInstance({
  path,
  placeAt,
  anchors,
}: {
  path: string;
  placeAt: AnchorName;
  anchors: AnchorName[];
}) {
  const gltf = useGLTF(path);
  const rootRef = useRef<THREE.Group>(null);
  const activeDevelopment = useScrollStore((s) => s.activeDevelopment);

  const { offset, scene } = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.frustumCulled = true;
      mesh.castShadow = false;
      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map((m) => m.clone());
      } else if (mesh.material) {
        mesh.material = mesh.material.clone();
      }
    });

    // Preserve relative transforms inside the GLB; only rebase the assembly
    // so the footprint sits on the ground and is centred on the anchor.
    const box = new THREE.Box3().setFromObject(cloned);
    if (box.isEmpty()) {
      return { offset: new THREE.Vector3(), scene: cloned };
    }
    const center = box.getCenter(new THREE.Vector3());
    return {
      offset: new THREE.Vector3(-center.x, -box.min.y, -center.z),
      scene: cloned,
    };
  }, [gltf.scene]);

  useLayoutEffect(() => {
    const apply = () => {
      const root = rootRef.current;
      if (!root) return;

      const record = AnchorRegistry.getAnchor(placeAt);
      const dev = getDevelopmentByAnchor(placeAt);
      const placement = dev?.placement ?? {
        offset: [0, 0, 0] as [number, number, number],
        yawDeg: 0,
        scale: 1,
      };

      root.position.set(
        record.position.x + placement.offset[0],
        record.position.y + placement.offset[1],
        record.position.z + placement.offset[2],
      );

      _yaw.setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        THREE.MathUtils.degToRad(placement.yawDeg),
      );
      root.quaternion.copy(record.quaternion).multiply(_yaw);
      root.scale.setScalar(placement.scale);
      root.updateWorldMatrix(true, true);

      const worldBox = new THREE.Box3().setFromObject(root);
      const center = worldBox.getCenter(new THREE.Vector3());
      TowerDebugRegistry.set({
        anchor: placeAt,
        origin: root.getWorldPosition(_offset.clone()),
        bboxMin: worldBox.min.clone(),
        bboxMax: worldBox.max.clone(),
        bboxCenter: center,
      });
    };

    apply();
    const unsub = AnchorRegistry.subscribe(apply);
    return () => {
      unsub();
    };
  }, [placeAt, offset]);

  useFrame(() => {
    const active = !!(
      activeDevelopment && anchors.includes(activeDevelopment)
    );
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      for (const m of mats) {
        const mat = m as THREE.MeshStandardMaterial;
        if (!mat || !("emissiveIntensity" in mat)) continue;
        mat.emissiveIntensity = THREE.MathUtils.lerp(
          mat.emissiveIntensity,
          active ? 0.1 : 0,
          0.06,
        );
        if (active && mat.emissive.getHex() === 0) {
          mat.emissive.set("#C45C26");
        }
      }
    });
  });

  return (
    <group ref={rootRef} name={`tower-${placeAt}`}>
      <group position={offset.toArray()}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

/**
 * Places Renaker development GLBs at AnchorRegistry world poses.
 * Combined Blade/Three60 loads once.
 */
export function RenakerModels() {
  return (
    <group name="renaker-towers">
      {renakerModelEntries.map((entry) => (
        <ModelErrorBoundary key={entry.id} name={entry.id}>
          <Suspense fallback={null}>
            <TowerInstance
              path={entry.path}
              placeAt={entry.placeAt}
              anchors={entry.anchors}
            />
          </Suspense>
        </ModelErrorBoundary>
      ))}
    </group>
  );
}
