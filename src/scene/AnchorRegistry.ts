import * as THREE from "three";
import {
  ALL_ANCHORS,
  TEMPORARY_FALLBACK_ANCHORS,
  type AnchorName,
} from "@/config/scene";

export type AnchorSource = "glb" | "temporary-fallback";

export interface AnchorRecord {
  name: AnchorName;
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  source: AnchorSource;
  object?: THREE.Object3D;
}

const _origin = new THREE.Vector3();
const _down = new THREE.Vector3(0, -1, 0);
const _raycaster = new THREE.Raycaster();
_raycaster.far = 5000;

class AnchorRegistryImpl {
  private anchors = new Map<AnchorName, AnchorRecord>();
  private listeners = new Set<() => void>();
  /** Average foot height — debug only; each anchor has its own Y */
  private groundY = 0;

  constructor() {
    this.seedFallbacks();
  }

  getGroundY() {
    return this.groundY;
  }

  private seedFallbacks() {
    for (const name of ALL_ANCHORS) {
      const [x, y, z] = TEMPORARY_FALLBACK_ANCHORS[name];
      this.anchors.set(name, {
        name,
        position: new THREE.Vector3(x, y, z),
        quaternion: new THREE.Quaternion(),
        source: "temporary-fallback",
      });
    }
  }

  private resolveNames(objectName: string): AnchorName[] {
    const name = objectName.trim();
    // Blender empty for New Jackson — slash may be rewritten by exporters/loaders
    if (
      /anchor[_\s-]*blade/i.test(name) &&
      (/360|three\s*60/i.test(name) || /blade[\/_\\-]+360/i.test(name))
    ) {
      return ["ANCHOR_BLADE", "ANCHOR_360"];
    }
    if (
      name === "ANCHOR_BLADE/360" ||
      name === "ANCHOR_BLADE_360" ||
      name === "ANCHOR_BLADE-360" ||
      name === "ANCHOR_BLADE\\360"
    ) {
      return ["ANCHOR_BLADE", "ANCHOR_360"];
    }
    if (ALL_ANCHORS.includes(name as AnchorName)) {
      return [name as AnchorName];
    }
    return [];
  }

  /**
   * Raycast down through the city at XZ to find Terrain (preferred), then roads.
   * Never land on OSM building roofs near tower sites.
   */
  private sampleGroundY(
    x: number,
    z: number,
    meshes: THREE.Object3D[],
  ): number | null {
    _origin.set(x, 800, z);
    _raycaster.set(_origin, _down);
    const hits = _raycaster.intersectObjects(meshes, false);
    if (!hits.length) return null;

    const label = (h: THREE.Intersection) =>
      `${h.object.name || ""} ${h.object.parent?.name || ""}`.toLowerCase();

    const terrainHit = hits.find((h) => label(h).includes("terrain"));
    if (terrainHit) return terrainHit.point.y + 0.05;

    const deckHit = hits.find((h) => {
      const n = label(h);
      return (
        n.includes("road") ||
        n.includes("motorway") ||
        n.includes("pedestrian") ||
        n.includes("areas")
      );
    });
    if (deckHit) return deckHit.point.y + 0.05;

    // Last resort: lowest hit (avoid rooftops when several stacks)
    let lowest = hits[0];
    for (const h of hits) {
      if (h.point.y < lowest.point.y) lowest = h;
    }
    return lowest.point.y + 0.05;
  }

  /**
   * Inspect a loaded scene graph for named ANCHOR_* objects.
   * Foots each tower on Terrain under its XZ (not plinth bottom, not road max).
   */
  ingestScene(root: THREE.Object3D, warnMissing = true) {
    const found = new Set<AnchorName>();
    root.updateWorldMatrix(true, true);

    const meshes: THREE.Object3D[] = [];
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || mesh.visible === false) return;
      // Skip invisible anchor helpers
      if (mesh.name.startsWith("ANCHOR_")) return;
      const n = `${mesh.name} ${mesh.parent?.name || ""}`.toLowerCase();
      // Never sample building roofs for foot height
      if (n.includes("building") || n.includes("osm_buildings")) return;
      meshes.push(mesh);
    });

    const groundSamples: number[] = [];

    root.traverse((obj) => {
      if (/anchor/i.test(obj.name) && !this.resolveNames(obj.name).length) {
        console.warn(
          `[AnchorRegistry] Unresolved anchor-like object "${obj.name}"`,
        );
      }
      const names = this.resolveNames(obj.name);
      if (!names.length) return;

      const world = new THREE.Vector3();
      const quat = new THREE.Quaternion();
      obj.updateWorldMatrix(true, false);
      obj.matrixWorld.decompose(world, quat, new THREE.Vector3());

      const ground = this.sampleGroundY(world.x, world.z, meshes);
      world.y = ground ?? 0;
      if (ground != null) groundSamples.push(ground);

      for (const name of names) {
        this.anchors.set(name, {
          name,
          position: world.clone(),
          quaternion: quat.clone(),
          source: "glb",
          object: obj,
        });
        found.add(name);
      }
    });

    // Foot remaining fallbacks at a sensible average if any exist
    if (groundSamples.length) {
      this.groundY =
        groundSamples.reduce((a, b) => a + b, 0) / groundSamples.length;
      for (const name of ALL_ANCHORS) {
        if (found.has(name)) continue;
        const record = this.anchors.get(name);
        if (!record) continue;
        record.position.y = this.groundY;
      }
    } else {
      this.groundY = 0;
    }

    if (warnMissing) {
      for (const name of ALL_ANCHORS) {
        if (!found.has(name)) {
          console.warn(
            `[AnchorRegistry] Missing production anchor "${name}" — using TEMPORARY fallback coordinates.`,
          );
        }
      }
    }

    console.info(
      `[AnchorRegistry] Per-anchor ground heights (avg ${this.groundY.toFixed(2)})`,
      Object.fromEntries(
        [...found].map((n) => [
          n,
          this.anchors.get(n)?.position.y.toFixed(2),
        ]),
      ),
    );

    this.notify();
  }

  getAnchor(name: AnchorName): AnchorRecord {
    const record = this.anchors.get(name);
    if (!record) {
      console.warn(`[AnchorRegistry] Unknown anchor "${name}"`);
      const [x, y, z] = TEMPORARY_FALLBACK_ANCHORS[name] ?? [0, 0, 0];
      return {
        name,
        position: new THREE.Vector3(x, y, z),
        quaternion: new THREE.Quaternion(),
        source: "temporary-fallback",
      };
    }
    return record;
  }

  getPosition(name: AnchorName): THREE.Vector3 {
    return this.getAnchor(name).position.clone();
  }

  getQuaternion(name: AnchorName): THREE.Quaternion {
    return this.getAnchor(name).quaternion.clone();
  }

  getAll(): AnchorRecord[] {
    return ALL_ANCHORS.map((n) => this.getAnchor(n));
  }

  usingFallbacks(): boolean {
    return this.getAll().some((a) => a.source === "temporary-fallback");
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }
}

export const AnchorRegistry = new AnchorRegistryImpl();
