import { describe, expect, it } from 'vitest';
import {
  getCustomModuleLinksError,
  parseCustomModuleLinks,
} from './module-links.ts';

describe('parseCustomModuleLinks', () => {
  it('omits links to the registry for modules not loaded from it', () => {
    expect(
      parseCustomModuleLinks(
        'npm,https://www.npmjs.com/package/{+name}/v/{version}\nrepo,{repository}\nwebsite,{homepage}\npackage.json,https://unpkg.com/{+name}@{version}/package.json',
        {
          name: 'refined-github',
          version: '0.0.0',
          repository: 'https://github.com/refined-github/refined-github',
          homepage: 'https://example.com',
          fromRegistry: false,
        },
      ),
    ).toEqual([
      {
        label: 'repo',
        href: 'https://github.com/refined-github/refined-github',
      },
      { label: 'website', href: 'https://example.com/' },
    ]);
  });

  it('keeps links to the registry for modules loaded from it', () => {
    expect(
      parseCustomModuleLinks(
        'npm,https://www.npmjs.com/package/{+name}/v/{version}',
        { name: 'express', version: '5.0.0', fromRegistry: true },
      ),
    ).toEqual([
      { label: 'npm', href: 'https://www.npmjs.com/package/express/v/5.0.0' },
    ]);
  });

  it('expands name and version as RFC 6570 simple variables', () => {
    expect(
      parseCustomModuleLinks(
        'npmx,https://npmx.dev/package/{name}@{version}\nencoded,https://example.com/{name}',
        { name: '@scope/name', version: '1.2.3' },
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
        { name: '@eslint/css', version: '1.2.3' },
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
      parseCustomModuleLinks('repo, {repository}\nwebsite, {homepage}', {
        name: '@eslint/css',
        version: '1.2.3',
        repository: 'https://github.com/eslint/css',
        homepage: 'https://eslint.org',
      }),
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
      parseCustomModuleLinks('repo, {repository}\nwebsite, {homepage}', {
        name: 'react',
        version: '18.2.0',
      }),
    ).toEqual([]);
  });

  it('rejects colon-separated links and non-HTTP URLs', () => {
    expect(
      parseCustomModuleLinks(
        'npmx:https://npmx.dev/package/{name}\nbad,javascript:alert(1)\ninvalid',
        { name: 'react', version: '18.2.0' },
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
