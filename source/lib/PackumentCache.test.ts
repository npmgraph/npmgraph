import type { Packument } from '@npm/types';
import { describe, expect, it, vi } from 'vitest';
import fetchJson from './fetchJson.ts';
import { getCachedPackument, getNPMPackument } from './PackumentCache.ts';

vi.mock('./fetchJson.ts', () => ({ default: vi.fn() }));
vi.mock('./registry-util.ts', () => ({ getRegistry: () => 'test://registry' }));

describe('getCachedPackument', () => {
  it('returns packuments once they have been fetched', async () => {
    const packument = { name: 'fetched' } as Packument;
    vi.mocked(fetchJson).mockResolvedValueOnce(packument);

    expect(getCachedPackument('fetched')).toBeUndefined();
    await getNPMPackument('fetched');
    expect(getCachedPackument('fetched')).toBe(packument);
  });
});
