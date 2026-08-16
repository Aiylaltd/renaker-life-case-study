"use client";

import { Suspense, useLayoutEffect, useMemo, useRef, useState, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { AnchorRegistry } from "@/scene/AnchorRegistry";
import { TowerDebugRegistry } from "@/scene/TowerDebugRegistry";
import { renakerModelEntries, type AnchorName } from "@/config/scene";
import { getDevelopmentByAnchor } from "@/config/developments";
import { ModelErrorBoundary } from "@/scene/ModelErrorBoundary";
import { useScrollStore } from "@/store/scrollStore";

const _yaw = new THREE.Quaternion();
const _offset = new THREE.Vector3();
const _yAxis = new THREE.Vector3(0, 1, 0);
const _size = new THREE.Vector3();

function materialName(mat: THREE.Material | THREE.Material[] | undefined) {
  if (!mat) return "";
  if (Array.isArray(mat)) return mat.map((m) => m.name || "").join("|");
  return mat.name || "";
}

function TowerInstance({
  path,
  placeAt,
  hideObjectNames = [],
  hideMaterialNames = [],
}: {
  path: string;
  placeAt: AnchorName;
  anchors: AnchorName[];
  hideObjectNames?: string[];
  hideMaterialNames?: string[];
}) {
  const gltf = useGLTF(path);
  const rootRef = useRef<THREE.Group>(null);
  const hideKey = `${hideObjectNames.join("|")}::${hideMaterialNames.join("|")}`;
  const hideNames = useMemo(
    () => new Set(hideObjectNames),
    [hideKey, hideObjectNames],
  );
  const hideMats = useMemo(
    () => new Set(hideMaterialNames.map((n) => n.toLowerCase())),
    [hideKey, hideMaterialNames],
  );

  const { offset, scene } = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    const toRemove: THREE.Object3D[] = [];
    cloned.updateMatrixWorld(true);
    cloned.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      const byName = hideNames.has(obj.name);
      const byMat =
        mesh.isMesh &&
        hideMats.size > 0 &&
        materialName(mesh.material)
          .split("|")
          .some((n) => hideMats.has(n.toLowerCase()));

      // Crown Street: drop huge thin ground pads sitting at site level
      let byFootprint = false;
      if (mesh.isMesh && placeAt === "ANCHOR_CROWNST") {
        const box = new THREE.Box3().setFromObject(mesh);
        if (!box.isEmpty()) {
          const size = box.getSize(_size);
          const area = size.x * size.z;
          byFootprint = box.min.y < 2.5 && size.y < 3.5 && area > 250;
        }
      }

      if (byName || byMat || byFootprint) {
        toRemove.push(obj);
        return;
      }
      if (!mesh.isMesh) return;
      mesh.frustumCulled = true;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      // Kill any authored emissive so selected towers never pick up orange glow
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : mesh.material
          ? [mesh.material]
          : [];
      for (const m of mats) {
        const mat = m as THREE.MeshStandardMaterial;
        if (mat && "emissiveIntensity" in mat) {
          mat.emissiveIntensity = 0;
          mat.emissive?.setHex?.(0);
        }
      }
    });
    for (const obj of toRemove) {
      obj.parent?.remove(obj);
    }

    // Keep authored XZ origin (matches Blender empties). Only lift so the
    // lowest mesh point sits on y=0 — centering XZ misplaces Blade/Three60.
    const box = new THREE.Box3().setFromObject(cloned);
    if (box.isEmpty()) {
      return { offset: new THREE.Vector3(), scene: cloned };
    }
    return {
      offset: new THREE.Vector3(0, -box.min.y, 0),
      scene: cloned,
    };
  }, [gltf.scene, hideNames, hideMats, placeAt]);

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
        _yAxis,
        THREE.MathUtils.degToRad(placement.yawDeg),
      );
      root.quaternion.copy(record.quaternion).multiply(_yaw);
      root.scale.setScalar(placement.scale);
      root.updateWorldMatrix(true, true);

      // Final foot correction after rotation/scale (prevents float/sink).
      const worldBox = new THREE.Box3().setFromObject(root);
      if (!worldBox.isEmpty()) {
        root.position.y += record.position.y - worldBox.min.y;
        root.updateWorldMatrix(true, true);
      }

      const settled = new THREE.Box3().setFromObject(root);
      const center = settled.getCenter(new THREE.Vector3());
      TowerDebugRegistry.set({
        anchor: placeAt,
        origin: root.getWorldPosition(_offset.clone()),
        bboxMin: settled.min.clone(),
        bboxMax: settled.max.clone(),
        bboxCenter: center,
      });
    };

    apply();
    const unsub = AnchorRegistry.subscribe(apply);
    return () => {
      unsub();
    };
  }, [placeAt, offset]);

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
 * Mobile: load only the active tower (+ DGS seed) to avoid Safari OOM.
 */
export function RenakerModels() {
  const profile = useScrollStore((s) => s.qualityProfile);
  const active = useScrollStore((s) => s.activeDevelopment);
  const [mobileLoaded, setMobileLoaded] = useState(() => new Set(["dgs"]));

  useEffect(() => {
    if (profile === "desktop") return;
    if (!active) return;
    const entry = renakerModelEntries.find((e) =>
      (e.anchors as string[]).includes(active),
    );
    if (!entry) return;
    setMobileLoaded((prev) => {
      if (prev.has(entry.id)) return prev;
      const next = new Set(prev);
      next.add(entry.id);
      return next;
    });
  }, [active, profile]);

  const entries =
    profile === "desktop"
      ? renakerModelEntries
      : renakerModelEntries.filter((e) => mobileLoaded.has(e.id));

  return (
    <group name="renaker-towers">
      {entries.map((entry) => (
        <ModelErrorBoundary key={entry.id} name={entry.id}>
          <Suspense fallback={null}>
            <TowerInstance
              path={entry.path}
              placeAt={entry.placeAt}
              anchors={entry.anchors}
              hideObjectNames={entry.hideObjectNames}
              hideMaterialNames={entry.hideMaterialNames}
            />
          </Suspense>
        </ModelErrorBoundary>
      ))}
    </group>
  );
}
