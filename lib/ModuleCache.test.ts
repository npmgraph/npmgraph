import type { PackumentVersion } from '@npm/types';
import { describe, expect, it, vi } from 'vitest';
import {
  cacheLocalPackage,
  getCachedModule,
  getModule,
} from './ModuleCache.ts';
import fetchJson from './fetchJson.ts';

vi.mock('./fetchJson.ts', () => ({ default: vi.fn() }));
vi.mock('./registry-util.ts', () => ({ getRegistry: () => 'test://registry' }));

const local = (pkg: object) =>
  cacheLocalPackage(pkg as unknown as PackumentVersion);

describe('local packages', () => {
  it('are returned as local modules', async () => {
    const module = local({ name: 'local-module', version: '1.0.0' });

    await expect(getModule('local-module@1.0.0')).resolves.toBe(module);
    expect(getCachedModule('local-module@1.0.0')).toBe(module);
    expect(module.isLocal).toBe(true);
  });

  it('reflect changes when re-added with the same name and version', async () => {
    const pkg = { name: 'edited-module', version: '1.0.0' };
    local({ ...pkg, dependencies: { a: '1' } });
    await getModule('edited-module@1.0.0');

    local({ ...pkg, dependencies: { b: '1' } });
    const module = await getModule('edited-module@1.0.0');

    expect(module.package.dependencies).toEqual({ b: '1' });
  });

  it('reflect changes when re-added without a version', async () => {
    const dependencies = async (key: string) => {
      const { package: pkg } = await getModule(key);
      return pkg.dependencies;
    };

    local({ name: 'unversioned-module', dependencies: { a: '1' } });
    await expect(dependencies('unversioned-module')).resolves.toEqual({
      a: '1',
    });

    local({ name: 'unversioned-module', dependencies: { b: '1' } });
    await expect(dependencies('unversioned-module')).resolves.toEqual({
      b: '1',
    });
  });
});

describe('GitHub repos', () => {
  it('are loaded from user/repo', async () => {
    const pkg = { name: 'shorthand-package', version: '1.0.0' };
    vi.mocked(fetchJson).mockResolvedValueOnce(pkg);

    const module = await getModule('some-user/some-repo');

    expect(module.key).toBe('shorthand-package@1.0.0');
    expect(String(vi.mocked(fetchJson).mock.calls[0]?.[0])).toBe(
      'https://raw.githubusercontent.com/some-user/some-repo/HEAD/package.json',
    );
  });
});
