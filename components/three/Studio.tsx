"use client";

import { useMemo, useRef } from "react";
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { rig } from "@/lib/store";

/**
 * A seamless photographic studio: one flat backdrop colour all round, a
 * polished floor that fades into it, and softbox panels (which the paint and
 * chrome reflect). The backdrop takes the current section's colour, so the
 * page and the studio always match (see lib/scenes.ts).
 *
 * Three.js applies fog after tone mapping, in display colour space, so the far
 * floor ends up exactly the backdrop colour and there is no horizon line.
 */
export function Studio() {
  const narrow = useThree((s) => s.size.width < 768);

  // Unlit and not tone mapped, so it renders as exactly the CSS colour
  const backdrop = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      }),
    [],
  );

  const c = useMemo(
    () => ({
      bg: new THREE.Color().setRGB(...rig.bg, THREE.SRGBColorSpace),
      accent: new THREE.Color().setRGB(...rig.accent, THREE.SRGBColorSpace),
      target: new THREE.Color(),
    }),
    [],
  );

  const hemi = useRef<THREE.HemisphereLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);
  const floor = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    // The backdrop follows scroll directly so it always matches the page behind the text
    c.bg.setRGB(...rig.bg, THREE.SRGBColorSpace);
    c.accent.lerp(c.target.setRGB(...rig.accent, THREE.SRGBColorSpace), 1 - Math.exp(-Math.min(delta, 0.05) * 3));

    backdrop.color.copy(c.bg);
    const fog = state.scene.fog as THREE.Fog | null;
    fog?.color.copy(c.bg);
    if (state.scene.background instanceof THREE.Color) state.scene.background.copy(c.bg);

    if (hemi.current) hemi.current.groundColor.copy(c.bg);
    // Mostly white, with a hint of the accent, as a gelled studio lamp would be
    rim.current?.color.setRGB(1, 1, 1).lerp(c.accent, 0.35);
    const floorMaterial = floor.current?.material as THREE.MeshStandardMaterial | undefined;
    floorMaterial?.color.copy(c.bg);
  });

  return (
    <>
      <mesh material={backdrop} renderOrder={-1} frustumCulled={false}>
        <sphereGeometry args={[70, 48, 24]} />
      </mesh>

      <ambientLight intensity={0.22} />
      <hemisphereLight ref={hemi} args={["#f4f6ff", "#000000", 0.55]} />
      <directionalLight position={[4, 8, 6]} intensity={1.8} color="#ffffff" />
      {/* rim and kicker lights from behind, opposite sides */}
      <directionalLight ref={rim} position={[-6, 3.5, -5]} intensity={1.4} />
      <directionalLight position={[6, 2.5, -3]} intensity={0.8} color="#ffffff" />

      <Environment resolution={256} frames={1}>
        {/* overhead softboxes */}
        <Lightformer form="rect" intensity={2} rotation-x={Math.PI / 2} position={[0, 6, -9]} scale={[14, 1, 1]} />
        <Lightformer form="rect" intensity={2} rotation-x={Math.PI / 2} position={[0, 6, -4]} scale={[14, 1, 1]} />
        <Lightformer form="rect" intensity={2} rotation-x={Math.PI / 2} position={[0, 6, 1]} scale={[14, 1, 1]} />
        <Lightformer form="rect" intensity={2} rotation-x={Math.PI / 2} position={[0, 6, 6]} scale={[14, 1, 1]} />
        {/* long side strips: cool on one side, warm on the other */}
        <Lightformer form="rect" intensity={3} rotation-y={Math.PI / 2} position={[-14, 1.5, 0]} scale={[30, 1.4, 1]} color="#cfdcff" />
        <Lightformer form="rect" intensity={2} rotation-y={-Math.PI / 2} position={[14, 2, 0]} scale={[30, 1, 1]} color="#ffe6c4" />
        {/* key light */}
        <Lightformer form="ring" intensity={5} rotation-y={-Math.PI * 0.75} position={[9, 5, 9]} scale={3.5} />
        {/* large soft panels on all four walls, so chrome and paint always have something to reflect */}
        <Lightformer form="rect" intensity={1.1} rotation-y={-Math.PI / 2} position={[12, 2.5, 0]} scale={[14, 4, 1]} />
        <Lightformer form="rect" intensity={0.7} rotation-y={Math.PI / 2} position={[-12, 2.5, 0]} scale={[14, 4, 1]} />
        <Lightformer form="rect" intensity={0.6} rotation-y={Math.PI} position={[0, 2.5, 12]} scale={[20, 4, 1]} />
        <Lightformer form="rect" intensity={0.6} position={[0, 2.5, -12]} scale={[20, 4, 1]} />
      </Environment>

      <mesh ref={floor} rotation-x={-Math.PI / 2} position-y={-0.001}>
        <planeGeometry args={[80, 80]} />
        <MeshReflectorMaterial
          blur={[300, 80]}
          resolution={narrow ? 512 : 1024}
          mixBlur={1}
          mixStrength={12}
          roughness={1}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.3}
          color="#0e1626"
          metalness={0.5}
          mirror={0}
        />
      </mesh>

      <ContactShadows position={[0, 0.004, 0]} scale={12} far={1.5} blur={2.2} opacity={0.7} resolution={512} color="#000000" />
    </>
  );
}
