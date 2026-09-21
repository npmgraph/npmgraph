import type { Packument, PackumentVersion } from '@npm/types';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import selectVersion from './selectVersion.ts';

describe('selectVersion', () => {
  const mockPackument = {
    name: 'test-package',
    'dist-tags': {
      latest: '2.0.0',
      beta: '2.1.0-beta.1',
    },
    versions: {
      '1.0.0': { name: 'test-package', version: '1.0.0' } as PackumentVersion,
      '1.1.0': { name: 'test-package', version: '1.1.0' } as PackumentVersion,
      '2.0.0': { name: 'test-package', version: '2.0.0' } as PackumentVersion,
      '2.1.0-beta.1': {
        name: 'test-package',
        version: '2.1.0-beta.1',
      } as PackumentVersion,
    },
  } as unknown as Packument;

  it('should select dist-tag latest by default', () => {
    const result = selectVersion(mockPackument);
    assert.equal(result?.version, '2.0.0');
  });

  it('should select specified dist-tag', () => {
    const result = selectVersion(mockPackument, 'beta');
    assert.equal(result?.version, '2.1.0-beta.1');
  });

  it('should select highest version satisfying semver range', () => {
    const result = selectVersion(mockPackument, '^1.0.0');
    assert.equal(result?.version, '1.1.0');
  });

  it('should select exact version match', () => {
    const result = selectVersion(mockPackument, '1.0.0');
    assert.equal(result?.version, '1.0.0');
  });

  it('should return undefined if no version satisfies range', () => {
    const result = selectVersion(mockPackument, '^3.0.0');
    assert.equal(result, undefined);
  });

  it('should return undefined when packument.versions is undefined (unpublished packages)', () => {
    const unpublishedPackument = {
      name: 'unpublished-pkg',
      time: {
        unpublished: {
          name: 'some-user',
          time: '2020-04-24T05:32:00.672Z',
          tags: {},
        },
      },
    } as unknown as Packument;

    const result = selectVersion(unpublishedPackument);
    assert.equal(result, undefined);
  });

  it('should return undefined when dist-tag points to non-existent version', () => {
    const packumentWithBrokenTag = {
      name: 'broken-tag',
      'dist-tags': {
        latest: '9.9.9',
      },
      versions: {
        '1.0.0': { name: 'broken-tag', version: '1.0.0' } as PackumentVersion,
      },
    } as unknown as Packument;

    const result = selectVersion(packumentWithBrokenTag, 'latest');
    assert.equal(result, undefined);
  });
});
