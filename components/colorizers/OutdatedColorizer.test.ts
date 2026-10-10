import type { Packument } from '@npm/types';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type Module from '../../lib/Module.ts';
import { COLORIZE_COLORS } from '../../lib/constants.ts';
import { getNPMPackument } from '../../lib/PackumentCache.ts';
import OutdatedColorizer from './OutdatedColorizer.tsx';

vi.mock('../../lib/PackumentCache.ts', () => ({ getNPMPackument: vi.fn() }));

const colorFor = async (version: string, latest?: string, extra = {}) => {
  vi.mocked(getNPMPackument).mockResolvedValue({
    'dist-tags': latest ? { latest } : {},
  } as unknown as Packument);
  return OutdatedColorizer.colorForModule({
    name: 'a',
    version,
    ...extra,
  } as Module);
};

afterEach(() => {
  vi.resetAllMocks();
});

describe('OutdatedColorizer', () => {
  it('colors by the kind of update that is available', async () => {
    expect(await colorFor('1.2.3', '2.0.0')).toBe(COLORIZE_COLORS[0]);
    expect(await colorFor('1.2.3', '1.3.0')).toBe(COLORIZE_COLORS[1]);
    expect(await colorFor('1.2.3', '1.2.4')).toBe(COLORIZE_COLORS[2]);
    expect(await colorFor('1.0.0-beta', '1.0.0-rc')).toBe(COLORIZE_COLORS[2]);
  });

  it('colors modules that are not behind as up to date', async () => {
    expect(await colorFor('1.2.3', '1.2.3')).toBe(COLORIZE_COLORS[3]);
    expect(await colorFor('2.0.0', '1.0.0')).toBe(COLORIZE_COLORS[3]);
  });

  it('does not color local and stub modules', async () => {
    expect(await colorFor('1.0.0', '2.0.0', { isLocal: true })).toBe('');
    expect(await colorFor('1.0.0', '2.0.0', { isStub: true })).toBe('');
  });
});
