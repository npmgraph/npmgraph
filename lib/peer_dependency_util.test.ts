import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { isOptionalPeerDependency } from './peer_dependency_util.ts';

void describe('isOptionalPeerDependency', () => {
  void it('returns true when a peer dependency is marked optional', () => {
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

  void it('returns false when a peer dependency is not marked optional', () => {
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

  void it('returns false when metadata does not include the dependency', () => {
    assert.equal(isOptionalPeerDependency({}, 'react'), false);
  });

  void it('returns false when peerDependenciesMeta is undefined', () => {
    assert.equal(isOptionalPeerDependency(undefined, 'react'), false);
  });

  void it('returns false when optional is explicitly false', () => {
    assert.equal(
      isOptionalPeerDependency(
        {
          react: { optional: false },
        },
        'react',
      ),
      false,
    );
  });
});
