import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { resolveGitHubShorthand } from './module_util.ts';

describe('resolveGitHubShorthand', () => {
  it('should resolve user/repo to raw GitHub package.json URL', () => {
    const result = resolveGitHubShorthand('npmgraph/npmgraph');
    assert.equal(
      result,
      'https://raw.githubusercontent.com/npmgraph/npmgraph/HEAD/package.json',
    );
  });

  it('should resolve generic user/repo shorthand', () => {
    const result = resolveGitHubShorthand('user/repo');
    assert.equal(
      result,
      'https://raw.githubusercontent.com/user/repo/HEAD/package.json',
    );
  });

  it('should resolve github: prefix shorthand', () => {
    const result = resolveGitHubShorthand('github:user/repo');
    assert.equal(
      result,
      'https://raw.githubusercontent.com/user/repo/HEAD/package.json',
    );
  });

  it('should return undefined for plain npm package names', () => {
    assert.equal(resolveGitHubShorthand('lodash'), undefined);
    assert.equal(resolveGitHubShorthand('react'), undefined);
  });

  it('should return undefined for scoped npm packages', () => {
    assert.equal(resolveGitHubShorthand('@scope/pkg'), undefined);
    assert.equal(resolveGitHubShorthand('@babel/core'), undefined);
  });

  it('should return undefined for HTTP URLs', () => {
    assert.equal(
      resolveGitHubShorthand(
        'https://github.com/user/repo/blob/HEAD/package.json',
      ),
      undefined,
    );
  });
});
