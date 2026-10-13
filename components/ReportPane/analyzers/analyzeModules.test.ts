import type { Packument, PackumentVersion } from '@npm/types';
import { describe, expect, it } from 'vitest';
import Module from '../../../lib/Module.ts';
import type { GraphState } from '../../../lib/graph-util.ts';
import { analyzeModules, groupOutdatedByLevel } from './analyzeModules.ts';

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

describe('groupOutdatedByLevel', () => {
  const group = (modules: Module[]) =>
    groupOutdatedByLevel(analyze(modules).outdated).map(([level, items]) => [
      level,
      items.map(({ module }) => module.name),
    ]);

  it('groups the modules by level, most outdated first', () => {
    expect(
      group([
        createModule('patch', '1.0.0', '1.0.1'),
        createModule('pre', '2.0.0-beta.1', '2.0.0'),
        createModule('minor', '1.0.0', '1.2.0'),
        createModule('major', '1.0.0', '3.0.0'),
      ]),
    ).toEqual([
      ['major', ['major']],
      ['minor', ['minor']],
      ['patch', ['patch']],
      ['prerelease', ['pre']],
    ]);
  });

  it('sorts the modules by name within a group', () => {
    expect(
      group([
        createModule('b', '1.0.0', '2.0.0'),
        createModule('c', '1.0.0', '2.0.0'),
        createModule('a', '1.0.0', '2.0.0'),
      ]),
    ).toEqual([['major', ['a', 'b', 'c']]]);
  });

  it('leaves out the levels without modules', () => {
    expect(group([createModule('patch', '1.0.0', '1.0.1')])).toEqual([
      ['patch', ['patch']],
    ]);
  });

  it('returns no groups without outdated modules', () => {
    expect(group([createModule('current', '1.0.0', '1.0.0')])).toEqual([]);
  });
});
