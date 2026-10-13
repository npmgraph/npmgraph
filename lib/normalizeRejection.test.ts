import { describe, expect, it } from 'vitest';
import { normalizeRejection } from './normalizeRejection.ts';

describe('normalizeRejection', () => {
  it('returns Errors unchanged', () => {
    const error = new Error('boom');
    expect(normalizeRejection(error)).toBe(error);
  });

  it.each([
    ['a string', 'oops', '[object String] "oops"'],
    ['undefined', undefined, '[object Undefined] undefined'],
    ['an object', { code: 1 }, '[object Object] {"code":1}'],
  ])('wraps %s', (_label, reason, expected) => {
    const error = normalizeRejection(reason);
    expect(error.message).toBe(`Non-Error promise rejection: ${expected}`);
    expect(error.cause).toBe(reason);
  });

  it('handles values that cannot be serialized', () => {
    const circular: Record<string, unknown> = {};
    circular['self'] = circular;
    expect(normalizeRejection(circular).message).toContain('[object Object]');
  });
});
