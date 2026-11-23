import { describe, expect, it } from 'vitest';
import { isOptionalPeerDependency } from './peer-dependency-util.ts';

describe('isOptionalPeerDependency', () => {
  it('returns true when a peer dependency is marked optional', () => {
    expect(
      isOptionalPeerDependency(
        {
          react: { optional: true },
        },
        'react',
      ),
    ).toBe(true);
  });

  it('returns false when a peer dependency is not marked optional', () => {
    expect(
      isOptionalPeerDependency(
        {
          react: {},
        },
        'react',
      ),
    ).toBe(false);
  });

  it('returns false when metadata does not include the dependency', () => {
    expect(isOptionalPeerDependency({}, 'react')).toBe(false);
  });

  it('returns false when peerDependenciesMeta is undefined', () => {
    expect(isOptionalPeerDependency(undefined, 'react')).toBe(false);
  });

  it('returns false when optional is explicitly false', () => {
    expect(
      isOptionalPeerDependency(
        {
          react: { optional: false },
        },
        'react',
      ),
    ).toBe(false);
  });
});
