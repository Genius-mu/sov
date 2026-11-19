"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { app, carConfig, rig } from "@/lib/store";
import { getGlowTexture } from "./glow";

/*
 * An original full-size luxury saloon, built from code so the site works before
 * a licensed model is added (see SITE.carModel). It follows the classic
 * coachbuilt proportions: long bonnet, tall upright grille, short front
 * overhang, slab sides with a high shoulder, a body-coloured glasshouse with
 * chrome-framed windows, a wide rear pillar and rear-hinged (coach) rear doors.
 * No badges or mascots.
 *
 * The side profiles are drawn as 2D shapes and extruded across the car's
 * width; the glasshouse then leans inwards as it rises (tumblehome).
 * Units are metres. Nose points along +x.
 */

const WHEEL_R = 0.41;
const ARCH_R = 0.53;
const FRONT_AXLE = 1.94;
const REAR_AXLE = -1.61;
const TRACK = 0.84;
/** Half-width of the flat body side, and of the glasshouse side at its base. */
const BODY_HALF = 1.0;
const GLASS_HALF = 0.86;
/** How far the extrusion bevels push each outline outwards. */
const BODY_BEVEL = 0.07;
const CABIN_BEVEL = 0.05;

type Pt = [number, number];
type Plan = (x: number, y: number, z: number) => number;

/**
 * Tumblehome: the glasshouse narrows linearly as it rises. Linear in y, so flat
 * side faces stay flat (no shading streaks) while still leaning in.
 */
const cabinPlan: Plan = (_x, y, z) => z * (1 - (0.15 * (y - 1.0)) / 0.65);

function applyPlan(geometry: THREE.BufferGeometry, plan?: Plan) {
  if (!plan) return geometry;
  const p = geometry.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, plan(p.getX(i), p.getY(i), p.getZ(i)));
  return geometry;
}

function extrude(shape: THREE.Shape, halfWidth: number, thickness: number, size: number, plan?: Plan) {
  const depth = halfWidth * 2 - thickness * 2;
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
  applyPlan(geometry, plan);
  // Smooth across curves, keep crisp edges where the surface really turns a corner
  return toCreasedNormals(geometry, 0.6);
}

function poly(points: Pt[]) {
  const s = new THREE.Shape();
  s.moveTo(...points[0]);
  for (const p of points.slice(1)) s.lineTo(...p);
  return s;
}

const rect = (x0: number, y0: number, x1: number, y1: number) =>
  poly([
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ]);

/** Grows a convex polygon outwards by d (used for the chrome window frames). */
function inflate(points: Pt[], d: number): Pt[] {
  const n = points.length;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % n];
    area += x1 * y2 - x2 * y1;
  }
  const s = area > 0 ? 1 : -1;
  const lines = points.map((p, i) => {
    const q = points[(i + 1) % n];
    const dx = q[0] - p[0];
    const dy = q[1] - p[1];
    const len = Math.hypot(dx, dy);
    return { x: p[0] + (s * dy * d) / len, y: p[1] - (s * dx * d) / len, dx, dy };
  });
  return points.map((_, i) => {
    const a = lines[(i - 1 + n) % n];
    const b = lines[i];
    const den = a.dx * b.dy - a.dy * b.dx;
    if (Math.abs(den) < 1e-9) return [b.x, b.y];
    const t = ((b.x - a.x) * b.dy - (b.y - a.y) * b.dx) / den;
    return [a.x + a.dx * t, a.y + a.dy * t];
  });
}

/** A thin panel or trim laid onto a side face (right-hand side; mirrored for the left). */
function sideTrim(shapes: THREE.Shape | THREE.Shape[], face: number, thickness: number, plan?: Plan) {
  const geometry = new THREE.ExtrudeGeometry(shapes, { depth: thickness, bevelEnabled: false, curveSegments: 24 });
  geometry.translate(0, 0, face - thickness * 0.4);
  applyPlan(geometry, plan);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * A thin curved panel that follows part of a profile (windscreen, rear screen),
 * sitting just outside the bevelled surface and spanning `halfWidth` either side.
 */
function screen(path: THREE.Path, from: number, to: number, halfWidth: number, plan: Plan) {
  const pts = path.getSpacedPoints(40).slice(from, to + 1);
  const offset = (d: number) =>
    pts.map((p, i) => {
      const a = pts[Math.max(0, i - 1)];
      const b = pts[Math.min(pts.length - 1, i + 1)];
      const tx = b.x - a.x;
      const ty = b.y - a.y;
      const len = Math.hypot(tx, ty);
      // Profiles run clockwise, so the right-hand normal points out of the car
      return [p.x + (ty / len) * d, p.y - (tx / len) * d] as Pt;
    });
  const outline = [...offset(CABIN_BEVEL + 0.002), ...offset(CABIN_BEVEL + 0.014).reverse()];
  const geometry = new THREE.ExtrudeGeometry(poly(outline), { depth: halfWidth * 2, bevelEnabled: false });
  geometry.translate(0, 0, -halfWidth);
  applyPlan(geometry, plan);
  return toCreasedNormals(geometry, 0.5);
}

function bodyProfile() {
  const s = new THREE.Shape();
  s.moveTo(-2.62, 0.3);
  s.lineTo(REAR_AXLE - ARCH_R, 0.3);
  s.lineTo(REAR_AXLE - ARCH_R, WHEEL_R);
  s.absarc(REAR_AXLE, WHEEL_R, ARCH_R, Math.PI, 0, true);
  s.lineTo(REAR_AXLE + ARCH_R, 0.3);
  s.lineTo(FRONT_AXLE - ARCH_R, 0.3);
  s.lineTo(FRONT_AXLE - ARCH_R, WHEEL_R);
  s.absarc(FRONT_AXLE, WHEEL_R, ARCH_R, Math.PI, 0, true);
  s.lineTo(FRONT_AXLE + ARCH_R, 0.3);
  s.lineTo(2.62, 0.3);
  // tall, nearly vertical nose
  s.quadraticCurveTo(2.79, 0.31, 2.81, 0.48);
  s.lineTo(2.83, 0.94);
  s.quadraticCurveTo(2.835, 1.02, 2.69, 1.03);
  // long, almost flat bonnet rising gently to the windscreen, then a level shoulder
  s.lineTo(0.85, 1.07);
  s.lineTo(-2.25, 1.09);
  // short boot and upright tail
  s.quadraticCurveTo(-2.79, 1.09, -2.82, 0.94);
  s.lineTo(-2.83, 0.5);
  s.quadraticCurveTo(-2.82, 0.31, -2.62, 0.3);
  return s;
}

const WINDSCREEN: [Pt, Pt, Pt] = [
  [0.82, 1.07],
  [0.4, 1.33],
  [0.1, 1.545],
];

function cabinProfile() {
  const s = new THREE.Shape();
  s.moveTo(0.9, 1.0);
  s.lineTo(...WINDSCREEN[0]);
  s.quadraticCurveTo(...WINDSCREEN[1], ...WINDSCREEN[2]);
  s.quadraticCurveTo(-0.04, 1.6, -0.32, 1.6);
  s.lineTo(-1.58, 1.59);
  s.quadraticCurveTo(-1.84, 1.585, -2.0, 1.33);
  s.lineTo(-2.2, 1.07);
  s.lineTo(-2.24, 1.0);
  s.lineTo(0.9, 1.0);
  return s;
}

/** Side windows: front door, rear door. The paint between them forms the pillars. */
const FRONT_WINDOW: Pt[] = [
  [0.6, 1.155],
  [0.08, 1.5],
  [0.02, 1.515],
  [-0.06, 1.515],
  [-0.06, 1.155],
];
const REAR_WINDOW: Pt[] = [
  [-0.16, 1.155],
  [-0.16, 1.515],
  [-1.36, 1.507],
  [-1.42, 1.49],
  [-1.28, 1.155],
];

function BothSides({ geometry, material }: { geometry: THREE.BufferGeometry; material: THREE.Material }) {
  return (
    <>
      <mesh geometry={geometry} material={material} />
      <mesh geometry={geometry} material={material} scale={[1, 1, -1]} />
    </>
  );
}

const GRILLE_VANES = 17;

export function ConceptCar() {
  const geometry = useMemo(() => {
    const windscreenPath = new THREE.Path();
    windscreenPath.moveTo(...WINDSCREEN[0]);
    windscreenPath.quadraticCurveTo(...WINDSCREEN[1], ...WINDSCREEN[2]);

    const rearPath = new THREE.Path();
    rearPath.moveTo(-1.58, 1.59);
    rearPath.quadraticCurveTo(-1.84, 1.585, -2.0, 1.33);
    rearPath.lineTo(-2.2, 1.07);

    return {
      body: extrude(bodyProfile(), BODY_HALF, 0.12, BODY_BEVEL),
      cabin: extrude(cabinProfile(), GLASS_HALF, 0.08, CABIN_BEVEL, cabinPlan),
      windscreen: screen(windscreenPath, 3, 37, 0.69, cabinPlan),
      rearScreen: screen(rearPath, 4, 31, 0.64, cabinPlan),
      windows: sideTrim([poly(FRONT_WINDOW), poly(REAR_WINDOW)], GLASS_HALF, 0.02, cabinPlan),
      windowFrames: sideTrim(
        [poly(inflate(FRONT_WINDOW, 0.018)), poly(inflate(REAR_WINDOW, 0.018))],
        GLASS_HALF,
        0.012,
        cabinPlan,
      ),
      coachline: sideTrim(rect(-2.3, 0.962, 2.32, 0.974), BODY_HALF, 0.008),
      // Shut lines: front door, centre pillar, rear (coach) door, sill
      shuts: sideTrim(
        [
          rect(1.297, 0.34, 1.303, 1.06),
          rect(-0.103, 0.34, -0.097, 1.06),
          rect(-1.033, 0.36, -1.027, 1.06),
          rect(-1.03, 0.357, 1.3, 0.363),
        ],
        BODY_HALF,
        0.006,
      ),
      // Handles meet at the centre pillar, because the rear doors open from the front
      handles: sideTrim([rect(0.0, 0.958, 0.15, 0.98), rect(-0.34, 0.958, -0.19, 0.98)], BODY_HALF, 0.022),
    };
  }, []);

  const materials = useMemo(() => {
    const glow = getGlowTexture();
    return {
      paint: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color().setRGB(...rig.paint, THREE.SRGBColorSpace),
        metalness: 0.32,
        roughness: 0.24,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
        envMapIntensity: 1.1,
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: "#05070b",
        metalness: 0.3,
        roughness: 0.04,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        envMapIntensity: 1.8,
      }),
      chrome: new THREE.MeshStandardMaterial({ color: "#e6e9ef", metalness: 1, roughness: 0.08 }),
      coachline: new THREE.MeshStandardMaterial({ color: carConfig.coachline, metalness: 0.6, roughness: 0.3 }),
      shut: new THREE.MeshStandardMaterial({ color: "#030405", metalness: 0, roughness: 0.8 }),
      grilleBack: new THREE.MeshStandardMaterial({ color: "#050608", metalness: 0.4, roughness: 0.5 }),
      lamp: new THREE.MeshStandardMaterial({ color: "#0b0d11", metalness: 0.7, roughness: 0.12 }),
      reflector: new THREE.MeshStandardMaterial({ color: "#c9d1dc", metalness: 1, roughness: 0.14 }),
      rim: new THREE.MeshStandardMaterial({ color: "#dfe3ea", metalness: 1, roughness: 0.12 }),
      disc: new THREE.MeshStandardMaterial({ color: "#3a3d42", metalness: 0.9, roughness: 0.38 }),
      caliper: new THREE.MeshStandardMaterial({ color: "#25272b", metalness: 0.5, roughness: 0.4 }),
      tyre: new THREE.MeshStandardMaterial({ color: "#0b0c0e", metalness: 0, roughness: 0.85 }),
      head: new THREE.MeshBasicMaterial({ color: "#000000", toneMapped: false }),
      tail: new THREE.MeshBasicMaterial({ color: "#000000", toneMapped: false }),
      headGlow: new THREE.SpriteMaterial({
        map: glow,
        color: "#dbe6ff",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
      tailGlow: new THREE.SpriteMaterial({
        map: glow,
        color: "#ff2a3c",
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

    // Scroll palette and configurator choices fade in rather than snapping
    materials.paint.color.lerp(targets.paint.setRGB(...rig.paint, THREE.SRGBColorSpace), k);
    materials.coachline.color.lerp(targets.coachline.set(carConfig.coachline), k);
    const dark = carConfig.wheels === "dark";
    materials.rim.color.lerp(targets.rim.set(dark ? "#2a2d33" : "#dfe3ea"), k);
    materials.rim.roughness += ((dark ? 0.4 : 0.12) - materials.rim.roughness) * k;

    // Lights come on after the preloader lifts
    const l = rig.lights;
    materials.head.color.setRGB(0.04 + 1.6 * l, 0.045 + 1.7 * l, 0.05 + 1.9 * l);
    materials.tail.color.setRGB(0.03 + 1.6 * l, 0.004 + 0.05 * l, 0.008 + 0.08 * l);
    materials.headGlow.opacity = 0.7 * l;
    materials.tailGlow.opacity = 0.6 * l;

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

  const nose = 2.83 + BODY_BEVEL;
  const tail = -2.83 - BODY_BEVEL;

  return (
    <group>
      <mesh geometry={geometry.body} material={materials.paint} />
      <mesh geometry={geometry.cabin} material={materials.paint} />
      <mesh geometry={geometry.windscreen} material={materials.glass} />
      <mesh geometry={geometry.rearScreen} material={materials.glass} />
      <BothSides geometry={geometry.windowFrames} material={materials.chrome} />
      <BothSides geometry={geometry.windows} material={materials.glass} />
      <BothSides geometry={geometry.coachline} material={materials.coachline} />
      <BothSides geometry={geometry.shuts} material={materials.shut} />
      <BothSides geometry={geometry.handles} material={materials.chrome} />

      {/* Upright grille: polished surround and vertical vanes, leaning very slightly forward */}
      <group position={[nose + 0.005, 0.715, 0]} rotation-z={-0.04}>
        <mesh material={materials.grilleBack} position-x={-0.012}>
          <boxGeometry args={[0.03, 0.46, 0.6]} />
        </mesh>
        <mesh material={materials.chrome} position={[0.014, 0.25, 0]}>
          <boxGeometry args={[0.075, 0.045, 0.69]} />
        </mesh>
        <mesh material={materials.chrome} position={[0.014, -0.245, 0]}>
          <boxGeometry args={[0.075, 0.04, 0.69]} />
        </mesh>
        {([1, -1] as const).map((side) => (
          <mesh key={side} material={materials.chrome} position={[0.014, 0, side * 0.322]}>
            <boxGeometry args={[0.075, 0.535, 0.045]} />
          </mesh>
        ))}
        {Array.from({ length: GRILLE_VANES }, (_, i) => (
          <mesh key={i} material={materials.chrome} position={[0.008, 0, -0.27 + (i * 0.54) / (GRILLE_VANES - 1)]}>
            <boxGeometry args={[0.035, 0.46, 0.012]} />
          </mesh>
        ))}
      </group>

      {/* lower air intake */}
      <mesh material={materials.grilleBack} position={[nose - 0.007, 0.38, 0]}>
        <boxGeometry args={[0.02, 0.06, 1.0]} />
      </mesh>
      {/* chrome strip across the boot lid */}
      <mesh material={materials.chrome} position={[tail - 0.005, 0.68, 0]}>
        <boxGeometry args={[0.015, 0.02, 0.85]} />
      </mesh>

      {([1, -1] as const).map((side) => (
        <group key={side}>
          {/* rectangular headlamp: dark housing, polished reflector, slim daytime strip along the top */}
          <mesh material={materials.lamp} position={[nose - 0.01, 0.83, side * 0.585]}>
            <boxGeometry args={[0.03, 0.13, 0.42]} />
          </mesh>
          <mesh material={materials.reflector} position={[nose + 0.006, 0.815, side * 0.585]}>
            <boxGeometry args={[0.02, 0.062, 0.37]} />
          </mesh>
          <mesh material={materials.head} position={[nose + 0.007, 0.88, side * 0.585]}>
            <boxGeometry args={[0.02, 0.016, 0.4]} />
          </mesh>
          {/* upright tail lamps */}
          <mesh material={materials.tail} position={[tail - 0.005, 0.8, side * 0.73]}>
            <boxGeometry args={[0.025, 0.24, 0.13]} />
          </mesh>
          <sprite material={materials.headGlow} position={[nose + 0.12, 0.86, side * 0.585]} scale={[1.2, 0.36, 1]} />
          <sprite material={materials.tailGlow} position={[tail - 0.1, 0.8, side * 0.73]} scale={[0.5, 0.7, 1]} />

          {/* door mirror */}
          <mesh material={materials.paint} position={[0.7, 1.16, side * 0.93]}>
            <boxGeometry args={[0.06, 0.04, 0.22]} />
          </mesh>
          <RoundedBox
            args={[0.22, 0.12, 0.08]}
            radius={0.03}
            smoothness={4}
            material={materials.paint}
            position={[0.68, 1.21, side * 1.05]}
          />
        </group>
      ))}

      {corners.map(({ x, side }, index) => (
        <group key={`${x}-${side}`} position={[x, WHEEL_R, side * TRACK]}>
          {/* brake caliper stays put while the wheel turns */}
          <mesh material={materials.caliper} position={[x > 0 ? -0.15 : 0.15, 0.07, side * 0.07]}>
            <boxGeometry args={[0.14, 0.1, 0.05]} />
          </mesh>
          <group
            ref={(el) => {
              wheels.current[index] = el;
            }}
          >
            <mesh material={materials.tyre} scale={[1, 1, 1.75]}>
              <torusGeometry args={[0.34, 0.07, 24, 72]} />
            </mesh>
            <mesh material={materials.disc} position-z={side * 0.05} rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.265, 0.265, 0.02, 48]} />
            </mesh>
            <mesh material={materials.rim} position-z={side * 0.115}>
              <torusGeometry args={[0.272, 0.013, 10, 72]} />
            </mesh>
            {Array.from({ length: 7 }, (_, i) => (
              <group key={i} rotation-z={(i / 7) * Math.PI * 2}>
                <mesh material={materials.rim} position={[0, 0.165, side * 0.118]}>
                  <boxGeometry args={[0.042, 0.215, 0.016]} />
                </mesh>
              </group>
            ))}
            <mesh material={materials.rim} position-z={side * 0.122} rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.068, 0.068, 0.022, 36]} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}
