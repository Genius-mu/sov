"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { rig, sky } from "@/lib/store";

/** The Starlight Headliner in a Phantom carries up to 1,340 points of light. */
const COUNT = 1340;

const starVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aScale;
  attribute float aPhase;
  varying float vTwinkle;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    vTwinkle = 0.55 + 0.45 * sin(uTime * (0.5 + aScale * 0.35) + aPhase);
    gl_PointSize = aScale * uPixelRatio * 3.0 * (30.0 / -mv.z);
  }
`;

const starFragment = /* glsl */ `
  uniform float uOpacity;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = pow(1.0 - smoothstep(0.0, 0.5, d), 2.2) * vTwinkle * uOpacity;
    if (a < 0.004) discard;
    gl_FragColor = vec4(vec3(0.84, 0.89, 1.0) * a, a);
  }
`;

const streakVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const streakFragment = /* glsl */ `
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float head = pow(vUv.x, 3.0);
    float core = 1.0 - abs(vUv.y - 0.5) * 2.0;
    float a = head * core * uOpacity;
    gl_FragColor = vec4(vec3(0.86, 0.91, 1.0) * a, a);
  }
`;

const STREAK_TIME = 1.1;

/** A dome of twinkling stars plus on-demand shooting stars. */
export function Starfield() {
  const geometry = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const scales = new Float32Array(COUNT);
    const phases = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(1 - Math.random() * 0.95); // upper hemisphere, even spread
      const r = 26 + Math.random() * 6;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = 2 + r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      scales[i] = Math.pow(Math.random(), 3) * 2.4 + 0.5;
      phases[i] = Math.random() * Math.PI * 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    return g;
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uPixelRatio: { value: 1 } },
        vertexShader: starVertex,
        fragmentShader: starFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  const streakMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uOpacity: { value: 0 } },
        vertexShader: streakVertex,
        fragmentShader: streakFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  const streak = useRef<THREE.Mesh>(null);
  const shot = useRef({ t: -1, seen: 0, angle: 0, start: new THREE.Vector3(), dir: new THREE.Vector3() });
  const v = useMemo(() => ({ fwd: new THREE.Vector3(), right: new THREE.Vector3(), up: new THREE.Vector3() }), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const u = material.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uPixelRatio.value = state.gl.getPixelRatio();
    u.uOpacity.value += (rig.stars - u.uOpacity.value) * (1 - Math.exp(-dt * 3));

    const mesh = streak.current;
    const s = shot.current;
    if (!mesh) return;

    // A new shooting star was requested: launch it across the current view
    if (sky.shootingStars !== s.seen) {
      s.seen = sky.shootingStars;
      s.t = 0;
      const cam = state.camera;
      cam.getWorldDirection(v.fwd);
      v.right.crossVectors(v.fwd, cam.up).normalize();
      v.up.crossVectors(v.right, v.fwd).normalize();
      s.start
        .copy(cam.position)
        .addScaledVector(v.fwd, 22)
        .addScaledVector(v.right, -7 + Math.random() * 3)
        .addScaledVector(v.up, 3 + Math.random() * 3);
      s.angle = -(0.25 + Math.random() * 0.35);
      s.dir.copy(v.right).multiplyScalar(Math.cos(s.angle)).addScaledVector(v.up, Math.sin(s.angle)).normalize();
    }

    if (s.t < 0) return;
    s.t += dt;
    const p = s.t / STREAK_TIME;
    if (p >= 1) {
      s.t = -1;
      mesh.visible = false;
      return;
    }
    mesh.visible = true;
    mesh.position.copy(s.start).addScaledVector(s.dir, p * 16);
    mesh.quaternion.copy(state.camera.quaternion);
    mesh.rotateZ(s.angle);
    streakMaterial.uniforms.uOpacity.value = Math.sin(Math.PI * p) * Math.max(u.uOpacity.value, 0.4);
  });

  return (
    <>
      <points geometry={geometry} material={material} frustumCulled={false} />
      <mesh ref={streak} material={streakMaterial} visible={false} frustumCulled={false}>
        <planeGeometry args={[3.4, 0.04]} />
      </mesh>
    </>
  );
}
