import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flash } from './flash.ts';
import { getModule, syncPackagesHash } from './ModuleCache.ts';
import { PARAM_PACKAGES } from './constants.ts';

vi.mock('./flash.ts', () => ({ flash: vi.fn() }));
vi.mock('./registry-util.ts', () => ({ getRegistry: () => 'test://registry' }));

// Unchanged values are skipped, so every test needs a different one
const sync = (packages: unknown) => {
  const hash = encodeURIComponent(JSON.stringify(packages));
  vi.stubGlobal(
    'location',
    new URL(`https://example.test/#${PARAM_PACKAGES}=${hash}`),
  );
  syncPackagesHash();
};

beforeEach(() => {
  vi.mocked(flash).mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('syncPackagesHash', () => {
  it('loads packages from the hash', async () => {
    sync([{ name: 'hash-package', version: '1.0.0' }]);

    await expect(getModule('hash-package@1.0.0')).resolves.toMatchObject({
      name: 'hash-package',
    });
    expect(flash).not.toHaveBeenCalled();
  });

  it('only keeps whitelisted fields', async () => {
    sync([{ name: 'clean-package', version: '1.0.0', scripts: { test: 'x' } }]);

    const module = await getModule('clean-package@1.0.0');

    expect(module.package).not.toHaveProperty('scripts');
  });

  it.each([
    ['an object', {}],
    ['a string', 'text'],
    ['a null package', [null]],
    ['a package without a name', [{ version: '1.0.0' }]],
  ])('rejects %s', (_, value) => {
    expect(() => {
      sync(value);
    }).not.toThrow();
    expect(flash).toHaveBeenCalledOnce();
  });
});
