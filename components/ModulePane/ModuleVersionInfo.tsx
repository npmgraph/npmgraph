import simplur from 'simplur';
import { cn } from '../../lib/dom.ts';
import type Module from '../../lib/Module.ts';
import type { VersionStatus } from '../../lib/version-status.ts';
import { QueryLink } from '../ui/QueryLink.tsx';
import * as listStyles from '../ReportPane/reports/ModuleList.module.css';
import * as styles from './ModuleVersionInfo.module.css';
import { getStatus } from './module-status.ts';

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
}: { module: Module } & React.HTMLAttributes<HTMLSpanElement>) {
  const status = getStatus(module);
  return status?.type === 'tag' ? (
    <span {...props} className={cn(styles.distTag, props.className)}>
      {status.tag}
    </span>
  ) : null;
}

export function ModuleOutdated({
  module,
  ...props
}: { module: Module } & React.HTMLAttributes<HTMLDivElement>) {
  const status = getStatus(module);
  if (status?.type !== 'outdated' || !module.packument) {
    return null;
  }

  return (
    <div {...props}>
      <dt>Outdated</dt>
      <dd className={listStyles.details}>
        {getOutdatedMessage(status)} <code>latest</code> (
        <QueryLink query={module.packument.name}>{status.latest}</QueryLink>)
      </dd>
    </div>
  );
}
