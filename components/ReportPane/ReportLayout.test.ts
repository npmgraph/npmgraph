import { describe, expect, it } from 'vitest';
import { getHeadingId } from './ReportLayout.ts';

describe('getHeadingId', () => {
  it('creates GitHub-style slugs', () => {
    expect(getHeadingId('Modules')).toBe('modules');
    expect(getHeadingId('Modules with only one maintainer')).toBe(
      'modules-with-only-one-maintainer',
    );
    expect(getHeadingId('Suggested replacements')).toBe(
      'suggested-replacements',
    );
    expect(getHeadingId('"Obsolete" licenses (3)')).toBe('obsolete-licenses-3');
  });
});
