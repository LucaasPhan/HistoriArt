/**
 * Color conversion utilities
 */

export function hexToRGB(hex: string) {
  let c = hex.trim();
  if (c[0] === "#") c = c.slice(1);
  if (c.length === 3)
    c = c
      .split("")
      .map((x) => x + x)
      .join("");
  const n = parseInt(c, 16) || 0xffffff;
  return {
    r: ((n >> 16) & 255) / 255,
    g: ((n >> 8) & 255) / 255,
    b: (n & 255) / 255,
  };
}
