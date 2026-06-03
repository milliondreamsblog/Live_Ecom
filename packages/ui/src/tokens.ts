/**
 * LiveDrop design tokens — the single cross-platform source of truth.
 *
 * Web consumes these via the Tailwind v4 `@theme` in ./theme.css; the future
 * mobile app (NativeWind / Reanimated) consumes the raw values here. Keep the
 * two in sync — change a value once, here.
 */

/** Brand + semantic palette. */
export const colors = {
  brand: '#E1306C', // signature magenta
  brandAlt: '#7C3AED', // violet (gradient partner)
  live: '#EF4444', // the "● LIVE" red
  success: '#22C55E', // delivery / order success
  warn: '#F59E0B', // low-stock amber
  ink: '#0A0A0B', // near-black immersive surface
  surfaceDark: '#0A0A0B',
  surfaceLight: '#FAFAFB',
} as const;

/** 4-pt spacing scale (px). */
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

/** Corner radii (px). */
export const radii = {
  chip: 8,
  card: 16,
  sheet: 24,
  pill: 9999,
} as const;

/** Type scale (px). */
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 44,
} as const;

/** Motion: spring-ish easings + durations (ms). */
export const motion = {
  easing: {
    snappy: 'cubic-bezier(0.22, 1, 0.36, 1)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bouncy: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  duration: {
    fast: 150,
    base: 250,
    slow: 400,
  },
} as const;

/** Stacking order used across overlays. */
export const zIndex = {
  hud: 30,
  overlay: 40,
  modal: 60,
  toast: 100,
} as const;

export const tokens = { colors, space, radii, fontSize, motion, zIndex } as const;
export type Tokens = typeof tokens;
