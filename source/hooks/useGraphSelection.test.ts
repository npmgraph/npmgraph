import { describe, expect, it, vi } from 'vitest';
import { parseSelection } from './useGraphSelection.ts';

// The hook's imports use these globals as soon as they load
vi.hoisted(() => {
  vi.stubGlobal('location', new URL('https://example.test/'));
  vi.stubGlobal('addEventListener', vi.fn());
  vi.stubGlobal('history', { pushState: vi.fn(), replaceState: vi.fn() });
});

describe('parseSelection', () => {
  it('reads the type prefix', () => {
    expect(parseSelection('license:MIT')).toEqual(['license', 'MIT']);
    expect(parseSelection('search:a:b')).toEqual(['search', 'a:b']);
  });

  it('keeps colons that belong to the module key', () => {
    expect(parseSelection('pkg@github:user/repo')).toEqual([
      'default',
      'pkg@github:user/repo',
    ]);
  });

  it('defaults to a plain module key, or nothing', () => {
    expect(parseSelection('pkg@^1.2.3')).toEqual(['default', 'pkg@^1.2.3']);
    expect(parseSelection()).toEqual(['default', '']);
  });
});
