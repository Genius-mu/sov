"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { SITE } from "@/lib/site";
import { app, rig } from "@/lib/store";

type Paintable = THREE.Material & { color: THREE.Color };

/**
 * Loads your .glb, turns it so its length runs along x, scales it to
 * SITE.carModel.length, sits it on the floor, and hooks its paint materials
 * up to the configurator.
 */
export function ModelCar({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  const { root, paints } = useMemo(() => {
    const root = scene.clone(true);
    const paints: Paintable[] = [];

    root.rotation.y = SITE.carModel.rotationY;
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    if (size.z > size.x) {
      root.rotation.y += Math.PI / 2;
      root.updateMatrixWorld(true);
      box.setFromObject(root);
      box.getSize(size);
    }

    root.scale.multiplyScalar(SITE.carModel.length / Math.max(size.x, 1e-6));
    root.updateMatrixWorld(true);
    box.setFromObject(root);
    const centre = box.getCenter(new THREE.Vector3());
    root.position.x -= centre.x;
    root.position.y -= box.min.y;
    root.position.z -= centre.z;

    root.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const swap = (material: THREE.Material) => {
        if (!SITE.carModel.paintMaterials.test(material.name) || !("color" in material)) return material;
        const clone = material.clone() as Paintable;
        paints.push(clone);
        return clone;
      };
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(swap) : swap(mesh.material);
    });

    return { root, paints };
  }, [scene]);

  const target = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    app.sceneReady = true;
  }, []);

  useFrame((_, delta) => {
    const k = 1 - Math.exp(-Math.min(delta, 0.05) * 4);
    target.setRGB(...rig.paint, THREE.SRGBColorSpace);
    for (const material of paints) material.color.lerp(target, k);
  });

  return <primitive object={root} />;
}
