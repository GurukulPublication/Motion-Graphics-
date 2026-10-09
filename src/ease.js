// Easing helpers. All take t in [0, 1] and return [0, 1] (back/elastic may overshoot).
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
// Map time t into a local 0..1 progress over [start, end].
export const range = (t, start, end) => clamp((t - start) / (end - start));

export const linear = (t) => t;
export const inOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
export const outCubic = (t) => 1 - Math.pow(1 - t, 3);
export const inOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const outExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const inExpo = (t) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10));
export const outBack = (t) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
export const outElastic = (t) => {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
};
