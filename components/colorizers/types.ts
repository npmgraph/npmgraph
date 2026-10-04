import type { ReactElement } from 'react';
import type Module from '../../lib/Module.ts';

export type Colorizer = {
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
