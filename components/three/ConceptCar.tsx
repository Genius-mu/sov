"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { app, carConfig, rig } from "@/lib/store";
import { getGlowTexture } from "./glow";

/*
 * An original, generic grand-tourer built from code, so the site works before
 * a licensed model is added. Side profile is drawn as a 2D shape and extruded
 * across the car's width; the dark glass cabin sits on top.
 * Units are metres. Nose points along +x.
 */

const ARCH_R = 0.54;
const WHEEL_R = 0.376;
const FRONT_AXLE = 1.75;
const REAR_AXLE = -1.62;
const TRACK = 0.83;

function extrude(shape: THREE.Shape, depth: number, thickness: number, size: number) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: thickness,
    bevelSize: size,
    bevelSegments: 12,
    curveSegments: 48,
    steps: 1,
  });
  geometry.translate(0, 0, -depth / 2);
  // Smooth across curves, keep crisp edges where the surface really turns a corner
  return toCreasedNormals(geometry, 0.6);
}

function bodyProfile() {
  const s = new THREE.Shape();
  s.moveTo(-2.62, 0.3);
  s.lineTo(REAR_AXLE - ARCH_R, 0.3);
  s.absarc(REAR_AXLE, 0.3, ARCH_R, Math.PI, 0, true);
  s.lineTo(FRONT_AXLE - ARCH_R, 0.3);
  s.absarc(FRONT_AXLE, 0.3, ARCH_R, Math.PI, 0, true);
  s.lineTo(2.6, 0.3);
  s.quadraticCurveTo(2.8, 0.32, 2.8, 0.58);
  s.lineTo(2.78, 0.86);
  s.quadraticCurveTo(2.76, 1.0, 2.5, 1.02);
  s.lineTo(-2.3, 1.06);
  s.quadraticCurveTo(-2.8, 1.04, -2.82, 0.82);
  s.lineTo(-2.8, 0.48);
  s.quadraticCurveTo(-2.78, 0.3, -2.62, 0.3);
  return s;
}

function cabinProfile() {
  const s = new THREE.Shape();
  s.moveTo(1.1, 0.98);
  s.quadraticCurveTo(0.62, 1.08, 0.18, 1.44);
  s.quadraticCurveTo(-0.06, 1.57, -0.46, 1.58);
  s.lineTo(-1.42, 1.56);
  s.quadraticCurveTo(-1.98, 1.52, -2.22, 1.1);
  s.lineTo(-2.26, 0.98);
  s.lineTo(1.1, 0.98);
  return s;
}

export function ConceptCar() {
  const geometry = useMemo(
    () => ({
      body: extrude(bodyProfile(), 1.8, 0.1, 0.06),
      cabin: extrude(cabinProfile(), 1.42, 0.1, 0.05),
    }),
    [],
  );

  const materials = useMemo(() => {
    const glow = getGlowTexture();
    return {
      paint: new THREE.MeshPhysicalMaterial({
        color: carConfig.paint,
        metalness: 0.5,
        roughness: 0.32,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
        envMapIntensity: 1.3,
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: "#04060b",
        metalness: 0.3,
        roughness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        envMapIntensity: 1.8,
      }),
      chrome: new THREE.MeshStandardMaterial({ color: "#e6e9ef", metalness: 1, roughness: 0.1 }),
      coachline: new THREE.MeshStandardMaterial({ color: carConfig.coachline, metalness: 0.6, roughness: 0.3 }),
      rim: new THREE.MeshStandardMaterial({ color: "#dfe3ea", metalness: 1, roughness: 0.14 }),
      barrel: new THREE.MeshStandardMaterial({ color: "#15171b", metalness: 0.8, roughness: 0.45 }),
      tyre: new THREE.MeshStandardMaterial({ color: "#0b0c0e", metalness: 0, roughness: 0.85 }),
      head: new THREE.MeshBasicMaterial({ color: "#000000", toneMapped: false }),
      tail: new THREE.MeshBasicMaterial({ color: "#000000", toneMapped: false }),
      headGlow: new THREE.SpriteMaterial({
        map: glow,
        color: "#cfe0ff",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
      tailGlow: new THREE.SpriteMaterial({
        map: glow,
        color: "#ff3347",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    };
  }, []);

  const targets = useMemo(
    () => ({ paint: new THREE.Color(), coachline: new THREE.Color(), rim: new THREE.Color() }),
    [],
  );
  const wheels = useRef<(THREE.Group | null)[]>([]);
  const spin = useRef(0);

  useEffect(() => {
    app.sceneReady = true;
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const k = 1 - Math.exp(-dt * 4);

    // Configurator choices fade in rather than snapping
    materials.paint.color.lerp(targets.paint.set(carConfig.paint), k);
    materials.coachline.color.lerp(targets.coachline.set(carConfig.coachline), k);
    const dark = carConfig.wheels === "dark";
    materials.rim.color.lerp(targets.rim.set(dark ? "#2a2d33" : "#dfe3ea"), k);
    materials.rim.roughness += ((dark ? 0.4 : 0.14) - materials.rim.roughness) * k;

    // Lights come on after the preloader lifts
    const l = rig.lights;
    materials.head.color.setRGB(0.04 + 1.6 * l, 0.045 + 1.7 * l, 0.05 + 1.9 * l);
    materials.tail.color.setRGB(0.03 + 1.6 * l, 0.004 + 0.05 * l, 0.008 + 0.08 * l);
    materials.headGlow.opacity = 0.9 * l;
    materials.tailGlow.opacity = 0.7 * l;

    // Wheels turn with scroll speed
    spin.current -= rig.velocity * dt * 0.25;
    rig.velocity *= Math.exp(-dt * 5);
    for (const wheel of wheels.current) if (wheel) wheel.rotation.z = spin.current;
  });

  const corners = [
    { x: FRONT_AXLE, side: 1 },
    { x: FRONT_AXLE, side: -1 },
    { x: REAR_AXLE, side: 1 },
    { x: REAR_AXLE, side: -1 },
  ] as const;

  return (
    <group>
      <mesh geometry={geometry.body} material={materials.paint} />
      <mesh geometry={geometry.cabin} material={materials.glass} />

      {([1, -1] as const).map((side) => (
        <group key={side}>
          {/* chrome beltline */}
          <mesh material={materials.chrome} position={[-0.6, 1.0, side * 1.004]}>
            <boxGeometry args={[3.3, 0.02, 0.01]} />
          </mesh>
          {/* hand-painted coachline */}
          <mesh material={materials.coachline} position={[0, 0.9, side * 1.003]}>
            <boxGeometry args={[4.9, 0.016, 0.008]} />
          </mesh>
          {/* light strips */}
          <mesh material={materials.head} position={[2.868, 0.78, side * 0.58]}>
            <boxGeometry args={[0.02, 0.05, 0.5]} />
          </mesh>
          <mesh material={materials.tail} position={[-2.874, 0.72, side * 0.58]}>
            <boxGeometry args={[0.02, 0.045, 0.52]} />
          </mesh>
          <sprite material={materials.headGlow} position={[3.0, 0.78, side * 0.58]} scale={[1.6, 0.5, 1]} />
          <sprite material={materials.tailGlow} position={[-3.0, 0.72, side * 0.58]} scale={[1.1, 0.35, 1]} />
        </group>
      ))}

      {corners.map(({ x, side }, index) => (
        <group key={`${x}-${side}`} position={[x, WHEEL_R, side * TRACK]}>
          <group
            ref={(el) => {
              wheels.current[index] = el;
            }}
          >
            <mesh material={materials.tyre} scale={[1, 1, 1.55]}>
              <torusGeometry args={[0.29, 0.086, 20, 64]} />
            </mesh>
            <mesh material={materials.barrel} position-z={side * 0.11} rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.235, 0.235, 0.02, 48]} />
            </mesh>
            <mesh material={materials.rim} position-z={side * 0.12}>
              <torusGeometry args={[0.232, 0.012, 8, 64]} />
            </mesh>
            {Array.from({ length: 7 }, (_, i) => (
              <group key={i} rotation-z={(i / 7) * Math.PI * 2}>
                <mesh material={materials.rim} position={[0, 0.12, side * 0.124]}>
                  <boxGeometry args={[0.034, 0.21, 0.014]} />
                </mesh>
              </group>
            ))}
            <mesh material={materials.rim} position-z={side * 0.126} rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.05, 0.05, 0.02, 32]} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}
