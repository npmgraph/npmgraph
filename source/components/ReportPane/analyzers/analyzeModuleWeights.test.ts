import { describe, expect, it } from 'vitest';
import Module from '../../../lib/Module.ts';
import { analyzeModuleWeights } from './analyzeModuleWeights.ts';

const create = (name: string) => new Module({ name, version: '1.0.0' });

describe('analyzeModuleWeights', () => {
  it('counts what each module pulls in and flags the heavy ones', () => {
    const root = create('root');
    const a = create('a');
    const b = create('b');
    const shared = create('shared');
    const own = create('own');
    const edges = new Map([
      [root, [a, b]],
      [a, [shared, own]],
      [b, [shared]],
    ]);
    const moduleInfos = new Map(
      [root, a, b, shared, own].map(module => [
        module.key,
        {
          module,
          downstream: new Set(
            (edges.get(module) ?? []).map(dep => ({
              module: dep,
              type: 'dependencies',
            })),
          ),
        },
      ]),
    );

    const weights = analyzeModuleWeights({
      moduleInfos,
      entryModules: new Set([root]),
    } as never);

    expect([...weights]).toEqual([
      [a.key, { pulls: 2, heavy: true }],
      [b.key, { pulls: 1, heavy: false }],
    ]);
  });
});
