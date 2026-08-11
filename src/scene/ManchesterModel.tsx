"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { AnchorRegistry } from "@/scene/AnchorRegistry";
import { cityWorldScale, sceneAssets } from "@/config/scene";
import { useScrollStore } from "@/store/scrollStore";

const MATS = {
  building: new THREE.MeshLambertMaterial({ color: "#f0ebe3" }),
  road: new THREE.MeshLambertMaterial({ color: "#c4bdb0" }),
  pedestrian: new THREE.MeshLambertMaterial({ color: "#d8d1c4" }),
  terrain: new THREE.MeshLambertMaterial({ color: "#d0c9bb" }),
};

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _c = new THREE.Vector3();
const _center = new THREE.Vector3();

/**
 * OSM buildings ship as one merged mesh — hide the placeholder blocks under
 * Castle Wharf by carving triangles whose centroids fall near ANCHOR_CW.
 */
function carveBuildingsNearPoint(
  root: THREE.Object3D,
  worldPoint: THREE.Vector3,
  radius: number,
) {
  const radiusSq = radius * radius;

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    if (!/buildings/i.test(mesh.name)) return;

    mesh.updateWorldMatrix(true, false);
    const original = mesh.geometry;
    const source = original.index ? original.toNonIndexed() : original;
    const pos = source.attributes.position;
    if (!pos) return;

    const keep: number[] = [];
    for (let i = 0; i < pos.count; i += 3) {
      _a.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
      _b.fromBufferAttribute(pos, i + 1).applyMatrix4(mesh.matrixWorld);
      _c.fromBufferAttribute(pos, i + 2).applyMatrix4(mesh.matrixWorld);
      _center.copy(_a).add(_b).add(_c).multiplyScalar(1 / 3);

      const dx = _center.x - worldPoint.x;
      const dz = _center.z - worldPoint.z;
      if (dx * dx + dz * dz >= radiusSq) {
        keep.push(
          pos.getX(i),
          pos.getY(i),
          pos.getZ(i),
          pos.getX(i + 1),
          pos.getY(i + 1),
          pos.getZ(i + 1),
          pos.getX(i + 2),
          pos.getY(i + 2),
          pos.getZ(i + 2),
        );
      }
    }

    const carved = new THREE.BufferGeometry();
    carved.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(keep, 3),
    );
    carved.computeVertexNormals();
    if (source !== original) source.dispose();
    original.dispose();
    mesh.geometry = carved;
  });
}

/**
 * Loads Manchester city GLB, restores metre scale, styles the white city,
 * and ingests any named ANCHOR_* nodes into the registry (world space).
 * Lambert + shared materials keep the first scroll light on the GPU.
 */
export function ManchesterModel() {
  const setModelLoadingState = useScrollStore((s) => s.setModelLoadingState);
  const gltf = useGLTF(sceneAssets.manchester);
  const groupRef = useRef<THREE.Group>(null);

  const prepared = useMemo(() => {
    const root = gltf.scene.clone(true);

    root.traverse((obj) => {
      // Legacy helper masses (Three may strip the dot: Cube.006 → Cube006)
      if (
        obj.name === "Cube.006" ||
        obj.name === "Cube006" ||
        obj.name === "Icosphere.296" ||
        obj.name === "Icosphere296" ||
        obj.name.startsWith("Icosphere")
      ) {
        obj.visible = false;
        return;
      }

      if (/anchor_blade\s*[/_\\-]\s*360/i.test(obj.name)) {
        obj.name = "ANCHOR_BLADE_360";
      }
      if (obj.name.startsWith("ANCHOR_")) {
        obj.visible = false;
        return;
      }

      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;

      const name = (mesh.name || mesh.parent?.name || "").toLowerCase();
      if (name.includes("road") || name.includes("motorway")) {
        mesh.material = MATS.road;
      } else if (name.includes("pedestrian") || name.includes("areas")) {
        mesh.material = MATS.pedestrian;
      } else if (name.includes("terrain")) {
        mesh.material = MATS.terrain;
      } else {
        mesh.material = MATS.building;
      }

      mesh.castShadow = false;
      mesh.receiveShadow = false;
      mesh.frustumCulled = true;
    });

    return root;
  }, [gltf.scene]);

  useLayoutEffect(() => {
    setModelLoadingState("loading");
    const group = groupRef.current;
    if (!group) return;
    group.updateWorldMatrix(true, true);
    AnchorRegistry.ingestScene(group, true);

    // Remove the beige OSM stand-ins sitting under / beside Castle Wharf.
    // Nearest OSM building tris sit ~48m from the empty — clear a bit past that.
    const cw = AnchorRegistry.getPosition("ANCHOR_CW");
    carveBuildingsNearPoint(group, cw, 80);

    setModelLoadingState("ready");
  }, [prepared, setModelLoadingState]);

  return (
    <group ref={groupRef} scale={cityWorldScale} name="manchester-city">
      <primitive object={prepared} />
    </group>
  );
}
