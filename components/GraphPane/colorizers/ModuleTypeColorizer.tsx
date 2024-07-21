import type { PackageJson } from '@npm/types';
import React from 'react';
import type Module from '../../../lib/Module.js';
import { LegendColor } from './LegendColor.js';

export const COLORIZE_MODULE_CJS = 'var(--bg-orange)';
export const COLORIZE_MODULE_ESM = 'var(--bg-blue)';

export default {
  title: 'Module Type',
  name: 'moduleType',

  legend() {
    return (
      <>
        <LegendColor color={COLORIZE_MODULE_CJS}>CommonJS (CJS)</LegendColor>
        <LegendColor color={COLORIZE_MODULE_ESM}>EcmaScript (ESM)</LegendColor>
      </>
    );
  },

  async colorForModule(module: Module) {
    const pkg = module.package as PackageJson;
    return pkg.type === 'module' ? COLORIZE_MODULE_ESM : COLORIZE_MODULE_CJS;
  },
};
