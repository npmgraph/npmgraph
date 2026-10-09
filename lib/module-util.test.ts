import { describe, expect, it } from 'vitest';
import { resolveGitHubShorthand } from './module-util.ts';

describe('resolveGitHubShorthand', () => {
  it('converts user/repo to a package.json URL', () => {
    expect(resolveGitHubShorthand('npmgraph/npmgraph')).toBe(
      'https://github.com/npmgraph/npmgraph/blob/HEAD/package.json',
    );
    expect(resolveGitHubShorthand('some-user/some.repo_name')).toBe(
      'https://github.com/some-user/some.repo_name/blob/HEAD/package.json',
    );
  });

  it.each([
    'react',
    'react@18.2.0',
    '@scope/name',
    '@scope/name@1.0.0',
    'https://github.com/npmgraph/npmgraph/blob/main/package.json',
    'user/repo/extra',
    './relative/path',
  ])('leaves %s alone', key => {
    expect(resolveGitHubShorthand(key)).toBe(key);
  });
});
