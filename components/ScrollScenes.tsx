"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { hexToRgb, mixRgb, NIGHT, rgbChannels, type RGB } from "@/lib/color";
import { SCENES, type CameraShot, type SceneKey, type Shot } from "@/lib/scenes";
import { carConfig, rig } from "@/lib/store";

const KEYS: (keyof CameraShot)[] = ["cx", "cy", "cz", "lx", "ly", "lz", "stars"];
const smooth = (t: number) => t * t * (3 - 2 * t);

type Segment = { trigger: () => ScrollTrigger | undefined; from: Shot; to: Shot };

/**
 * Turns scroll position into a camera shot and a colour palette.
 * Each [data-scene] section adds a segment that blends from the previous shot to
 * its own while the section scrolls into view. A section with data-scene-pin
 * (the id of its pin ScrollTrigger) and data-scene-exit adds a second segment
 * that runs while it is pinned. The result is written to `rig` every frame (the
 * 3D scene eases towards it) and the accent colours to CSS variables on <html>.
 */
export function ScrollScenes() {
  useGSAP(() => {
    const segments: Segment[] = [];
    let previous: Shot = SCENES.hero;

    gsap.utils.toArray<HTMLElement>("[data-scene]").forEach((el, index) => {
      const shot = SCENES[el.dataset.scene as SceneKey];
      if (!shot) return;

      if (index > 0) {
        const st = ScrollTrigger.create({ trigger: el, start: "top bottom", end: "top top" });
        segments.push({ trigger: () => st, from: previous, to: shot });
      }
      previous = shot;

      const pinId = el.dataset.scenePin;
      const exit = SCENES[el.dataset.sceneExit as SceneKey];
      if (pinId && exit && ScrollTrigger.getById(pinId)) {
        segments.push({ trigger: () => ScrollTrigger.getById(pinId), from: shot, to: exit });
        previous = exit;
      }
    });

    const style = document.documentElement.style;
    const bg: RGB = [0, 0, 0];
    let lastCss = "";

    // A null paint means "the car as configured", so the configurator owns those sections
    const paintOf = (shot: Shot) => hexToRgb(shot.paint ?? carConfig.paint);

    const update = () => {
      const y = window.scrollY;
      let from: Shot = SCENES.hero;
      let to: Shot = SCENES.hero;
      let progress = 1;

      for (const segment of segments) {
        const st = segment.trigger();
        if (!st) continue;
        if (y < st.start) break;
        from = segment.from;
        to = segment.to;
        const span = st.end - st.start;
        progress = span > 0 ? Math.min(1, (y - st.start) / span) : 1;
      }

      const t = smooth(progress);
      for (const key of KEYS) rig[key] = from[key] + (to[key] - from[key]) * t;

      mixRgb(paintOf(from), paintOf(to), t, rig.paint);
      mixRgb(hexToRgb(from.aura), hexToRgb(to.aura), t, rig.aura);
      mixRgb(hexToRgb(from.glow), hexToRgb(to.glow), t, rig.glow);
      mixRgb(NIGHT, rig.aura, 0.1, bg);

      // Only touch the DOM when a colour actually changes
      const accent = rgbChannels(rig.aura);
      const accent2 = rgbChannels(rig.glow);
      const ground = rgbChannels(bg);
      const css = `${accent}|${accent2}|${ground}`;
      if (css !== lastCss) {
        lastCss = css;
        style.setProperty("--accent", accent);
        style.setProperty("--accent-2", accent2);
        style.setProperty("--bg", ground);
      }
    };

    gsap.ticker.add(update);
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => gsap.ticker.remove(update);
  });

  return null;
}
