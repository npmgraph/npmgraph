import type { Packument, PackumentVersion } from '@npm/types';
import { describe, expect, it } from 'vitest';
import Module from '../../../lib/Module.ts';
import type { GraphState } from '../../../lib/graph-util.ts';
import { analyzeModules } from './analyzeModules.ts';

function createModule(name: string, version: string, latest: string) {
  const pkg = { name, version } as PackumentVersion;
  const packument = {
    name,
    'dist-tags': { latest },
    versions: { [version]: pkg },
  } as unknown as Packument;
  return new Module(pkg, packument);
}

function analyze(modules: Module[]) {
  const moduleInfos = new Map(modules.map(module => [module.key, { module }]));
  return analyzeModules({
    moduleInfos,
    entryModules: new Set(),
  } as unknown as GraphState);
}

describe('analyzeModules', () => {
  it('collects the modules that are behind the latest version', () => {
    const { outdated } = analyze([
      createModule('current', '2.0.0', '2.0.0'),
      createModule('major', '1.0.0', '3.0.0'),
      createModule('patch', '1.0.0', '1.0.1'),
    ]);

    expect(
      outdated.map(({ module, status }) => [module.name, status.level]),
    ).toEqual([
      ['major', 'major'],
      ['patch', 'patch'],
    ]);
  });

  it('skips local modules and modules without a packument', () => {
    const local = createModule('local', '1.0.0', '2.0.0');
    local.isLocal = true;
    const noPackument = new Module({
      name: 'bare',
      version: '1.0.0',
    } as PackumentVersion);

    expect(analyze([local, noPackument]).outdated).toEqual([]);
  });
});
