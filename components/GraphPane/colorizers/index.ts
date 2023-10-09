import Module from '../../../lib/Module.js';
import BusFactorColorizer from './BusFactorColorizer.js';
import ModuleTypeColorizer from './ModuleTypeColorizer.js';
import {
  NPMSMaintenanceColorizer,
  NPMSOverallColorizer,
  NPMSPopularityColorizer,
  NPMSQualityColorizer,
} from './NPMSColorizer.js';

interface Colorizer {
  title: string;
  name: string;
  legend(): React.JSX.Element;
}

export interface SimpleColorizer extends Colorizer {
  colorForModule: (module: Module) => Promise<string>;
}

export interface BulkColorizer extends Colorizer {
  colorsForModules: (modules: Module[]) => Promise<Map<Module, string>>;
}

const colorizers: (SimpleColorizer | BulkColorizer)[] = [
  ModuleTypeColorizer,
  BusFactorColorizer,
  NPMSOverallColorizer,
  NPMSQualityColorizer,
  NPMSPopularityColorizer,
  NPMSMaintenanceColorizer,
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
