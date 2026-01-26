import type { ReactElement } from 'react';
import type Module from '../../../lib/Module.ts';
import BusFactorColorizer from './BusFactorColorizer.tsx';
import ModuleTypeColorizer from './ModuleTypeColorizer.tsx';
import { NPMSOverallColorizer } from './NPMSColorizer.tsx';
import OutdatedColorizer from './OutdatedColorizer.tsx';

type Colorizer = {
  title: string;
  name: string;
  legend: () => ReactElement;
};

export type SimpleColorizer = {
  colorForModule: (module: Module) => Promise<string>;
} & Colorizer;

export type BulkColorizer = {
  colorsForModules: (modules: Module[]) => Promise<Map<Module, string>>;
} & Colorizer;

const colorizers: (SimpleColorizer | BulkColorizer)[] = [
  ModuleTypeColorizer,
  BusFactorColorizer,
  OutdatedColorizer,
  NPMSOverallColorizer,
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
