/**
 * Camera shots and colour palettes, one per section. Both glide between
 * sections as you scroll.
 *
 * c* = where the camera sits, l* = the point it looks at,
 * stars = how visible the Starlight sky is (0 to 1).
 *
 * paint = the car's colour in that section (null = whatever the configurator
 * has selected), aura / glow = the two accent colours. They light the car and
 * the sky behind it, and tint the page (buttons, headings, cards, the nav).
 *
 * The car is about 5.6 m long, centred on the origin, nose pointing along +x.
 * Shifting the look point sideways moves the car to the other side of the
 * screen, which is how the text and the car share the frame.
 */
export type CameraShot = {
  cx: number;
  cy: number;
  cz: number;
  lx: number;
  ly: number;
  lz: number;
  stars: number;
};

export type Palette = {
  paint: string | null;
  aura: string;
  glow: string;
};

export type Shot = CameraShot & Palette;

export const SCENES = {
  hero: { cx: 5.6, cy: 1.45, cz: 6.4, lx: -1.6, ly: 0.55, lz: 0.8, stars: 0, paint: "#f3efe8", aura: "#ff6fae", glow: "#ffb36b" },
  intro: { cx: -0.4, cy: 1.0, cz: 9.2, lx: -2.0, ly: 0.75, lz: 0, stars: 0, paint: "#f1dcae", aura: "#ffa53d", glow: "#ff6f91" },
  craft: { cx: 3.6, cy: 0.55, cz: 3.4, lx: 0.96, ly: 0.42, lz: 1.45, stars: 0, paint: "#b8ecd9", aura: "#22d3a6", glow: "#7dd3fc" },
  collection: { cx: -6.6, cy: 3.0, cz: 5.6, lx: 0, ly: -0.45, lz: 0, stars: 0, paint: "#bcd8ff", aura: "#38bdf8", glow: "#a78bfa" },
  collectionEnd: { cx: 6.6, cy: 2.7, cz: 5.8, lx: 0, ly: -0.45, lz: 0, stars: 0, paint: "#d9c7ff", aura: "#a78bfa", glow: "#f472b6" },
  performance: { cx: 6.4, cy: 0.45, cz: 3.2, lx: 0, ly: 0.65, lz: 0, stars: 0, paint: "#ffbfac", aura: "#ff5a5f", glow: "#ffb020" },
  starlight: { cx: 0.8, cy: 1.8, cz: 7.8, lx: 0, ly: 7.5, lz: -7, stars: 1, paint: "#d6e1ff", aura: "#7c83ff", glow: "#5eead4" },
  bespoke: { cx: -5.4, cy: 1.5, cz: 5.0, lx: -1.1, ly: 0.5, lz: -1.15, stars: 0, paint: null, aura: "#f5c46b", glow: "#ff8fab" },
  process: { cx: 0, cy: 11, cz: 2.6, lx: 0, ly: 0, lz: 0, stars: 0, paint: null, aura: "#2dd4bf", glow: "#60a5fa" },
  visit: { cx: 2, cy: 2.6, cz: 11, lx: 0.6, ly: 0.4, lz: 0, stars: 0.45, paint: null, aura: "#ff8a5b", glow: "#f472b6" },
} satisfies Record<string, Shot>;

export type SceneKey = keyof typeof SCENES;
