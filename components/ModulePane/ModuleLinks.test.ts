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

  it('rejects colon-separated links and non-HTTP URLs', () => {
    expect(
      parseCustomModuleLinks(
        'npmx:https://npmx.dev/package/{name}\nbad,javascript:alert(1)\ninvalid',
        'react',
        '18.2.0',
      ),
    ).toEqual([]);
  });

  it('handles quoted CSV fields containing commas', () => {
    expect(
      parseCustomModuleLinks(
        '"npm, x","https://example.com/search?q=a,b"',
        'react',
        '18.2.0',
      ),
    ).toEqual([
      {
        label: 'npm, x',
        href: 'https://example.com/search?q=a,b',
      },
    ]);
  });

  it('validates non-empty rows as two-column HTTP(S) CSV', () => {
    expect(
      getCustomModuleLinksError(
        'npmx,https://npmx.dev/package/{name}@{version}\n"bundle,phobia",https://bundlephobia.com/package/{name}@{version}',
      ),
    ).toBe('');
    expect(getCustomModuleLinksError('not-csv')).toBeTruthy();
    expect(getCustomModuleLinksError('extra,columns,are invalid')).toBeTruthy();
    expect(getCustomModuleLinksError('npmx,ftp://example.com')).toBeTruthy();
    expect(
      getCustomModuleLinksError('npmx,https://example.com/{unknown}'),
    ).toBeTruthy();
    expect(
      getCustomModuleLinksError('npmx,https://example.com/%s'),
    ).toBeTruthy();
  });
});
