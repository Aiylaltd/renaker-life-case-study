"use client";

import {
  Suspense,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { AnchorRegistry } from "@/scene/AnchorRegistry";
import { TowerDebugRegistry } from "@/scene/TowerDebugRegistry";
import {
  renakerModelEntries,
  type AnchorName,
} from "@/config/scene";
import { getDevelopmentByAnchor } from "@/config/developments";
import { ModelErrorBoundary } from "@/scene/ModelErrorBoundary";
import { useScrollStore, type SceneMode } from "@/store/scrollStore";
import { isMobileUiViewport } from "@/hooks/useIsMobileUi";

const _yaw = new THREE.Quaternion();
const _offset = new THREE.Vector3();
const _yAxis = new THREE.Vector3(0, 1, 0);
const _size = new THREE.Vector3();

/** Modes where the camera is wide / city-scale — keep only a light DGS stub. */
const WIDE_SCENE_MODES: SceneMode[] = [
  "dhs",
  "doorly",
  "trsre",
  "finale",
  "home",
  "quiet",
];

function materialName(mat: THREE.Material | THREE.Material[] | undefined) {
  if (!mat) return "";
  if (Array.isArray(mat)) return mat.map((m) => m.name || "").join("|");
  return mat.name || "";
}

function entryIdForAnchor(anchor: AnchorName) {
  return (
    renakerModelEntries.find((e) =>
      (e.anchors as string[]).includes(anchor),
    )?.id ?? null
  );
}

function clearTowerCache(id: string) {
  const entry = renakerModelEntries.find((e) => e.id === id);
  if (!entry) return;
  try {
    useGLTF.clear(entry.path);
  } catch {
    /* cache miss is fine */
  }
}

/** Kill transmission / clearcoat / sheen — huge iOS Metal cost vs looks. */
function stripHeavyMaterials(mat: THREE.Material) {
  const m = mat as THREE.MeshPhysicalMaterial;
  if ("transmission" in m) m.transmission = 0;
  if ("thickness" in m) m.thickness = 0;
  if ("attenuationDistance" in m) m.attenuationDistance = Infinity;
  if ("clearcoat" in m) m.clearcoat = 0;
  if ("sheen" in m) m.sheen = 0;
  if ("iridescence" in m) m.iridescence = 0;
  if ("specularIntensity" in m) m.specularIntensity = 0.2;
  if ("envMapIntensity" in m) m.envMapIntensity = 0;
  if ("emissiveIntensity" in m) {
    m.emissiveIntensity = 0;
    m.emissive?.setHex?.(0);
  }
}

function TowerInstance({
  path,
  placeAt,
  hideObjectNames = [],
  hideMaterialNames = [],
  simplifyMaterials = false,
}: {
  path: string;
  placeAt: AnchorName;
  anchors: AnchorName[];
  hideObjectNames?: string[];
  hideMaterialNames?: string[];
  simplifyMaterials?: boolean;
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
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : mesh.material
          ? [mesh.material]
          : [];
      for (const m of mats) {
        if (simplifyMaterials) {
          stripHeavyMaterials(m);
        } else {
          const mat = m as THREE.MeshStandardMaterial;
          if (mat && "emissiveIntensity" in mat) {
            mat.emissiveIntensity = 0;
            mat.emissive?.setHex?.(0);
          }
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
  }, [gltf.scene, hideNames, hideMats, placeAt, simplifyMaterials]);

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

function sameSet(a: Set<string>, b: Set<string>) {
  if (a.size !== b.size) return false;
  for (const id of a) if (!b.has(id)) return false;
  return true;
}

/**
 * Places Renaker development GLBs at AnchorRegistry world poses.
 * Mobile: keep at most active + previous tower during the estate tour.
 * Only drop to a DGS stub after leaving the estate (DHS+) — never on
 * estate-overview (null active), or iOS OOMs / context-loss after Castle Wharf.
 */
export function RenakerModels() {
  const profile = useScrollStore((s) => s.qualityProfile);
  const active = useScrollStore((s) => s.activeDevelopment);
  const sceneMode = useScrollStore((s) => s.sceneMode);
  const [mobileLoaded, setMobileLoaded] = useState(() => new Set(["dgs"]));
  const previousIdRef = useRef<string | null>(null);
  const clearTimerRef = useRef<number | null>(null);
  // Guard against store defaulting to desktop before the profile effect runs.
  const lightPath = profile !== "desktop" || isMobileUiViewport();
  const simplifyMaterials = lightPath;

  useEffect(() => {
    if (!lightPath) return;

    const scheduleClear = (ids: string[]) => {
      if (ids.length === 0) return;
      if (clearTimerRef.current != null) {
        window.clearTimeout(clearTimerRef.current);
      }
      // Let React unmount meshes before dropping the GLTF cache (iOS crash fix).
      clearTimerRef.current = window.setTimeout(() => {
        clearTimerRef.current = null;
        ids.forEach(clearTowerCache);
      }, 600);
    };

    const postEstate = WIDE_SCENE_MODES.includes(sceneMode);

    if (postEstate) {
      const keep = new Set(["dgs"]);
      previousIdRef.current = null;
      setMobileLoaded((prev) => {
        if (sameSet(prev, keep)) return prev;
        scheduleClear([...prev].filter((id) => !keep.has(id)));
        return keep;
      });
      return;
    }

    // Estate tour (incl. estate-overview with null active): never wipe to DGS-only.
    if (!active) {
      setMobileLoaded((prev) => (prev.size === 0 ? new Set(["dgs"]) : prev));
      return;
    }

    const keep = new Set<string>();
    const current = entryIdForAnchor(active);
    if (current) {
      keep.add(current);
      if (previousIdRef.current && previousIdRef.current !== current) {
        keep.add(previousIdRef.current);
      }
      previousIdRef.current = current;
    } else {
      keep.add("dgs");
    }

    setMobileLoaded((prev) => {
      if (sameSet(prev, keep)) return prev;
      scheduleClear([...prev].filter((id) => !keep.has(id)));
      return keep;
    });
  }, [active, lightPath, sceneMode]);

  useEffect(() => {
    return () => {
      if (clearTimerRef.current != null) {
        window.clearTimeout(clearTimerRef.current);
      }
    };
  }, []);

  const entries = !lightPath
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
              simplifyMaterials={simplifyMaterials}
            />
          </Suspense>
        </ModelErrorBoundary>
      ))}
    </group>
  );
}
