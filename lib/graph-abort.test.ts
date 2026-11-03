import { beforeEach, describe, expect, it, vi } from 'vitest';
import fetchJson from './fetchJson.ts';
import { getGraphForQuery } from './graph-util.ts';
import { clearModuleCache } from './ModuleCache.ts';

vi.mock('./fetchJson.ts', () => ({ default: vi.fn() }));
vi.mock('./registry-util.ts', () => ({ getRegistry: () => 'test://registry' }));

const types = new Set(['dependencies' as const]);
const requests = new Map<string, RequestInit | undefined>();
const hanging = new Set<string>();

const packument = (name: string, dependencies = {}) => ({
  name,
  'dist-tags': { latest: '1.0.0' },
  versions: { '1.0.0': { name, version: '1.0.0', dependencies } },
});

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
  clearModuleCache();
  requests.clear();
  hanging.clear();

  vi.mocked(fetchJson).mockImplementation(
    async (input: URL | string, init?: RequestInit) => {
      const name = String(input).replace('test://registry/', '');
      requests.set(name, init);

      if (hanging.has(name)) {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        });
      }

      return packument(
        name,
        /^xo-[a-c]$/.test(name) ? { [`${name}-dep`]: '1' } : {},
      );
    },
  );
});

describe('getGraphForQuery signal', () => {
  it('aborts requests still in flight', async () => {
    hanging.add('xo-a-dep');
    const controller = new AbortController();
    const graph = getGraphForQuery(
      ['xo-a'],
      types,
      () => true,
      controller.signal,
    );

    await vi.waitFor(() => {
      expect(requests.has('xo-a-dep')).toBe(true);
    });
    controller.abort();

    expect(requests.get('xo-a-dep')?.signal?.aborted).toBe(true);
    await graph;
  });

  it('does not start requests after being aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    await getGraphForQuery(['xo-b'], types, () => true, controller.signal);

    expect(requests.size).toBe(0);
  });

  it('can load the same modules again after an abort', async () => {
    hanging.add('xo-c-dep');
    const controller = new AbortController();
    const aborted = getGraphForQuery(
      ['xo-c'],
      types,
      () => true,
      controller.signal,
    );

    await vi.waitFor(() => {
      expect(requests.has('xo-c-dep')).toBe(true);
    });
    controller.abort();
    expect(requests.get('xo-c-dep')?.signal?.aborted).toBe(true);
    await aborted;

    hanging.clear();
    const graph = await getGraphForQuery(['xo-c'], types, () => true);
    expect([...graph.moduleInfos.keys()].toSorted()).toEqual([
      'xo-c-dep@1.0.0',
      'xo-c@1.0.0',
    ]);
  });
});
