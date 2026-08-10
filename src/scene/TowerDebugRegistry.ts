import * as THREE from "three";
import type { AnchorName } from "@/config/scene";

export interface TowerDebugRecord {
  anchor: AnchorName;
  origin: THREE.Vector3;
  bboxMin: THREE.Vector3;
  bboxMax: THREE.Vector3;
  bboxCenter: THREE.Vector3;
}

const EMPTY: TowerDebugRecord[] = [];

class TowerDebugRegistryImpl {
  private towers = new Map<AnchorName, TowerDebugRecord>();
  private cache: TowerDebugRecord[] = EMPTY;
  private listeners = new Set<() => void>();

  set(record: TowerDebugRecord) {
    this.towers.set(record.anchor, record);
    this.cache = [...this.towers.values()];
    this.listeners.forEach((fn) => fn());
  }

  get(anchor: AnchorName) {
    return this.towers.get(anchor);
  }

  getAll() {
    return this.cache;
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }
}

export const TowerDebugRegistry = new TowerDebugRegistryImpl();
export const EMPTY_TOWER_DEBUG = EMPTY;
