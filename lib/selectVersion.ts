import type { Packument, PackumentVersion } from '@npm/types';
import { gt, satisfies } from 'semver';

export default function selectVersion(
  packument: Packument,
  targetVersion = 'latest',
): PackumentVersion | undefined {
  if (!packument.versions) {
    return undefined;
  }

  let selectedVersion: string | undefined;

  // If version matches a dist-tag (e.g. "latest", "best", etc), use that
  const distVersion = packument['dist-tags']?.[targetVersion];
  if (distVersion) {
    selectedVersion = distVersion;
  } else {
    // Find highest matching version
    for (const version of Object.keys(packument.versions)) {
      if (!satisfies(version, targetVersion)) continue;
      if (!selectedVersion || gt(version, selectedVersion)) {
        selectedVersion = version;
      }
    }
  }

  return selectedVersion ? packument.versions[selectedVersion] : undefined;
}
