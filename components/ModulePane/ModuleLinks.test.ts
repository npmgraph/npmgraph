import { describe, expect, it } from 'vitest';
import { parseCustomModuleLinks } from './module-links.ts';

describe('parseCustomModuleLinks', () => {
  it('parses CSV links and expands raw and encoded package keys', () => {
    expect(
      parseCustomModuleLinks(
        'npmx,https://npmx.dev/package/%s\nencoded,https://example.com/%e',
        '@scope/name@1.0.0',
      ),
    ).toEqual([
      {
        label: 'npmx',
        href: 'https://npmx.dev/package/@scope/name@1.0.0',
      },
      {
        label: 'encoded',
        href: 'https://example.com/%40scope%2Fname%401.0.0',
      },
    ]);
  });

  it('accepts the label:url example format and ignores invalid entries', () => {
    expect(
      parseCustomModuleLinks(
        'npmx:https://npmx.dev/package/%s\nbad,javascript:alert(1)\ninvalid',
        'react@18.2.0',
      ),
    ).toEqual([
      {
        label: 'npmx',
        href: 'https://npmx.dev/package/react@18.2.0',
      },
    ]);
  });

  it('handles quoted CSV fields containing commas', () => {
    expect(
      parseCustomModuleLinks(
        '"npm, x","https://example.com/search?q=a,b"',
        'react@18.2.0',
      ),
    ).toEqual([
      {
        label: 'npm, x',
        href: 'https://example.com/search?q=a,b',
      },
    ]);
  });
});
