import { describe, expect, it, vi } from 'vitest';
import memoizeRecent from './memoizeRecent.ts';

describe('memoizeRecent', () => {
  it('calls the function once per key', () => {
    const fn = vi.fn((key: string) => ({ key }));
    const memoized = memoizeRecent(fn);

    expect(memoized('a')).toBe(memoized('a'));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('only uses the first argument as the key', () => {
    const fn = vi.fn((key: string, extra: number) => `${key}${extra}`);
    const memoized = memoizeRecent(fn);

    expect(memoized('a', 1)).toBe('a1');
    expect(memoized('a', 2)).toBe('a1');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('forgets the least recently used key', () => {
    const fn = vi.fn((key: string) => key);
    const memoized = memoizeRecent(fn, 2);

    memoized('a');
    memoized('b');
    memoized('a');
    memoized('c');
    expect(fn).toHaveBeenCalledTimes(3);

    memoized('a');
    expect(fn).toHaveBeenCalledTimes(3);

    memoized('b');
    expect(fn).toHaveBeenCalledTimes(4);
  });

  it('does not remember errors', () => {
    const fn = vi
      .fn<(key: string) => string>()
      .mockImplementationOnce(() => {
        throw new Error('Failed');
      })
      .mockImplementationOnce(() => 'ok');
    const memoized = memoizeRecent(fn);

    expect(() => memoized('a')).toThrow('Failed');
    expect(memoized('a')).toBe('ok');
  });
});
