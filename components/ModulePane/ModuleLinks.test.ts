import { describe, expect, it } from 'vitest';
import {
  getCustomModuleLinksError,
  parseCustomModuleLinks,
} from './module-links.ts';

describe('parseCustomModuleLinks', () => {
  it('expands name and version as RFC 6570 simple variables', () => {
    expect(
      parseCustomModuleLinks(
        'npmx,https://npmx.dev/package/{name}@{version}\nencoded,https://example.com/{name}',
        '@scope/name',
        '1.2.3',
      ),
    ).toEqual([
      {
        label: 'npmx',
        href: 'https://npmx.dev/package/%40scope%2Fname@1.2.3',
      },
      {
        label: 'encoded',
        href: 'https://example.com/%40scope%2Fname',
      },
    ]);
  });

  it('supports reserved expansion for scoped package names', () => {
    expect(
      parseCustomModuleLinks(
        'encoded,https://example.com/{name}\nraw,https://example.com/{+name}',
        '@eslint/css',
        '1.2.3',
      ),
    ).toEqual([
      {
        label: 'encoded',
        href: 'https://example.com/%40eslint%2Fcss',
      },
      {
        label: 'raw',
        href: 'https://example.com/@eslint/css',
      },
    ]);
  });

  it('expands repository and homepage variables without encoding their URLs', () => {
    expect(
      parseCustomModuleLinks(
        'repo, {repository}\nwebsite, {homepage}',
        '@eslint/css',
        '1.2.3',
        {
          repository: 'https://github.com/eslint/css',
          homepage: 'https://eslint.org',
        },
      ),
    ).toEqual([
      {
        label: 'repo',
        href: 'https://github.com/eslint/css',
      },
      {
        label: 'website',
        href: 'https://eslint.org/',
      },
    ]);

    expect(
      parseCustomModuleLinks(
        'repo, {repository}\nwebsite, {homepage}',
        'react',
        '18.2.0',
      ),
    ).toEqual([]);
  });

  it('rejects colon-separated links and non-HTTP URLs', () => {
    expect(
      parseCustomModuleLinks(
        'npmx:https://npmx.dev/package/{name}\nbad,javascript:alert(1)\ninvalid',
        'react',
        '18.2.0',
      ),
    ).toEqual([]);
  });

  it('validates non-empty rows as two-column HTTP(S) CSV', () => {
    expect(
      getCustomModuleLinksError(
        'npmx,https://npmx.dev/package/{name}@{version}\nbundlephobia,https://bundlephobia.com/package/{name}@{version}',
      ),
    ).toBe('');
    expect(getCustomModuleLinksError('not-csv')).toBeTruthy();
    expect(getCustomModuleLinksError('extra,columns,are invalid')).toBeTruthy();
    expect(getCustomModuleLinksError('npmx,ftp://example.com')).toBeTruthy();
    expect(
      getCustomModuleLinksError('npmx,https://example.com/{unknown}'),
    ).toBeTruthy();
    expect(getCustomModuleLinksError('npmx,https://example.com/{+name}')).toBe(
      '',
    );
  });
});
