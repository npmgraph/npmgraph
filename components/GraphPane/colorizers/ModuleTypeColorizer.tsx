import type { PackageJSON } from '@npm/types';
import type Module from '../../../lib/Module.js';
import { LegendColor } from './LegendColor.js';

export const COLORIZE_MODULE_CJS = 'var(--bg-red)';
export const COLORIZE_MODULE_DUAL = 'var(--bg-yellow)';
export const COLORIZE_MODULE_ESM = 'var(--bg-green)';
export const COLORIZE_MODULE_TYPES = 'var(--bg-blue)';

export default {
  title: 'Module Type',
  name: 'moduleType',

  legend() {
    return (
      <>
        <LegendColor color={COLORIZE_MODULE_CJS}>CJS Only</LegendColor>
        <LegendColor color={COLORIZE_MODULE_DUAL}>CJS and ESM</LegendColor>
        <LegendColor color={COLORIZE_MODULE_ESM}>ESM Only</LegendColor>
        <LegendColor color={COLORIZE_MODULE_TYPES}>TS Types</LegendColor>
      </>
    );
  },

  async colorForModule(module: Module) {
    const pkgType = detectPackageType(module.package as PackageJSON);
    if (pkgType.esm && pkgType.cjs) {
      return COLORIZE_MODULE_DUAL;
    }
    if (pkgType.esm) {
      return COLORIZE_MODULE_ESM;
    }

    if (pkgType.cjs) {
      return COLORIZE_MODULE_CJS;
    }

    if (pkgType.types) {
      return COLORIZE_MODULE_TYPES;
    }
  },
};

type PackageModuleType = {
  esm: boolean;
  cjs: boolean;
  types: boolean;
};

// Package-type detection logic
//
// Logic to look at a PackageJSON object and determine if it is an ESM or CJS
// package, with some other convenience logic thrown in for good measure.
//
// Ref:
// https://github.com/npmgraph/npmgraph/pull/326#issuecomment-2972640439
function detectPackageType(pkg: PackageJSON) {
  // If the package name starts with @types/, then it's TS-types only
  if (pkg.name.startsWith?.('@types/')) {
    return { esm: false, cjs: false, types: true };
  }

  const pkgType: PackageModuleType = {
    // If pkg#type is not set to 'module', assume it's CJS
    cjs: pkg.type !== 'module',

    // If pkg#type is set to 'module', then it's ESM
    esm: pkg.type === 'module',

    // If pkg#types is set, then TS types are available
    types: pkg.types !== undefined,
  };

  // Inspect package#main
  if (pkg.main?.endsWith?.('.mjs')) pkgType.esm = true;
  if (pkg.main?.endsWith?.('.cjs')) pkgType.cjs = true;

  // Inspect package#exports (recursively)
  return _detectExports(pkg.exports, pkgType);
}

// Loosely inspect package.json#exports for module type (recursive)
function _detectExports(exports: unknown, pkgType: PackageModuleType) {
  if (Array.isArray(exports)) exports.some(v => _detectExports(v, pkgType));

  if (exports && typeof exports === 'object') {
    for (const [k, v] of Object.entries(exports)) {
      if (k === 'import') {
        pkgType.esm = true;
      } else if (k === 'require') {
        pkgType.cjs = true;
      } else if (k === 'default') {
        pkgType.esm = true;
        pkgType.cjs = true;
      }

      if (typeof v === 'string') {
        if (v?.endsWith('.mjs')) pkgType.esm = true;
        if (v?.endsWith('.cjs')) pkgType.cjs = true;
      } else {
        _detectExports(v, pkgType);
      }
    }
  }

  return pkgType;
}
