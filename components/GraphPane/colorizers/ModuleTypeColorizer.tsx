import type { PackageJSON } from '@npm/types';
import type Module from '../../../lib/Module.js';
import { LegendColor } from './LegendColor.js';
import type { SimpleColorizer } from './index.js';

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
        <LegendColor color={COLORIZE_MODULE_TYPES}>
          TypeScript types
        </LegendColor>
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

    return '';
  },
} as SimpleColorizer;

// Package-type detection logic
//
// Ref:
// https://github.com/npmgraph/npmgraph/pull/326#issuecomment-2972640439

type PackageModuleType = {
  esm: boolean;
  cjs: boolean;
  types: boolean;
};

function isESMFile(file?: string) {
  return file?.endsWith?.('.mjs') || file?.endsWith?.('.mts');
}

function isCJSFile(file?: string) {
  return file?.endsWith?.('.cjs') || file?.endsWith?.('.cts');
}

function detectPackageType(pkg: PackageJSON) {
  // @types/* packages are TS-types (not CJS or ESM)
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
  if (isESMFile(pkg.main)) pkgType.esm = true;
  if (isCJSFile(pkg.main)) pkgType.cjs = true;

  // Inspect package#exports (recursively)
  return _detectExports(pkg.exports, pkgType);
}

// Loosely inspect package.json#exports for module type (recursive)
function _detectExports(exports: unknown, pkgType: PackageModuleType) {
  if (!exports) return pkgType;

  // The presence of .mjs, .mts, .cjs, or .cts files is a strong indicator of
  // the module type
  if (typeof exports === 'string') {
    if (isESMFile(exports)) pkgType.esm = true;
    if (isCJSFile(exports)) pkgType.cjs = true;
    return pkgType;
  }

  // Drill into array values
  if (Array.isArray(exports)) exports.some(v => _detectExports(v, pkgType));

  if (typeof exports === 'object') {
    const defaultVal = 'default' in exports && exports.default;
    const importVal = 'import' in exports && exports.import;
    const requireVal = 'require' in exports && exports.require;

    // Infer dual support if there's an explicit import or require in
    // combination with a default export
    if (importVal || (defaultVal && requireVal)) pkgType.esm = true;
    if (requireVal || (defaultVal && importVal)) pkgType.cjs = true;

    // Drill down into object values
    Object.values(exports).forEach(v => _detectExports(v, pkgType));
  }

  return pkgType;
}
