/**
 * Camera shots and colour palettes, one per section. Both glide between
 * sections as you scroll.
 *
 * c* = where the camera sits, l* = the point it looks at,
 * stars = how visible the Starlight sky is (0 to 1).
 *
 * bg = the flat backdrop colour of the studio (and the page) in that section,
 * accent = the single accent colour (buttons, labels, rules, a light tint on
 * the car), paint = the car's colour (null = whatever the configurator has
 * selected). Backdrops are deep and flat; accents are light, so dark text on
 * an accent button and accent text on a backdrop both read clearly.
 *
 * The car is about 5.8 m long, centred on the origin, nose pointing along +x.
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
  bg: string;
  accent: string;
  paint: string | null;
};

export type Shot = CameraShot & Palette;

export const SCENES = {
  // Midnight sapphire, champagne
  hero: { cx: 5.6, cy: 1.45, cz: 6.4, lx: -1.6, ly: 0.55, lz: 0.8, stars: 0, bg: "#0e1626", accent: "#e2c9a0", paint: "#f3efe8" },
  // Bordeaux, rose clay. Car sits right of the paragraph
  intro: { cx: -0.4, cy: 1.1, cz: 10.4, lx: -3.4, ly: 0.8, lz: 0, stars: 0, bg: "#2a1418", accent: "#ecb8a8", paint: "#f1dcae" },
  // Racing green, sage. Close on the coachline, pushed right of the text column
  craft: { cx: 4.4, cy: 0.6, cz: 4.2, lx: 0.04, ly: 0.45, lz: 2.66, stars: 0, bg: "#11241c", accent: "#b9d6b0", paint: "#dfe9df" },
  // Petrol, ice → aubergine, lilac. Car high and right, above the cards and clear of the heading
  collection: { cx: -6.6, cy: 3.0, cz: 5.6, lx: -1.3, ly: -0.9, lz: -1.5, stars: 0, bg: "#0d2328", accent: "#a9cfe3", paint: "#c9dff2" },
  collectionEnd: { cx: 6.6, cy: 2.7, cz: 5.8, lx: -1.3, ly: -0.9, lz: 1.5, stars: 0, bg: "#1d1530", accent: "#c6b6ec", paint: "#dccdf7" },
  // Graphite, copper
  performance: { cx: 6.4, cy: 0.45, cz: 3.2, lx: 0, ly: 0.65, lz: 0, stars: 0, bg: "#18181b", accent: "#e9a27e", paint: "#f4c2b0" },
  // Indigo night, starlight blue
  starlight: { cx: 0.8, cy: 1.8, cz: 7.8, lx: 0, ly: 7.5, lz: -7, stars: 1, bg: "#090b1a", accent: "#b8c2ff", paint: "#d8e0f5" },
  // Espresso, gold
  bespoke: { cx: -5.4, cy: 1.5, cz: 5.0, lx: -1.1, ly: 0.5, lz: -1.15, stars: 0, bg: "#231a12", accent: "#e6c27a", paint: null },
  // Slate, mint
  process: { cx: 0, cy: 11, cz: 2.6, lx: 0, ly: 0, lz: 0, stars: 0, bg: "#141c22", accent: "#9fd3c7", paint: null },
  // Plum, rose. Looking up past the car, so it sits low beneath the text
  visit: { cx: 2, cy: 2.0, cz: 13, lx: 0.3, ly: 3.4, lz: 0, stars: 0.45, bg: "#22142a", accent: "#e9b7c8", paint: null },
} satisfies Record<string, Shot>;

export type SceneKey = keyof typeof SCENES;
