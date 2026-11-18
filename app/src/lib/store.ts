/**
 * Tiny shared state between the page (DOM) and the 3D scene.
 * Plain mutable objects on purpose: the scene reads them every frame,
 * so there is no reason to trigger React renders.
 */
import { SCENES, type Shot } from "./scenes";
import { COACHLINES, PAINTS, type WheelFinish } from "./site";

/** Current camera shot (written by ScrollScenes), plus intro/lights/scroll velocity. */
export const rig: Shot & { intro: number; lights: number; velocity: number } = {
  ...SCENES.hero,
  intro: 1,
  lights: 0,
  velocity: 0,
};

/** What the configurator has selected. The car eases towards these values. */
export const carConfig: { paint: string; coachline: string; wheels: WheelFinish } = {
  paint: PAINTS[0].hex,
  coachline: COACHLINES[0].hex,
  wheels: "polished",
};

/** Pointer position in -1..1, used for a gentle camera parallax. */
export const pointer = { x: 0, y: 0 };

/** Increment to launch a shooting star in the Starlight sky. */
export const sky = { shootingStars: 0 };

export const app = {
  entered: false,
  sceneReady: false,
  assetsActive: false,
};

const enterListeners = new Set<() => void>();

/** Run `cb` once the preloader lifts (immediately if it already has). */
export function onEnter(cb: () => void): () => void {
  if (app.entered) {
    cb();
    return () => {};
  }
  enterListeners.add(cb);
  return () => {
    enterListeners.delete(cb);
  };
}

export function markEntered() {
  app.entered = true;
  enterListeners.forEach((cb) => cb());
  enterListeners.clear();
}
