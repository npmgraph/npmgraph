import { describe, expect, it } from 'vitest';
import { describeUrlSource, resolveGitHubShorthand } from './module-util.ts';

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

describe('describeUrlSource', () => {
  it('describes GitHub repos as user/repo', () => {
    expect(
      describeUrlSource(
        new URL(
          'https://raw.githubusercontent.com/refined-github/refined-github/HEAD/package.json',
        ),
      ),
    ).toBe('refined-github/refined-github');
  });

  it('ignores the directory and ref of GitHub repos', () => {
    expect(
      describeUrlSource(
        new URL(
          'https://raw.githubusercontent.com/user/repo/v1.0.0/packages/foo/package.json',
        ),
      ),
    ).toBe('user/repo');
  });

  it('prints other URLs without the protocol', () => {
    expect(
      describeUrlSource(new URL('https://example.com/some/package.json')),
    ).toBe('example.com/some/package.json');
  });
});
