"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { hexToRgb, mixRgb, rgbChannels, WHITE, type RGB } from "@/lib/color";
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
 * 3D scene eases towards it) and the accent, backdrop and panel colours to CSS
 * variables on <html>, so the page and the studio share one flat colour.
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
    const surface: RGB = [0, 0, 0];
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
      mixRgb(hexToRgb(from.accent), hexToRgb(to.accent), t, rig.accent);
      mixRgb(hexToRgb(from.bg), hexToRgb(to.bg), t, rig.bg);
      // Panels are the backdrop lifted one step towards white: flat, but distinct
      mixRgb(rig.bg, WHITE, 0.05, surface);

      // Only touch the DOM when a colour actually changes
      const accent = rgbChannels(rig.accent);
      const ground = rgbChannels(rig.bg);
      const panel = rgbChannels(surface);
      const css = `${accent}|${ground}|${panel}`;
      if (css !== lastCss) {
        lastCss = css;
        style.setProperty("--accent", accent);
        style.setProperty("--bg", ground);
        style.setProperty("--surface", panel);
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
