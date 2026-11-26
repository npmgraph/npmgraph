import { describe, expect, it } from 'vitest';
import {
  describeUrlSource,
  normalizeQueryKey,
  resolveGitHubShorthand,
} from './module-util.ts';

describe('resolveGitHubShorthand', () => {
  it('converts user/repo to a package.json URL', () => {
    expect(resolveGitHubShorthand('npmgraph/npmgraph')).toBe(
      'https://github.com/npmgraph/npmgraph/blob/HEAD/package.json',
    );
    expect(resolveGitHubShorthand('some-user/some.repo_name')).toBe(
      'https://github.com/some-user/some.repo_name/blob/HEAD/package.json',
    );
  });

  it('converts refs including slash-containing branch names', () => {
    expect(resolveGitHubShorthand('npmgraph/npmgraph#drop-hooks')).toBe(
      'https://github.com/npmgraph/npmgraph/blob/drop-hooks/package.json',
    );
    expect(resolveGitHubShorthand('user/repo#Feature/Branch')).toBe(
      'https://github.com/user/repo/blob/Feature%2FBranch/package.json',
    );
  });

  it.each([
    'react',
    'react@18.2.0',
    '@scope/name',
    '@scope/name@1.0.0',
    'https://github.com/npmgraph/npmgraph/blob/main/package.json',
    'user/repo/extra',
    'user/repo#',
    'user/repo#invalid ref',
    './relative/path',
  ])('leaves %s alone', key => {
    expect(resolveGitHubShorthand(key)).toBe(key);
  });
});

describe('normalizeQueryKey', () => {
  it('preserves case-sensitive GitHub refs and URLs', () => {
    expect(normalizeQueryKey('User/Repo#Feature/Branch')).toBe(
      'user/repo#Feature/Branch',
    );
    expect(normalizeQueryKey('HTTPS://example.com/Package.json')).toBe(
      'HTTPS://example.com/Package.json',
    );
    expect(normalizeQueryKey('React@Latest')).toBe('react@latest');
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
    const describeRef = (ref: string) =>
      describeUrlSource(
        new URL(
          `https://raw.githubusercontent.com/user/repo/${ref}/package.json`,
        ),
      );

    expect(describeRef('v1.0.0')).toBe('user/repo#v1.0.0');
    expect(describeRef('feature-branch')).toBe('user/repo#feature-branch');
    expect(describeRef('main')).toBe('user/repo');
    expect(describeRef('master')).toBe('user/repo');
    expect(describeRef('HEAD')).toBe('user/repo');
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

  it('describes refs/heads and encoded branch names', () => {
    expect(
      describeUrlSource(
        new URL(
          'https://raw.githubusercontent.com/user/repo/refs/heads/drop-hooks/package.json',
        ),
      ),
    ).toBe('user/repo#drop-hooks');
    expect(
      describeUrlSource(
        new URL(
          'https://raw.githubusercontent.com/user/repo/Feature%2FBranch/package.json',
        ),
      ),
    ).toBe('user/repo#Feature/Branch');
    expect(
      describeUrlSource(
        new URL(
          'https://raw.githubusercontent.com/user/repo/feature+one&two/package.json',
        ),
      ),
    ).toBe('user/repo#feature+one&two');
  });

  it('prints other URLs without the protocol', () => {
    expect(
      describeUrlSource(new URL('https://example.com/some/package.json')),
    ).toBe('example.com/some/package.json');
  });
});
