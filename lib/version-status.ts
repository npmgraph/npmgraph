import simplur from 'simplur';
import { isGreaterThan, tryParse } from 'verkit';

export type VersionStatus =
  | {
      type: 'outdated';
      level: 'major' | 'minor' | 'patch' | 'prerelease';
      // How many versions of that level the module is behind
      behind: number;
      latest: string;
    }
  | { type: 'tag'; tag: string }
  | { type: 'none' };

/**
 Compares a version to the `latest` dist-tag. Returns `null` if either can't
 be compared.
 */
export function getVersionStatus(
  version: string,
  distTags: Record<string, string | undefined>,
): VersionStatus | null {
  const versionParts = tryParse(version);
  const { latest } = distTags;
  const latestParts = latest && tryParse(latest);
  if (!versionParts || !latest || !latestParts) {
    return null;
  }

  // Use isGreaterThan so prerelease versions are handled correctly
  // (e.g. 1.0.0-rc.12 < 1.0.0 even though major/minor/patch are all 0).
  if (isGreaterThan(latest, version)) {
    const major = latestParts.major - versionParts.major;
    if (major > 0) {
      return { type: 'outdated', level: 'major', behind: major, latest };
    }

    const minor = latestParts.minor - versionParts.minor;
    if (minor > 0) {
      return { type: 'outdated', level: 'minor', behind: minor, latest };
    }

    const patch = latestParts.patch - versionParts.patch;
    if (patch > 0) {
      return { type: 'outdated', level: 'patch', behind: patch, latest };
    }

    // Prerelease behind the stable release of the same version
    return { type: 'outdated', level: 'prerelease', behind: 0, latest };
  }

  // Not outdated: the dist-tag the version is pinned to (e.g. "latest")
  const tag = Object.entries(distTags).find(([, v]) => v === version)?.[0];
  return tag ? { type: 'tag', tag } : { type: 'none' };
}

export function getOutdatedMessage({
  level,
  behind,
}: Extract<VersionStatus, { type: 'outdated' }>) {
  switch (level) {
    case 'major':
      return simplur`${behind} major version[|s] behind`;
    case 'minor':
      return simplur`${behind} minor version[|s] behind`;
    case 'patch':
      return simplur`${behind} patch version[|s] behind`;
    case 'prerelease':
      return 'prerelease, behind';
  }
}
