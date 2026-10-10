import { describe, expect, it } from 'vitest';
import type Module from '../../lib/Module.ts';
import ModuleTypeColorizer from './ModuleTypeColorizer.tsx';

const CJS = 'var(--bg-red)';
const DUAL = 'var(--bg-yellow)';
const ESM = 'var(--bg-green)';
const TYPES = 'var(--bg-blue)';

const colorFor = async (pkg: Record<string, unknown>) =>
  ModuleTypeColorizer.colorForModule({
    package: { name: 'a', version: '1.0.0', ...pkg },
  } as unknown as Module);

describe('ModuleTypeColorizer', () => {
  it('uses the package type and main file', async () => {
    expect(await colorFor({})).toBe(CJS);
    expect(await colorFor({ type: 'module' })).toBe(ESM);
    expect(await colorFor({ main: 'index.mjs' })).toBe(DUAL);
    expect(await colorFor({ type: 'module', main: 'index.cjs' })).toBe(DUAL);
  });

  it('treats @types packages as types', async () => {
    expect(await colorFor({ name: '@types/node' })).toBe(TYPES);
  });

  it('inspects a string in exports', async () => {
    expect(await colorFor({ exports: './index.mjs' })).toBe(DUAL);
    expect(await colorFor({ type: 'module', exports: './index.js' })).toBe(ESM);
    expect(await colorFor({ type: 'module', exports: './index.cjs' })).toBe(
      DUAL,
    );
  });

  it('infers dual support from import and require', async () => {
    expect(
      await colorFor({ type: 'module', exports: { require: './a.js' } }),
    ).toBe(DUAL);
    expect(await colorFor({ exports: { import: './a.js' } })).toBe(DUAL);
    expect(
      await colorFor({ type: 'module', exports: { default: './a.js' } }),
    ).toBe(ESM);
  });

  it('drills into nested exports', async () => {
    expect(
      await colorFor({
        type: 'module',
        exports: { '.': { node: { require: './a.js' } } },
      }),
    ).toBe(DUAL);
  });

  it('inspects every item of an array in exports', async () => {
    expect(
      await colorFor({ type: 'module', exports: ['./a.mjs', './b.cjs'] }),
    ).toBe(DUAL);
    expect(
      await colorFor({
        type: 'module',
        exports: ['./a.js', { require: './b.js' }],
      }),
    ).toBe(DUAL);
  });

  it('ignores empty exports', async () => {
    expect(await colorFor({ exports: null })).toBe(CJS);
    expect(await colorFor({ type: 'module', exports: {} })).toBe(ESM);
  });
});
