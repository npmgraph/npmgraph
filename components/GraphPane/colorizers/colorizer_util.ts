import { percent } from '../../../lib/dom.js';

export const COLORIZE_OVERALL = 'overall';
export const COLORIZE_QUALITY = 'quality';
export const COLORIZE_POPULARITY = 'popularity';
export const COLORIZE_MAINTENANCE = 'maintenance';

export function scoreColor(score: number) {
  return `color-mix(in oklch increasing hue, var(--bg-red), var(--bg-green) ${percent(score)})`;
}
