import type { Packument } from '@npm/types';
import type { DependencyKey } from './graph-types.ts';
import { serializeGraph } from './graph-serialize.ts';
import { getGraphForQuery } from './graph-util.ts';
import { clearModuleCache } from './ModuleCache.ts';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { packuments } = vi.hoisted(() => ({
  packuments: new Map<string, Packument>(),
}));

vi.mock('./PackumentCache.ts', () => ({
  getNPMPackument: async (name: string) => packuments.get(name),
  getCachedPackument: (name: string) => packuments.get(name),
  cachePackument: vi.fn(),
}));
vi.mock('./registry-util.ts', () => ({ getRegistry: () => 'test://registry' }));

const add = (
  name: string,
  versions: Record<string, object>,
  tags: Record<string, string> = {},
) =>
  packuments.set(name, {
    name,
    'dist-tags': { latest: Object.keys(versions).at(-1)!, ...tags },
    versions: Object.fromEntries(
      Object.entries(versions).map(([version, rest]) => [
        version,
        { name, version, ...rest },
      ]),
    ),
  } as unknown as Packument);

const root = (rest: object) => add('root', { '1.0.0': rest });

const graph = async (
  types: DependencyKey[] = ['dependencies'],
  query = 'root@1.0.0',
) =>
  serializeGraph(await getGraphForQuery([query], new Set(types), () => true));

const edges = async (...args: Parameters<typeof graph>) =>
  graph(...args).then(g => g.edges);

const nodeKeys = async (...args: Parameters<typeof graph>) =>
  graph(...args).then(g => Object.keys(g.nodes).toSorted());

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  packuments.clear();
  clearModuleCache();
  add('react', { '17.0.2': {}, '18.2.0': {} }, { next: '18.2.0' });
});

describe('aliases', () => {
  it('npm:name@range', async () => {
    root({ dependencies: { 'npm-prefix-versioned': 'npm:react@^17.0.2' } });
    await expect(nodeKeys()).resolves.toEqual(['react@17.0.2', 'root@1.0.0']);
    await expect(edges()).resolves.toEqual([
      'root@1.0.0 -> react@17.0.2 [dependencies]',
    ]);
  });

  it('scoped alias target', async () => {
    add('@s/p', { '1.2.0': {} });
    root({ dependencies: { x: 'npm:@s/p@1' } });
    await expect(edges()).resolves.toEqual([
      'root@1.0.0 -> @s/p@1.2.0 [dependencies]',
    ]);
  });

  it.each([
    { react: '^18', react17: 'npm:react@^17' },
    { react17: 'npm:react@^17', react: '^18' },
  ])('alias of a direct dependency keeps both %o', async dependencies => {
    root({ dependencies });
    await expect(nodeKeys()).resolves.toEqual([
      'react@17.0.2',
      'react@18.2.0',
      'root@1.0.0',
    ]);
    await expect(edges()).resolves.toEqual(
      expect.arrayContaining([
        'root@1.0.0 -> react@17.0.2 [dependencies]',
        'root@1.0.0 -> react@18.2.0 [dependencies]',
      ]),
    );
  });

  it('bare npm:name (no range) resolves to latest', async () => {
    root({ dependencies: { x: 'npm:react' } });
    await expect(edges()).resolves.toEqual([
      'root@1.0.0 -> react@18.2.0 [dependencies]',
    ]);
  });
});

describe('overrides', () => {
  it('global override replaces range', async () => {
    root({ dependencies: { react: '^17' }, overrides: { react: '18.2.0' } });
    await expect(edges()).resolves.toEqual([
      'root@1.0.0 -> react@18.2.0 [dependencies]',
    ]);
  });

  it('nested override only applies under its parent', async () => {
    add('foo', { '1.0.0': { dependencies: { react: '^17' } } });
    add('bar', { '1.0.0': { dependencies: { react: '^17' } } });
    root({
      dependencies: { foo: '1', bar: '1' },
      overrides: { foo: { react: '18.2.0' } },
    });
    await expect(edges()).resolves.toEqual(
      expect.arrayContaining([
        'foo@1.0.0 -> react@18.2.0 [dependencies]',
        'bar@1.0.0 -> react@17.0.2 [dependencies]',
      ]),
    );
  });

  it.fails('nested override applies to the whole subtree', async () => {
    add('baz', { '1.0.0': { dependencies: { react: '^17' } } });
    add('foo', { '1.0.0': { dependencies: { baz: '1' } } });
    root({
      dependencies: { foo: '1' },
      overrides: { foo: { react: '18.2.0' } },
    });
    await expect(edges()).resolves.toContain(
      'baz@1.0.0 -> react@18.2.0 [dependencies]',
    );
  });

  it.fails('override value may be an npm: alias', async () => {
    root({
      dependencies: { react: '^17' },
      overrides: { react: 'npm:react@18.2.0' },
    });
    await expect(edges()).resolves.toEqual([
      'root@1.0.0 -> react@18.2.0 [dependencies]',
    ]);
  });

  it.fails('$ref override uses the root dependency spec', async () => {
    add('a', { '1.0.0': { dependencies: { react: '^18' } } });
    root({
      dependencies: { a: '1', react: '17.0.2' },
      overrides: { react: '$react' },
    });
    await expect(edges()).resolves.toContain(
      'a@1.0.0 -> react@17.0.2 [dependencies]',
    );
  });

  it.fails('version-scoped key only applies to matching specs', async () => {
    add('x', { '1.0.0': {}, '2.0.0': {}, '3.0.0': {} });
    add('a', { '1.0.0': { dependencies: { x: '^1' } } });
    add('b', { '1.0.0': { dependencies: { x: '^3' } } });
    root({
      dependencies: { a: '1', b: '1' },
      overrides: { 'x@^1': '2.0.0' },
    });
    await expect(edges()).resolves.toEqual(
      expect.arrayContaining([
        'a@1.0.0 -> x@2.0.0 [dependencies]',
        'b@1.0.0 -> x@3.0.0 [dependencies]',
      ]),
    );
  });
});

describe('spec kinds', () => {
  beforeEach(() => add('x', { '1.0.0': {} }, { beta: '1.0.0' }));

  it('dist-tag', async () => {
    root({ dependencies: { react: 'next' } });
    await expect(edges()).resolves.toEqual([
      'root@1.0.0 -> react@18.2.0 [dependencies]',
    ]);
  });

  it.each([
    'file:../x',
    'link:../x',
    'workspace:*',
    'https://example.com/x.tgz',
  ])('%s → stub', async spec => {
    root({ dependencies: { x: spec } });
    await expect(graph()).resolves.toMatchObject({
      nodes: { [`x@${spec}`]: { level: 1, stub: true } },
    });
  });

  it('git spec falls back to registry', async () => {
    root({ dependencies: { x: 'git+https://github.com/a/x.git#abc' } });
    await expect(edges()).resolves.toEqual([
      'root@1.0.0 -> x@1.0.0 [dependencies]',
    ]);
  });

  it('missing package / unsatisfiable range → stub node, no throw', async () => {
    root({ dependencies: { ghost: '^1', react: '^19' } });
    await expect(graph()).resolves.toMatchObject({
      nodes: { 'ghost@^1': { stub: true }, 'react@^19': { stub: true } },
    });
  });

  it('failed entry module', async () => {
    await expect(graph(['dependencies'], 'nope@1')).resolves.toMatchObject({
      failed: ['nope@1'],
    });
  });
});

describe('graph structure', () => {
  it('dev deps only at level 0', async () => {
    add('a', { '1.0.0': { devDependencies: { react: '^17' } } });
    root({ dependencies: { a: '1' }, devDependencies: { react: '18' } });
    await expect(edges(['dependencies', 'devDependencies'])).resolves.toEqual([
      'root@1.0.0 -> a@1.0.0 [dependencies]',
      'root@1.0.0 -> react@18.2.0 [devDependencies]',
    ]);
  });

  it('same version dedupes, different versions split', async () => {
    add('a', { '1.0.0': { dependencies: { react: '^17' } } });
    add('b', { '1.0.0': { dependencies: { react: '17.0.2' } } });
    add('c', { '1.0.0': { dependencies: { react: '^18' } } });
    root({ dependencies: { a: '1', b: '1', c: '1' } });
    await expect(
      nodeKeys().then(keys => keys.filter(k => k.startsWith('react@'))),
    ).resolves.toEqual(['react@17.0.2', 'react@18.2.0']);
  });

  it('cycles terminate', async () => {
    add('a', { '1.0.0': { dependencies: { b: '1' } } });
    add('b', { '1.0.0': { dependencies: { a: '1' } } });
    root({ dependencies: { a: '1' } });
    await expect(edges()).resolves.toContain(
      'b@1.0.0 -> a@1.0.0 [dependencies]',
    );
  });
});

describe('optional dependencies', () => {
  const types: DependencyKey[] = ['dependencies', 'optionalDependencies'];

  it('are followed like regular dependencies', async () => {
    add('b', { '1.0.0': {} });
    add('a', { '1.0.0': { optionalDependencies: { b: '1' } } });
    root({ optionalDependencies: { a: '1' } });
    await expect(edges(types)).resolves.toEqual(
      expect.arrayContaining([
        'root@1.0.0 -> a@1.0.0 [optionalDependencies]',
        'a@1.0.0 -> b@1.0.0 [optionalDependencies]',
      ]),
    );
  });

  it('override dependencies with the same name', async () => {
    root({
      dependencies: { react: '^17' },
      optionalDependencies: { react: '^18' },
    });
    await expect(edges(types)).resolves.toEqual([
      'root@1.0.0 -> react@18.2.0 [optionalDependencies]',
    ]);
  });

  it('are ignored unless requested', async () => {
    root({ optionalDependencies: { react: '^17' } });
    await expect(nodeKeys()).resolves.toEqual(['root@1.0.0']);
  });
});

describe('peer dependencies', () => {
  const types: DependencyKey[] = ['dependencies', 'peerDependencies'];

  it('reuses an existing satisfying node', async () => {
    add('a', { '1.0.0': { peerDependencies: { react: '^17 || ^18' } } });
    root({ dependencies: { a: '1', react: '17.0.2' } });
    await expect(nodeKeys(types)).resolves.not.toContain('react@18.2.0');
    await expect(edges(types)).resolves.toContain(
      'a@1.0.0 -> react@17.0.2 [peerDependencies]',
    );
  });

  it('fetches when no node satisfies', async () => {
    add('a', { '1.0.0': { peerDependencies: { react: '^18' } } });
    root({ dependencies: { a: '1' } });
    await expect(edges(types)).resolves.toContain(
      'a@1.0.0 -> react@18.2.0 [peerDependencies]',
    );
  });

  it('optional peers are skipped', async () => {
    add('a', {
      '1.0.0': {
        peerDependencies: { react: '^17' },
        peerDependenciesMeta: { react: { optional: true } },
      },
    });
    root({ dependencies: { a: '1' } });
    await expect(nodeKeys(types)).resolves.not.toContain('react@17.0.2');
  });

  it('no duplicate edges for level-0 peers', async () => {
    root({ peerDependencies: { react: '^17' } });
    await expect(edges(types)).resolves.toSatisfy(
      (edges: string[]) => new Set(edges).size === edges.length,
    );
  });
});
