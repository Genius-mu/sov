"use client";

import { useMemo, useRef } from "react";
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { NIGHT } from "@/lib/color";
import { rig } from "@/lib/store";
import { getGlowTexture } from "./glow";

const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFragment = /* glsl */ `
  uniform vec3 uZenith;
  uniform vec3 uHorizon;
  uniform vec3 uAura;
  uniform vec3 uGlow;
  varying vec3 vDir;
  void main() {
    vec3 d = normalize(vDir);
    vec3 col = mix(uHorizon, uZenith, smoothstep(0.0, 0.6, d.y));
    // Two broad pools of coloured light low on the walls, on opposite sides
    col += uAura * pow(max(dot(d, normalize(vec3(-0.75, 0.16, -0.65))), 0.0), 4.0) * 0.32;
    col += uGlow * pow(max(dot(d, normalize(vec3(0.8, 0.14, 0.6))), 0.0), 4.0) * 0.24;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

/**
 * The showroom: softbox light strips (which the paint reflects), a polished
 * floor and two light rails on the horizon. The sky, rim lights, floor and
 * rails take their colour from the current section's palette (see lib/scenes.ts).
 */
export function Studio() {
  const narrow = useThree((s) => s.size.width < 768);

  const sky = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uZenith: { value: new THREE.Color() },
          uHorizon: { value: new THREE.Color() },
          uAura: { value: new THREE.Color() },
          uGlow: { value: new THREE.Color() },
        },
        vertexShader: skyVertex,
        fragmentShader: skyFragment,
        side: THREE.BackSide,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );

  const pool = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: getGlowTexture(),
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );

  const c = useMemo(
    () => ({
      night: new THREE.Color().setRGB(...NIGHT, THREE.SRGBColorSpace),
      aura: new THREE.Color().setRGB(...rig.aura, THREE.SRGBColorSpace),
      glow: new THREE.Color().setRGB(...rig.glow, THREE.SRGBColorSpace),
      target: new THREE.Color(),
      tmp: new THREE.Color(),
    }),
    [],
  );

  const hemi = useRef<THREE.HemisphereLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);
  const kicker = useRef<THREE.DirectionalLight>(null);
  const floor = useRef<THREE.Mesh>(null);
  const railA = useRef<THREE.MeshBasicMaterial>(null);
  const railB = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state, delta) => {
    const k = 1 - Math.exp(-Math.min(delta, 0.05) * 3);
    c.aura.lerp(c.target.setRGB(...rig.aura, THREE.SRGBColorSpace), k);
    c.glow.lerp(c.target.setRGB(...rig.glow, THREE.SRGBColorSpace), k);

    // Sky: deep tinted zenith fading to a glowing horizon
    const u = sky.uniforms;
    u.uAura.value.copy(c.aura);
    u.uGlow.value.copy(c.glow);
    u.uZenith.value.copy(c.night).lerp(c.aura, 0.012);
    u.uHorizon.value.copy(c.night).lerp(c.aura, 0.1).lerp(c.glow, 0.025);

    // The far floor fades into the same colour as the horizon, so there is no seam
    const fog = state.scene.fog as THREE.Fog | null;
    fog?.color.copy(u.uHorizon.value);
    if (state.scene.background instanceof THREE.Color) state.scene.background.copy(u.uHorizon.value);

    if (hemi.current) hemi.current.groundColor.copy(c.night).lerp(c.aura, 0.5);
    rim.current?.color.copy(c.aura);
    kicker.current?.color.copy(c.glow);
    const floorMaterial = floor.current?.material as THREE.MeshStandardMaterial | undefined;
    floorMaterial?.color.copy(c.night).lerp(c.aura, 0.035);
    railA.current?.color.copy(c.aura);
    railB.current?.color.copy(c.glow);
    pool.color.copy(c.tmp.copy(c.aura).lerp(c.glow, 0.3));
  });

  return (
    <>
      <mesh material={sky} renderOrder={-1} frustumCulled={false}>
        <sphereGeometry args={[70, 48, 24]} />
      </mesh>

      <ambientLight intensity={0.22} />
      <hemisphereLight ref={hemi} args={["#f4f6ff", "#000000", 0.55]} />
      <directionalLight position={[4, 8, 6]} intensity={1.5} color="#ffffff" />
      {/* coloured rim and kicker lights from behind, opposite sides */}
      <directionalLight ref={rim} position={[-6, 3.5, -5]} intensity={2.4} />
      <directionalLight ref={kicker} position={[6, 2.5, -3]} intensity={1.6} />

      <Environment resolution={256} frames={1}>
        {/* overhead softboxes */}
        <Lightformer form="rect" intensity={2} rotation-x={Math.PI / 2} position={[0, 6, -9]} scale={[14, 1, 1]} />
        <Lightformer form="rect" intensity={2} rotation-x={Math.PI / 2} position={[0, 6, -4]} scale={[14, 1, 1]} />
        <Lightformer form="rect" intensity={2} rotation-x={Math.PI / 2} position={[0, 6, 1]} scale={[14, 1, 1]} />
        <Lightformer form="rect" intensity={2} rotation-x={Math.PI / 2} position={[0, 6, 6]} scale={[14, 1, 1]} />
        {/* long side strips: cool on the left, warm on the right */}
        <Lightformer form="rect" intensity={3} rotation-y={Math.PI / 2} position={[-14, 1.5, 0]} scale={[30, 1.4, 1]} color="#cfdcff" />
        <Lightformer form="rect" intensity={2} rotation-y={-Math.PI / 2} position={[14, 2, 0]} scale={[30, 1, 1]} color="#ffe6c4" />
        {/* key light */}
        <Lightformer form="ring" intensity={5} rotation-y={-Math.PI * 0.75} position={[9, 5, 9]} scale={3.5} />
      </Environment>

      <mesh ref={floor} rotation-x={-Math.PI / 2} position-y={-0.001}>
        <planeGeometry args={[80, 80]} />
        <MeshReflectorMaterial
          blur={[300, 80]}
          resolution={narrow ? 512 : 1024}
          mixBlur={1}
          mixStrength={18}
          roughness={1}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.3}
          color="#080b14"
          metalness={0.5}
          mirror={0}
        />
      </mesh>

      {/* a soft pool of the section's colour on the floor around the car */}
      <mesh material={pool} renderOrder={-1} rotation-x={-Math.PI / 2} position-y={0.003} scale={[14, 7.5, 1]}>
        <planeGeometry />
      </mesh>

      <ContactShadows position={[0, 0.004, 0]} scale={12} far={1.5} blur={2.2} opacity={0.75} resolution={512} color="#000000" />

      <mesh rotation-x={-Math.PI / 2} position={[0, 0.004, -7.5]}>
        <planeGeometry args={[18, 0.035]} />
        <meshBasicMaterial ref={railA} toneMapped={false} transparent opacity={0.75} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.004, -11]}>
        <planeGeometry args={[26, 0.035]} />
        <meshBasicMaterial ref={railB} toneMapped={false} transparent opacity={0.6} />
      </mesh>
    </>
  );
}
