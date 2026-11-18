"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SCENES } from "@/lib/scenes";
import { pointer, rig } from "@/lib/store";

/**
 * Eases the camera towards the shot in `rig` every frame.
 * Adds a dolly-in during the intro and a small pointer parallax.
 * On portrait screens it pulls back and recentres so the car still fits.
 */
export function CameraRig() {
  const look = useRef(new THREE.Vector3(SCENES.hero.lx, SCENES.hero.ly, SCENES.hero.lz));
  const parallax = useRef({ x: 0, y: 0 });
  const v = useMemo(
    () => ({ pos: new THREE.Vector3(), look: new THREE.Vector3(), right: new THREE.Vector3(), up: new THREE.Vector3() }),
    [],
  );

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  useFrame((state, delta) => {
    const cam = state.camera as THREE.PerspectiveCamera;
    const dt = Math.min(delta, 1 / 20);
    const k = 1 - Math.exp(-dt * 2.6);

    const portrait = cam.aspect < 1;
    const offset = portrait ? 0.2 : 1;
    const fit = portrait ? THREE.MathUtils.clamp(1.15 / cam.aspect, 1, 2.2) : 1;

    v.look.set(rig.lx * offset, rig.ly, rig.lz * offset);
    v.pos
      .set(rig.cx, rig.cy, rig.cz)
      .sub(v.look)
      .multiplyScalar(fit * (1 + rig.intro * 0.85))
      .add(v.look);
    v.pos.y += rig.intro * 1.4;

    parallax.current.x += (pointer.x - parallax.current.x) * k;
    parallax.current.y += (pointer.y - parallax.current.y) * k;
    v.right.setFromMatrixColumn(cam.matrixWorld, 0);
    v.up.setFromMatrixColumn(cam.matrixWorld, 1);
    v.pos.addScaledVector(v.right, parallax.current.x * 0.35).addScaledVector(v.up, parallax.current.y * 0.18);

    cam.position.lerp(v.pos, k);
    look.current.lerp(v.look, k);
    cam.lookAt(look.current);
  });

  return null;
}
