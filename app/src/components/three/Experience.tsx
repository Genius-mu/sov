"use client";

import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import * as THREE from "three";
import { SCENES } from "@/lib/scenes";
import { app } from "@/lib/store";
import { CameraRig } from "./CameraRig";
import { CarSwitch } from "./CarSwitch";
import { Starfield } from "./Starfield";
import { Studio } from "./Studio";

/** Tells the preloader whether any 3D assets are still downloading. */
function LoadReporter() {
  const { active } = useProgress();
  useEffect(() => {
    app.assetsActive = active;
  }, [active]);
  return null;
}

export default function Experience() {
  const h = SCENES.hero;
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <Canvas
        dpr={[1, 1.75]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1,
        }}
        camera={{ position: [h.cx * 1.9, h.cy + 1.4, h.cz * 1.9], fov: 32, near: 0.1, far: 200 }}
      >
        <color attach="background" args={["#060810"]} />
        <fog attach="fog" args={["#060810", 16, 38]} />
        <LoadReporter />
        <Suspense fallback={null}>
          <Studio />
          <CarSwitch />
          <Starfield />
        </Suspense>
        <CameraRig />
      </Canvas>
    </div>
  );
}
