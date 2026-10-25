import { describe, expect, it } from 'vitest';
import { parseCustomModuleLinks } from './module-links.ts';

describe('parseCustomModuleLinks', () => {
  it('parses CSV links and expands raw and encoded package keys', () => {
    expect(
      parseCustomModuleLinks(
        'npmx,https://npmx.dev/package/%s\nencoded,https://example.com/%e',
        '@scope/name',
      ),
    ).toEqual([
      {
        label: 'npmx',
        href: 'https://npmx.dev/package/@scope/name',
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
        'npmx:https://npmx.dev/package/%s\nbad,javascript:alert(1)\ninvalid',
        'react',
      ),
    ).toEqual([]);
  });

  it('handles quoted CSV fields containing commas', () => {
    expect(
      parseCustomModuleLinks(
        '"npm, x","https://example.com/search?q=a,b"',
        'react',
      ),
    ).toEqual([
      {
        label: 'npm, x',
        href: 'https://example.com/search?q=a,b',
      },
    ]);
  });
});
