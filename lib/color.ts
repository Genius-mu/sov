/** sRGB colour as 0..1 channels. */
export type RGB = [number, number, number];

const cache = new Map<string, RGB>();

/** "#rrggbb" → [r, g, b] in 0..1. Parsed once per string, so it is safe to call every frame. */
export function hexToRgb(hex: string): RGB {
  let rgb = cache.get(hex);
  if (!rgb) {
    const n = parseInt(hex.replace("#", ""), 16);
    rgb = [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    cache.set(hex, rgb);
  }
  return rgb;
}

/** Writes the blend of a and b into `out` and returns it. */
export function mixRgb(a: RGB, b: RGB, t: number, out: RGB): RGB {
  out[0] = a[0] + (b[0] - a[0]) * t;
  out[1] = a[1] + (b[1] - a[1]) * t;
  out[2] = a[2] + (b[2] - a[2]) * t;
  return out;
}

/** [r, g, b] → "r g b" (0..255), the format the CSS colour variables use. */
export function rgbChannels(c: RGB): string {
  return `${Math.round(c[0] * 255)} ${Math.round(c[1] * 255)} ${Math.round(c[2] * 255)}`;
}

/** The darkest tone of the site. Section backgrounds are this, tinted towards the accent. */
export const NIGHT: RGB = hexToRgb("#060810");
