import { Fragment } from 'react';
import { cn } from '../../../lib/dom.ts';
import { Selectable } from '../../ui/Selectable.tsx';
import {
  groupOutdatedByLevel,
  type OutdatedModule,
} from '../analyzers/analyzeModules.ts';
import * as styles from './ModulesOutdated.module.css';
import { useModuleAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';

const levelTitles = {
  major: 'Major',
  minor: 'Minor',
  patch: 'Patch',
};

function Row({
  module,
  status,
  isStriped,
}: OutdatedModule & { isStriped: boolean }) {
  return (
    <div className={cn(styles.root, { [styles.striped]: isStriped })}>
      <Selectable
        value={module.key}
        label={module.label}
        className={styles.selectable}
      />
      {' → '}
      {status.latest}
    </div>
  );
}

export default function ModulesOutdated() {
  const { outdated } = useModuleAnalysis();
  const groups = groupOutdatedByLevel(outdated);

  if (groups.length === 0) {
    return null;
  }

  return (
    <ReportItem
      type="warn"
      title="Outdated modules"
      count={groups.reduce((total, [, modules]) => total + modules.length, 0)}
    >
      <p>
        These modules are behind the <code>latest</code> version on npm. Newer
        versions may include bug and security fixes. If an update is held back
        by the version constraint of another module, consider asking{' '}
        <em>upstream</em> module owners to update.
      </p>
      {groups.map(([level, modules]) => (
        <Fragment key={level}>
          <h4 className={styles.level}>
            {levelTitles[level]} ({modules.length})
          </h4>
          {modules.map((outdatedModule, index) => (
            <Row
              key={outdatedModule.module.key}
              {...outdatedModule}
              isStriped={index % 2 === 1}
            />
          ))}
        </Fragment>
      ))}
    </ReportItem>
  );
}
