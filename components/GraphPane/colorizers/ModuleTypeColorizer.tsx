import React from 'react';
import Module from '../../../lib/Module.js';
import fetchJSON from '../../../lib/fetchJSON.js';
import { LegendColor } from './LegendColor.js';
import { SimpleColorizer } from './index.js';

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

  colorForModule(module: Module) {
    const url = `https://cdn.jsdelivr.net/npm/${module.key}/package.json`;
    return fetchJSON<{ type: string }>(url)
      .then(pkg =>
        pkg.type === 'module' ? COLORIZE_MODULE_ESM : COLORIZE_MODULE_CJS,
      )
      .catch(() => '');
  },
} as SimpleColorizer;
