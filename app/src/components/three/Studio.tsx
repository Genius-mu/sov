"use client";

import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

/**
 * A dark showroom: softbox light strips (which the paint reflects),
 * a polished floor and two thin light rails on the horizon.
 */
export function Studio() {
  const narrow = useThree((s) => s.size.width < 768);

  return (
    <>
      <ambientLight intensity={0.12} />
      <directionalLight position={[4, 8, 6]} intensity={1.2} color="#e9efff" />
      <directionalLight position={[-6, 3, -4]} intensity={0.6} color="#9fb6ff" />

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

      <mesh rotation-x={-Math.PI / 2} position-y={-0.001}>
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

      <ContactShadows position={[0, 0.002, 0]} scale={12} far={1.5} blur={2.2} opacity={0.75} resolution={512} color="#000000" />

      {[
        { z: -7.5, w: 18 },
        { z: -11, w: 26 },
      ].map((rail) => (
        <mesh key={rail.z} rotation-x={-Math.PI / 2} position={[0, 0.004, rail.z]}>
          <planeGeometry args={[rail.w, 0.035]} />
          <meshBasicMaterial color="#9fb8ff" toneMapped={false} transparent opacity={0.55} />
        </mesh>
      ))}
    </>
  );
}
