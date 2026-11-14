import { describe, expect, it } from 'vitest';
import Module from '../../../lib/Module.ts';
import { analyzeRemovalImpact } from './analyzeRemovalImpact.ts';

const create = (name: string) => new Module({ name, version: '1.0.0' });

describe('analyzeRemovalImpact', () => {
  it('counts only the modules that no other dependency needs', () => {
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

    const impact = analyzeRemovalImpact({
      moduleInfos,
      entryModules: new Set([root]),
    } as never);

    expect(
      impact.map(({ module, dropped, total }) => [module.name, dropped, total]),
    ).toEqual([['a', 2, 3]]);
  });
});
