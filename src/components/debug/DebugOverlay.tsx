"use client";

import { useSyncExternalStore } from "react";
import { useDebug3d } from "@/hooks/useDebug3d";
import { useScrollStore } from "@/store/scrollStore";
import { AnchorRegistry } from "@/scene/AnchorRegistry";
import {
  EMPTY_TOWER_DEBUG,
  TowerDebugRegistry,
} from "@/scene/TowerDebugRegistry";

export function DebugOverlay() {
  const enabled = useDebug3d();
  const sectionId = useScrollStore((s) => s.sectionId);
  const sectionProgress = useScrollStore((s) => s.sectionProgress);
  const sceneMode = useScrollStore((s) => s.sceneMode);
  const attentionMode = useScrollStore((s) => s.attentionMode);
  const coverReveal = useScrollStore((s) => s.coverReveal);
  const qualityProfile = useScrollStore((s) => s.qualityProfile);
  const modelLoadingState = useScrollStore((s) => s.modelLoadingState);
  const cameraPosition = useScrollStore((s) => s.cameraPosition);
  const cameraTarget = useScrollStore((s) => s.cameraTarget);
  const activeDevelopment = useScrollStore((s) => s.activeDevelopment);
  const estateBuildingProgress = useScrollStore((s) => s.estateBuildingProgress);

  const towers = useSyncExternalStore(
    (cb) => TowerDebugRegistry.subscribe(cb),
    () => TowerDebugRegistry.getAll(),
    () => EMPTY_TOWER_DEBUG,
  );

  if (!enabled) return null;

  const anchors = AnchorRegistry.getAll();
  const activeTower = activeDevelopment
    ? towers.find((t) => t.anchor === activeDevelopment)
    : null;

  return (
    <div className="debug-overlay" role="status" aria-live="polite">
      <strong>debug3d</strong>
      <div>
        section: {sectionId} ({sectionProgress.toFixed(2)})
      </div>
      <div>mode: {sceneMode}</div>
      <div>attention: {attentionMode}</div>
      <div>coverReveal: {coverReveal.toFixed(2)}</div>
      <div>quality: {qualityProfile}</div>
      <div>models: {modelLoadingState}</div>
      <div>active tower: {activeDevelopment ?? "—"}</div>
      <div>building p: {estateBuildingProgress.toFixed(2)}</div>
      <div>cam: {cameraPosition.map((n) => n.toFixed(1)).join(", ")}</div>
      <div>target: {cameraTarget.map((n) => n.toFixed(1)).join(", ")}</div>
      <div>ground y: {AnchorRegistry.getGroundY().toFixed(2)}</div>
      {activeTower && (
        <>
          <div className="mt-2 opacity-80">active model</div>
          <div>
            origin:{" "}
            {activeTower.origin.toArray().map((n) => n.toFixed(1)).join(", ")}
          </div>
          <div>
            bbox min:{" "}
            {activeTower.bboxMin.toArray().map((n) => n.toFixed(1)).join(", ")}
          </div>
          <div>
            bbox max:{" "}
            {activeTower.bboxMax.toArray().map((n) => n.toFixed(1)).join(", ")}
          </div>
        </>
      )}
      <div className="mt-2 opacity-80">anchors</div>
      {anchors.map((a) => (
        <div key={a.name} className="opacity-70">
          {a.name} [{a.source}]{" "}
          {a.position.toArray().map((n) => n.toFixed(1)).join(", ")}
        </div>
      ))}
    </div>
  );
}
