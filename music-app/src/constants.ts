export const FALLBACK_COLORS = [
  "#8B4513", "#2F4F4F", "#8B0000", "#1a1a2e",
  "#003366", "#1a472a", "#4a0000", "#2d2d2d",
];

export const colorFor = (i: number) => FALLBACK_COLORS[i % FALLBACK_COLORS.length];
