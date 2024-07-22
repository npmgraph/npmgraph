import React from 'react';
import { parse } from 'semver';
import simplur from 'simplur';
import Module from '../../lib/Module.js';

import { cn } from '../../lib/dom.js';
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
  if (!latestParts) {
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

  let content = null;
  let className = '';
  if (distTag) {
    className = 'dist-tag';
    content = (
      <>
        (<code>{distTag}</code>)
      </>
    );
  } else if (majorDiff !== 0 || minorDiff !== 0 || patchDiff !== 0) {
    let message;
    if (majorDiff !== 0) {
      className = majorDiff > 0 ? 'major-updates' : '';
      message =
        majorDiff > 0
          ? simplur`${majorDiff} major version[|s] behind`
          : simplur`${-majorDiff} major version[|s] ahead of`;
    } else if (minorDiff !== 0) {
      className = minorDiff > 0 ? 'minor-updates' : '';
      message =
        minorDiff > 0
          ? simplur`${minorDiff} minor version[|s] behind`
          : simplur`${-minorDiff} minor version[|s] ahead of`;
    } else if (patchDiff !== 0) {
      className = patchDiff > 0 ? 'patch-updates' : '';
      message =
        patchDiff > 0
          ? simplur`${patchDiff} patch version[|s] behind`
          : simplur`${-patchDiff} patch version[|s] ahead of`;
    }

    content = (
      <>
        {message} <code>latest</code> ({latestVersion})
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
