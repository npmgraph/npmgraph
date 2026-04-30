import { gt, parse } from 'semver';
import simplur from 'simplur';
import type Module from '../../lib/Module.ts';

import { cn } from '../../lib/dom.ts';
import { QueryLink } from '../QueryLink.tsx';
import './ModuleVersionInfo.scss';

export function ModuleVersionInfo({
  module,
  ...props
}: { module: Module } & React.HTMLAttributes<HTMLDivElement>) {
  if (!module.packument) {
    return null;
  }

  const versionParts = parse(module.version);
  if (!versionParts) {
    return null;
  }

  const latestVersion = module.packument['dist-tags'].latest;
  const latestParts = parse(latestVersion);
  if (!latestVersion || !latestParts) {
    return null;
  }

  const majorDiff = latestParts.major - versionParts.major;
  const minorDiff = latestParts.minor - versionParts.minor;
  const patchDiff = latestParts.patch - versionParts.patch;

  let distTag;
  if (module.packument) {
    for (const [tag, version] of Object.entries(
      module.packument['dist-tags'],
    )) {
      if (version === module.version) {
        distTag = tag;
        break;
      }
    }
  }

  // Use semver.gt for the outdated check so prerelease versions are handled
  // correctly (e.g. 1.0.0-rc.12 < 1.0.0 even though major/minor/patch are all 0).
  const isOutdated = gt(latestVersion, module.version);

  let content = null;
  let className = '';
  if (isOutdated) {
    let message;
    if (majorDiff > 0) {
      className = 'major-updates';
      message = simplur`${majorDiff} major version[|s] behind`;
    } else if (minorDiff > 0) {
      className = 'minor-updates';
      message = simplur`${minorDiff} minor version[|s] behind`;
    } else if (patchDiff > 0) {
      className = 'patch-updates';
      message = simplur`${patchDiff} patch version[|s] behind`;
    } else {
      // prerelease behind the stable release of the same version
      className = 'patch-updates';
      message = 'prerelease, behind';
    }

    const latestLink = (
      <QueryLink query={module.packument.name}>{latestVersion}</QueryLink>
    );
    content = (
      <>
        {message} <code>latest</code> ({latestLink})
      </>
    );
  } else if (distTag) {
    // Not outdated – show the dist-tag the version is pinned to (e.g. "latest")
    className = 'dist-tag';
    content = (
      <>
        (<code>{distTag}</code>)
      </>
    );
  }

  return (
    <p
      id="module-version"
      className={cn(className, props.className)}
      {...props}
    >
      {content}
    </p>
  );
}
