import type { PackageJSON } from '@npm/types';
import type Module from '../../../lib/Module.js';
import { LegendColor } from './LegendColor.js';

export const COLORIZE_MODULE_CJS = 'var(--bg-red)';
export const COLORIZE_MODULE_DUAL = 'var(--bg-yellow)';
export const COLORIZE_MODULE_ESM = 'var(--bg-green)';

export default {
  title: 'Module Type',
  name: 'moduleType',

  legend() {
    return (
      <>
        <LegendColor color={COLORIZE_MODULE_CJS}>CJS Only</LegendColor>
        <LegendColor color={COLORIZE_MODULE_DUAL}>CJS and ESM</LegendColor>
        <LegendColor color={COLORIZE_MODULE_ESM}>ESM Only</LegendColor>
      </>
    );
  },

  async colorForModule(module: Module) {
    const pkg = module.package as PackageJSON;
    const isEsm = pkg.type === 'module' || hasEsmExports(pkg.exports);
    const isCjs = pkg.type !== 'module' || hasCjsExports(pkg.exports);
    if (isEsm && isCjs) {
      return COLORIZE_MODULE_DUAL;
    }
    if (isEsm) {
      return COLORIZE_MODULE_ESM;
    }

    return COLORIZE_MODULE_CJS;
  },
};

// Examine a package.json#exports object to see if it might have ESM exports
function hasEsmExports(exports: unknown): boolean {
  if (Array.isArray(exports)) return exports.some(e => hasEsmExports(e));
  if (!exports || typeof exports !== 'object') return false;

  for (const [k, v] of Object.entries(exports)) {
    if (k === 'import') return true;
    if (typeof v === 'string') {
      if (v?.endsWith('.mjs')) return true;
    } else {
      if (hasEsmExports(v)) return true;
    }
  }

  return false;
}

// Examine a package.json#exports object to see if it looks might have CJS exports
function hasCjsExports(exports: unknown): boolean {
  if (Array.isArray(exports)) return exports.some(e => hasCjsExports(e));
  if (!exports || typeof exports !== 'object') return false;

  for (const [k, v] of Object.entries(exports)) {
    if (k === 'require') return true;
    if (typeof v === 'string') {
      if (v?.endsWith('.cjs')) return true;
    } else {
      if (hasCjsExports(v)) return true;
    }
  }

  return false;
}
