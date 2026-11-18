/**
 * Camera shots, one per section. The camera glides between them as you scroll.
 *
 * c* = where the camera sits, l* = the point it looks at,
 * stars = how visible the Starlight sky is (0 to 1).
 *
 * The car is about 5.6 m long, centred on the origin, nose pointing along +x.
 * Shifting the look point sideways moves the car to the other side of the
 * screen, which is how the text and the car share the frame.
 */
export type Shot = {
  cx: number;
  cy: number;
  cz: number;
  lx: number;
  ly: number;
  lz: number;
  stars: number;
};

export const SCENES = {
  hero: { cx: 5.6, cy: 1.45, cz: 6.4, lx: -1.6, ly: 0.55, lz: 0.8, stars: 0 },
  intro: { cx: -0.4, cy: 1.0, cz: 9.2, lx: -2.0, ly: 0.75, lz: 0, stars: 0 },
  craft: { cx: 3.6, cy: 0.55, cz: 3.4, lx: 0.96, ly: 0.42, lz: 1.45, stars: 0 },
  collection: { cx: -6.6, cy: 3.0, cz: 5.6, lx: 0, ly: -0.45, lz: 0, stars: 0 },
  collectionEnd: { cx: 6.6, cy: 2.7, cz: 5.8, lx: 0, ly: -0.45, lz: 0, stars: 0 },
  performance: { cx: 6.4, cy: 0.45, cz: 3.2, lx: 0, ly: 0.65, lz: 0, stars: 0 },
  starlight: { cx: 0.8, cy: 1.8, cz: 7.8, lx: 0, ly: 7.5, lz: -7, stars: 1 },
  bespoke: { cx: -5.4, cy: 1.5, cz: 5.0, lx: -1.1, ly: 0.5, lz: -1.15, stars: 0 },
  process: { cx: 0, cy: 11, cz: 2.6, lx: 0, ly: 0, lz: 0, stars: 0 },
  visit: { cx: 2, cy: 2.6, cz: 11, lx: 0.6, ly: 0.4, lz: 0, stars: 0.45 },
} satisfies Record<string, Shot>;

export type SceneKey = keyof typeof SCENES;
