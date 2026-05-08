import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { isOptionalPeerDependency } from './peer_dependency_util.ts';

describe('isOptionalPeerDependency', () => {
  it('returns true when a peer dependency is marked optional', () => {
    assert.equal(
      isOptionalPeerDependency(
        {
          react: { optional: true },
        },
        'react',
      ),
      true,
    );
  });

  it('returns false when a peer dependency is not marked optional', () => {
    assert.equal(
      isOptionalPeerDependency(
        {
          react: {},
        },
        'react',
      ),
      false,
    );
  });

  it('returns false when metadata does not include the dependency', () => {
    assert.equal(isOptionalPeerDependency({}, 'react'), false);
  });
});
