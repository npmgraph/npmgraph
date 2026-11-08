import simplur from 'simplur';
import { cn } from '../../lib/dom.ts';
import type Module from '../../lib/Module.ts';
import type { VersionStatus } from '../../lib/version-status.ts';
import WarningIcon from '../../images/icons/warning.svg?react';
import { QueryLink } from '../ui/QueryLink.tsx';
import * as styles from './ModuleVersionInfo.module.css';
import { getStatus } from './module-status.ts';
import * as warningStyles from './ModuleWarnings.module.css';

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

// Not outdated, so show the dist-tag the version is pinned to
export function ModuleDistTag({
  module,
  ...props
}: { module: Module } & React.HTMLAttributes<HTMLParagraphElement>) {
  const status = getStatus(module);
  return status?.type === 'tag' ? (
    <p {...props} className={cn(styles.distTag, props.className)}>
      (<code>{status.tag}</code>)
    </p>
  ) : null;
}

export function ModuleOutdated({
  module,
  ...props
}: { module: Module } & React.HTMLAttributes<HTMLParagraphElement>) {
  const status = getStatus(module);
  if (status?.type !== 'outdated' || !module.packument) {
    return null;
  }

  return (
    <p
      {...props}
      className={cn(
        warningStyles.warning,
        outdatedClassNames[status.level],
        props.className,
      )}
    >
      <WarningIcon />
      <span>
        Outdated: {getOutdatedMessage(status)} <code>latest</code> (
        <QueryLink query={module.packument.name}>{status.latest}</QueryLink>)
      </span>
    </p>
  );
}
