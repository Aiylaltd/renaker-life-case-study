"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { trsrePins, type TrsrePinDifficulty } from "@/config/trsre";
import { trsrePinConfig } from "@/config/scene";
import { useScrollStore } from "@/store/scrollStore";
import { AnchorRegistry } from "@/scene/AnchorRegistry";

const PIN_ORDER: TrsrePinDifficulty[] = ["easy", "medium", "hard"];

/** Clearance above city / plinth so markers sit in open air */
const PLINTH_CLEARANCE = 88;

/** Distance where pin scale ≈ base size (city metres) */
const SCALE_REF_DIST = 520;
const SCALE_BASE = 52;
const SCALE_MIN = 20;
const SCALE_MAX = 120;

/**
 * ~15 hunt pins — wide scatter across the Bankside → Deansgate aerial FOV.
 */
const FOV_PINS: { offset: [number, number]; difficulty: TrsrePinDifficulty }[] =
  [
    { offset: [-280, 320], difficulty: "easy" },
    { offset: [340, 180], difficulty: "medium" },
    { offset: [80, -260], difficulty: "hard" },
    { offset: [-420, 40], difficulty: "easy" },
    { offset: [460, 380], difficulty: "medium" },
    { offset: [-120, 480], difficulty: "hard" },
    { offset: [220, 520], difficulty: "easy" },
    { offset: [-500, 260], difficulty: "medium" },
    { offset: [380, -80], difficulty: "hard" },
    { offset: [-200, -300], difficulty: "easy" },
    { offset: [140, -420], difficulty: "medium" },
    { offset: [520, 120], difficulty: "hard" },
    { offset: [-360, 540], difficulty: "easy" },
    { offset: [40, 280], difficulty: "medium" },
    { offset: [300, 640], difficulty: "hard" },
  ];

type PinDatum = {
  x: number;
  z: number;
  difficulty: TrsrePinDifficulty;
};

const _pinWorld = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();

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

/**
 * Full camera-facing billboards (always flat to the lens) + light disc bases.
 * Scale falls off with distance for depth.
 */
function HuntPins({
  pins,
  textures,
}: {
  pins: PinDatum[];
  textures: Record<TrsrePinDifficulty, THREE.Texture>;
}) {
  const intensity = useScrollStore((s) => s.trsreIntensity);
  const showPins = useScrollStore((s) => s.trsreShowPins);
  const { camera } = useThree();
  const root = useRef<THREE.Group>(null);
  const cardRefs = useRef<(THREE.Mesh | null)[]>([]);
  const revealRef = useRef(0);

  const planeGeo = useMemo(() => new THREE.PlaneGeometry(1, 1.28), []);
  const baseGeo = useMemo(() => new THREE.CircleGeometry(1, 18), []);

  const pinMats = useMemo(() => {
    const mk = (map: THREE.Texture) =>
      new THREE.MeshBasicMaterial({
        map,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        opacity: 0,
      });
    return {
      easy: mk(textures.easy),
      medium: mk(textures.medium),
      hard: mk(textures.hard),
    };
  }, [textures]);

  const baseMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#f7f6f3",
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    [],
  );

  useEffect(() => {
    return () => {
      planeGeo.dispose();
      baseGeo.dispose();
      pinMats.easy.dispose();
      pinMats.medium.dispose();
      pinMats.hard.dispose();
      baseMat.dispose();
    };
  }, [planeGeo, baseGeo, pinMats, baseMat]);

  useFrame((_, delta) => {
    if (!root.current) return;

    const grounded = Math.max(
      trsrePinConfig.minY + 20,
      AnchorRegistry.getGroundY() + PLINTH_CLEARANCE,
    );
    root.current.children.forEach((child) => {
      if (child.position.y !== grounded) child.position.y = grounded;
    });

    const active = showPins && intensity > 0.02;
    root.current.visible = active;

    if (!active) {
      revealRef.current = 0;
      pinMats.easy.opacity = 0;
      pinMats.medium.opacity = 0;
      pinMats.hard.opacity = 0;
      baseMat.opacity = 0;
      return;
    }

    revealRef.current = Math.min(
      pins.length,
      revealRef.current + delta * (pins.length / 1.05),
    );
    const reveal = Math.floor(revealRef.current);
    const opacity = Math.min(0.96, 0.55 + intensity * 0.4);
    baseMat.opacity = Math.min(0.8, 0.35 + intensity * 0.4);
    pinMats.easy.opacity = opacity;
    pinMats.medium.opacity = opacity;
    pinMats.hard.opacity = opacity;

    for (let i = 0; i < pins.length; i++) {
      const pin = pins[i];
      const card = cardRefs.current[i];
      const group = root.current.children[i] as THREE.Group | undefined;
      if (!pin || !card || !group) continue;

      const shown = i < reveal;
      group.visible = shown;
      if (!shown) continue;

      _pinWorld.set(pin.x, grounded + 30, pin.z);
      const dist = camera.position.distanceTo(_pinWorld);
      const s = THREE.MathUtils.clamp(
        SCALE_BASE * (SCALE_REF_DIST / Math.max(120, dist)),
        SCALE_MIN,
        SCALE_MAX,
      );
      card.scale.set(s, s, 1);
      // Face the camera fully so the marker always reads flat on screen
      card.position.set(0, 30, 0);
      _lookTarget.copy(camera.position);
      card.lookAt(_lookTarget);

      const base = group.children[0] as THREE.Mesh | undefined;
      if (base) {
        const bs = THREE.MathUtils.clamp(s * 0.2, 5, 20);
        base.scale.set(bs, bs, 1);
      }
    }
  });

  return (
    <group ref={root}>
      {pins.map((pin, i) => (
        <group
          key={`${pin.difficulty}-${i}`}
          position={[pin.x, trsrePinConfig.minY + 20, pin.z]}
        >
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.5, 0]}
            geometry={baseGeo}
            material={baseMat}
            renderOrder={3}
            frustumCulled={false}
          />
          <mesh
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            geometry={planeGeo}
            material={pinMats[pin.difficulty]}
            renderOrder={4}
            frustumCulled={false}
          />
        </group>
      ))}
    </group>
  );
}

export function TRSREMarkers({ maxPins = 15 }: { maxPins?: number }) {
  const textures = usePinTextures();

  const pins = useMemo(() => {
    const dgs = AnchorRegistry.getPosition("ANCHOR_DGS");
    const bankside = AnchorRegistry.getPosition("ANCHOR_BANKSIDE");
    const origin = dgs.clone().lerp(bankside, 0.28);
    return FOV_PINS.slice(0, Math.min(maxPins, FOV_PINS.length)).map(
      (pin, i) => ({
        x: origin.x + pin.offset[0],
        z: origin.z + pin.offset[1],
        difficulty: pin.difficulty ?? PIN_ORDER[i % PIN_ORDER.length],
      }),
    );
  }, [maxPins]);

  return <HuntPins pins={pins} textures={textures} />;
}

/** Kept for SceneManager import compatibility — no busy route web on TRSRE */
export function TRSRERoutes() {
  return null;
}
