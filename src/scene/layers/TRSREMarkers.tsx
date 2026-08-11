"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { trsrePins, type TrsrePinDifficulty } from "@/config/trsre";
import { useScrollStore } from "@/store/scrollStore";

const PIN_ORDER: TrsrePinDifficulty[] = ["easy", "medium", "hard"];

/** A few pins only — placed in the DHS→TRSRE camera field of view */
const FOV_PINS: { offset: [number, number, number]; difficulty: TrsrePinDifficulty }[] =
  [
    { offset: [-35, 22, 55], difficulty: "easy" },
    { offset: [48, 18, 20], difficulty: "medium" },
    { offset: [10, 26, -25], difficulty: "hard" },
    { offset: [-55, 16, -10], difficulty: "easy" },
    { offset: [70, 20, 70], difficulty: "medium" },
    { offset: [-15, 24, 95], difficulty: "hard" },
  ];

type PinDatum = {
  position: THREE.Vector3;
  difficulty: TrsrePinDifficulty;
};

function usePinTextures() {
  const [easy, medium, hard] = useLoader(THREE.TextureLoader, [
    trsrePins.easy,
    trsrePins.medium,
    trsrePins.hard,
  ]);

  useEffect(() => {
    for (const tex of [easy, medium, hard]) {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
    }
  }, [easy, medium, hard]);

  return { easy, medium, hard } as const;
}

function PinSprites({
  pins,
  textures,
}: {
  pins: PinDatum[];
  textures: Record<TrsrePinDifficulty, THREE.Texture>;
}) {
  const intensity = useScrollStore((s) => s.trsreIntensity);
  const group = useRef<THREE.Group>(null);
  const materials = useMemo(
    () =>
      pins.map(
        (pin) =>
          new THREE.SpriteMaterial({
            map: textures[pin.difficulty],
            transparent: true,
            depthWrite: false,
            opacity: 0,
          }),
      ),
    [pins, textures],
  );

  useEffect(() => {
    return () => {
      materials.forEach((m) => m.dispose());
    };
  }, [materials]);

  useFrame(() => {
    if (!group.current) return;
    group.current.visible = intensity > 0.02;
    const reveal = Math.floor(Math.min(1, intensity * 1.2) * pins.length);

    group.current.children.forEach((child, i) => {
      const sprite = child as THREE.Sprite;
      const shown = i < reveal;
      // Small + quiet — no pulsing
      const s = shown ? 11 * Math.min(1, 0.7 + intensity * 0.35) : 0;
      sprite.scale.set(s, s, 1);
      const mat = sprite.material as THREE.SpriteMaterial;
      mat.opacity = shown ? Math.min(0.72, 0.28 + intensity * 0.4) : 0;
    });
  });

  return (
    <group ref={group}>
      {pins.map((pin, i) => (
        <sprite
          key={`${pin.difficulty}-${i}`}
          position={pin.position}
          material={materials[i]}
          frustumCulled
        />
      ))}
    </group>
  );
}

export function TRSREMarkers({ maxPins = 6 }: { maxPins?: number }) {
  const textures = usePinTextures();

  const pins = useMemo(() => {
    // Anchored around the TRSRE look-at so they sit in the current FOV
    const origin = new THREE.Vector3(25, 20, 30);
    return FOV_PINS.slice(0, Math.min(maxPins, FOV_PINS.length)).map(
      (pin, i) => ({
        position: origin
          .clone()
          .add(new THREE.Vector3(...pin.offset)),
        difficulty: pin.difficulty ?? PIN_ORDER[i % PIN_ORDER.length],
      }),
    );
  }, [maxPins]);

  return <PinSprites pins={pins} textures={textures} />;
}

/** Kept for SceneManager import compatibility — no busy route web on TRSRE */
export function TRSRERoutes() {
  return null;
}
