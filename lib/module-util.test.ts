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

  it('includes the ref unless it is the default branch', () => {
    const describe = (ref: string) =>
      describeUrlSource(
        new URL(
          `https://raw.githubusercontent.com/user/repo/${ref}/package.json`,
        ),
      );

    expect(describe('v1.0.0')).toBe('user/repo#v1.0.0');
    expect(describe('feature-branch')).toBe('user/repo#feature-branch');
    expect(describe('main')).toBe('user/repo');
    expect(describe('master')).toBe('user/repo');
    expect(describe('HEAD')).toBe('user/repo');
  });

  it('ignores the directory of GitHub repos', () => {
    expect(
      describeUrlSource(
        new URL(
          'https://raw.githubusercontent.com/user/repo/v1.0.0/packages/foo/package.json',
        ),
      ),
    ).toBe('user/repo#v1.0.0');
  });

  it('prints other URLs without the protocol', () => {
    expect(
      describeUrlSource(new URL('https://example.com/some/package.json')),
    ).toBe('example.com/some/package.json');
  });
});
