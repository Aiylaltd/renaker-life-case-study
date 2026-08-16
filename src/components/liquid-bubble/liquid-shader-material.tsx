import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uDistort;
  uniform vec2 uMouse;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vDisplacement;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec3 pos = position;

    float wave =
      sin(pos.x * 2.8 + uTime * 0.9 + uMouse.x * 2.0) *
      sin(pos.y * 3.2 + uTime * 0.7 + uMouse.y * 2.0) *
      sin(pos.z * 2.5 + uTime * 0.8);

    float pulse = sin(uTime * 0.5 + length(pos) * 1.5) * 0.15;
    vDisplacement = wave + pulse;
    pos += normal * (wave * 0.22 + pulse) * uDistort;

    vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vDisplacement;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.2);

    vec3 white = vec3(0.98, 0.97, 1.0);
    vec3 purple = vec3(0.55, 0.38, 0.95);
    vec3 pink = vec3(0.95, 0.45, 0.72);
    vec3 blue = vec3(0.38, 0.58, 0.98);

    float n1 = sin(vWorldPosition.x * 1.8 + uTime * 0.4 + uMouse.x) * 0.5 + 0.5;
    float n2 = sin(vWorldPosition.y * 2.2 + uTime * 0.35) * 0.5 + 0.5;
    float n3 = sin(vWorldPosition.z * 1.6 + uTime * 0.45 + uMouse.y) * 0.5 + 0.5;

    vec3 color = mix(blue, purple, n1);
    color = mix(color, pink, n2 * 0.7);
    color = mix(color, white, fresnel * 0.55 + n3 * 0.15);
    color += vDisplacement * 0.08;

    float alpha = 0.88 + fresnel * 0.1;
    gl_FragColor = vec4(color, alpha);
  }
`;

export const LiquidShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uDistort: 1,
    uMouse: new THREE.Vector2(0, 0),
  },
  vertexShader,
  fragmentShader,
);

extend({ LiquidShaderMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    liquidShaderMaterial: THREE.ShaderMaterialParameters & {
      uTime?: number;
      uDistort?: number;
      uMouse?: THREE.Vector2;
      transparent?: boolean;
    };
  }
}
