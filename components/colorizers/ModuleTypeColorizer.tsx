import type { PackageJSON } from '@npm/types';
import type Module from '../../lib/Module.ts';
import { colors } from './colors.ts';
import { LegendColor } from './LegendColor.tsx';
import type { SimpleColorizer } from './types.ts';

export default {
  title: 'Module Type',
  name: 'moduleType',

  legend() {
    return (
      <>
        <LegendColor color="red">CJS Only</LegendColor>
        <LegendColor color="yellow">CJS and ESM</LegendColor>
        <LegendColor color="green">ESM Only</LegendColor>
        <LegendColor color="blue">TypeScript types</LegendColor>
      </>
    );
  },

  async colorForModule(module: Module) {
    const pkgType = detectPackageType(module.package);

    if (pkgType.esm && pkgType.cjs) {
      return colors.yellow;
    }

    if (pkgType.esm) {
      return colors.green;
    }

    if (pkgType.cjs) {
      return colors.red;
    }

    return pkgType.types ? colors.blue : '';
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

function isESMFile(file = '') {
  return /\.m[jt]s$/v.test(file);
}

function isCJSFile(file = '') {
  return /\.c[jt]s$/v.test(file);
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
  const hasImport = 'import' in exports && Boolean(exports.import);
  const hasRequire = 'require' in exports && Boolean(exports.require);

  if (hasImport || (defaultValue && hasRequire)) {
    pkgType.esm = true;
  }

  if (hasRequire || (defaultValue && hasImport)) {
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
