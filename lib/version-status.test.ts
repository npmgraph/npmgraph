import { describe, expect, it } from 'vitest';
import { getOutdatedMessage, getVersionStatus } from './version-status.ts';

describe('getVersionStatus', () => {
  it('reports major, minor and patch versions behind', () => {
    expect(getVersionStatus('1.2.3', { latest: '3.0.0' })).toEqual({
      type: 'outdated',
      level: 'major',
      behind: 2,
      latest: '3.0.0',
    });
    expect(getVersionStatus('1.2.3', { latest: '1.5.0' })).toEqual({
      type: 'outdated',
      level: 'minor',
      behind: 3,
      latest: '1.5.0',
    });
    expect(getVersionStatus('1.2.3', { latest: '1.2.4' })).toEqual({
      type: 'outdated',
      level: 'patch',
      behind: 1,
      latest: '1.2.4',
    });
  });

  it('reports a prerelease behind its stable release', () => {
    expect(getVersionStatus('1.0.0-rc.12', { latest: '1.0.0' })).toEqual({
      type: 'outdated',
      level: 'prerelease',
      behind: 0,
      latest: '1.0.0',
    });
  });

  it('reports the dist-tag when up to date', () => {
    expect(getVersionStatus('2.0.0', { latest: '2.0.0' })).toEqual({
      type: 'tag',
      tag: 'latest',
    });
  });

  it('reports nothing for an untagged version that is not outdated', () => {
    expect(getVersionStatus('3.0.0', { latest: '2.0.0' })).toEqual({
      type: 'none',
    });
  });

  it('returns null if the versions can not be compared', () => {
    expect(getVersionStatus('not-a-version', { latest: '1.0.0' })).toBeNull();
    expect(getVersionStatus('1.0.0', {})).toBeNull();
    expect(getVersionStatus('1.0.0', { latest: 'nope' })).toBeNull();
  });
});

describe('getOutdatedMessage', () => {
  it('describes how far behind a module is', () => {
    const message = (version: string, latest: string) => {
      const status = getVersionStatus(version, { latest });
      return status?.type === 'outdated' ? getOutdatedMessage(status) : '';
    };

    expect(message('1.0.0', '2.0.0')).toBe('1 major version behind');
    expect(message('1.0.0', '1.3.0')).toBe('3 minor versions behind');
    expect(message('1.0.0', '1.0.1')).toBe('1 patch version behind');
    expect(message('1.0.0-rc.1', '1.0.0')).toBe('prerelease, behind');
  });
});
