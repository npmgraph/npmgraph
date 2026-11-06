import { Row, Rows } from '../../ui/Row.tsx';
import { Selectable } from '../../ui/Selectable.tsx';
import { groupOutdatedByLevel } from '../analyzers/analyzeModules.ts';
import * as styles from './ModulesOutdated.module.scss';
import { useModuleAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';

const levelTitles = {
  major: 'Major',
  minor: 'Minor',
  patch: 'Patch',
};

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
      description={
        <>
          These modules are behind the <code>latest</code> version on npm. Newer
          versions may include bug and security fixes. If an update is held back
          by the version constraint of another module, consider asking{' '}
          <em>upstream</em> module owners to update.
        </>
      }
    >
      {groups.map(([level, modules]) => (
        <div key={level} className={styles.group}>
          <h4 className={styles.level}>
            {levelTitles[level]} ({modules.length})
          </h4>
          <Rows>
            {modules.map(({ module, status }) => (
              <Row key={module.key}>
                <Selectable value={module.key} label={module.label} />
                <span>→ {status.latest}</span>
              </Row>
            ))}
          </Rows>
        </div>
      ))}
    </ReportItem>
  );
}
