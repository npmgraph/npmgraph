import type { ReactElement } from 'react';
import type { ColorName } from '../../lib/constants.ts';
import type Module from '../../lib/Module.ts';

export type Colorizer = {
  title: string;
  name: string;
  legend: () => ReactElement;
};

export type SimpleColorizer = {
  colorForModule: (module: Module) => Promise<ColorName | undefined>;
} & Colorizer;

export type BulkColorizer = {
  colorsForModules: (modules: Module[]) => Promise<Map<Module, ColorName>>;
} & Colorizer;
