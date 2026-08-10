import * as THREE from "three";

export function projectToScreen(
  world: THREE.Vector3,
  camera: THREE.Camera,
  width: number,
  height: number,
): { x: number; y: number; visible: boolean } {
  const v = world.clone().project(camera);
  const visible = v.z > -1 && v.z < 1;
  return {
    x: (v.x * 0.5 + 0.5) * width,
    y: (-v.y * 0.5 + 0.5) * height,
    visible,
  };
}
