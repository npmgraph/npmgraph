import BusFactorColorizer from './BusFactorColorizer.tsx';
import ModuleTypeColorizer from './ModuleTypeColorizer.tsx';
import OutdatedColorizer from './OutdatedColorizer.tsx';
import type { BulkColorizer, Colorizer, SimpleColorizer } from './types.ts';

const colorizers: Array<SimpleColorizer | BulkColorizer> = [
  ModuleTypeColorizer,
  BusFactorColorizer,
  OutdatedColorizer,
];

export function isSimpleColorizer(
  colorizer: Colorizer,
): colorizer is SimpleColorizer {
  return 'colorForModule' in colorizer;
}

export function getColorizer(name: string) {
  return colorizers.find(colorizer => colorizer.name === name);
}

export default colorizers;
