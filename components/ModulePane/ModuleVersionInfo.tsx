import simplur from 'simplur';
import { cn } from '../../lib/dom.ts';
import type Module from '../../lib/Module.ts';
import {
  getVersionStatus,
  type VersionStatus,
} from '../../lib/version-status.ts';
import { QueryLink } from '../ui/QueryLink.tsx';
import * as styles from './ModuleVersionInfo.module.scss';

const outdatedClassNames = {
  major: styles.majorUpdates,
  minor: styles.minorUpdates,
  patch: styles.patchUpdates,
  prerelease: styles.patchUpdates,
};

function getOutdatedMessage({
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

export function ModuleVersionInfo({
  module,
  ...props
}: { module: Module } & React.HTMLAttributes<HTMLDivElement>) {
  if (!module.packument) {
    return null;
  }

  const status = getVersionStatus(
    module.version,
    module.packument['dist-tags'],
  );
  if (!status) {
    return null;
  }

  let content = null;
  let updateClassName = '';
  if (status.type === 'outdated') {
    updateClassName = outdatedClassNames[status.level];
    content = (
      <>
        {getOutdatedMessage(status)} <code>latest</code> (
        <QueryLink query={module.packument.name}>{status.latest}</QueryLink>)
      </>
    );
  } else if (status.type === 'tag') {
    // Not outdated, so show the dist-tag the version is pinned to
    updateClassName = styles.distTag;
    content = (
      <>
        (<code>{status.tag}</code>)
      </>
    );
  }

  return (
    <p
      className={cn(styles.moduleVersion, updateClassName, props.className)}
      {...props}
    >
      {content}
    </p>
  );
}
