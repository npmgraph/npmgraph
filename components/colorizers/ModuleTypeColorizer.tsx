import type { PackageJSON } from '@npm/types';
import type Module from '../../lib/Module.ts';
import { LegendColor } from './LegendColor.tsx';
import type { SimpleColorizer } from './types.ts';

const COLORIZE_MODULE_CJS = 'var(--bg-red)';
const COLORIZE_MODULE_DUAL = 'var(--bg-yellow)';
const COLORIZE_MODULE_ESM = 'var(--bg-green)';
const COLORIZE_MODULE_TYPES = 'var(--bg-blue)';

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
    const pkgType = detectPackageType(module.package);

    if (pkgType.esm && pkgType.cjs) {
      return COLORIZE_MODULE_DUAL;
    }

    if (pkgType.esm) {
      return COLORIZE_MODULE_ESM;
    }

    if (pkgType.cjs) {
      return COLORIZE_MODULE_CJS;
    }

    return pkgType.types ? COLORIZE_MODULE_TYPES : '';
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
    cjs: pkg['type'] !== 'module',

    // If pkg#type is set to 'module', then it's ESM
    esm: pkg['type'] === 'module',

    // If pkg#types is set, then TS types are available
    types: pkg.types !== undefined,
  };

  // Inspect package#main
  if (isESMFile(pkg.main)) {
    pkgType.esm = true;
  }

  if (isCJSFile(pkg.main)) {
    pkgType.cjs = true;
  }

  // Inspect package#exports (recursively)
  return _detectExports(pkg['exports'], pkgType);
}

// The presence of .mjs, .mts, .cjs, or .cts files is a strong indicator of
// the module type
function detectFile(file: string, pkgType: PackageModuleType) {
  if (isESMFile(file)) {
    pkgType.esm = true;
  }

  if (isCJSFile(file)) {
    pkgType.cjs = true;
  }
}

// Infer dual support if there's an explicit import or require in combination
// with a default export
function detectConditions(exports: object, pkgType: PackageModuleType) {
  const defaultValue = 'default' in exports && exports.default;
  const importValue = 'import' in exports && exports.import;
  const requireValue = 'require' in exports && exports.require;

  if (importValue || (defaultValue && requireValue)) {
    pkgType.esm = true;
  }

  if (requireValue || (defaultValue && importValue)) {
    pkgType.cjs = true;
  }
}

// Loosely inspect package.json#exports for module type (recursive)
function _detectExports(exports: unknown, pkgType: PackageModuleType) {
  if (typeof exports === 'string') {
    detectFile(exports, pkgType);
  } else if (exports && typeof exports === 'object') {
    // Also drills into arrays, since they are objects
    detectConditions(exports, pkgType);
    for (const v of Object.values(exports)) {
      _detectExports(v, pkgType);
    }
  }

  return pkgType;
}
