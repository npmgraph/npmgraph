import { cn } from '../../../lib/dom.ts';
import { Selectable } from '../../ui/Selectable.tsx';
import {
  groupOutdatedByLevel,
  type ModuleAnalysisState,
} from '../analyzers/analyzeModules.ts';
import * as styles from './ModulesOutdated.module.scss';
import { useModuleAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem, type RenderedAnalysis } from '../ReportItem.tsx';

const levelTitles = {
  major: 'Major',
  minor: 'Minor',
  patch: 'Patch',
};

function modulesOutdated({ outdated }: ModuleAnalysisState) {
  const groups = groupOutdatedByLevel(outdated);
  if (groups.length === 0) {
    return;
  }

  const details = groups.flatMap(([level, modules]) => [
    <h4 key={level} className={styles.level}>
      {levelTitles[level]} ({modules.length})
    </h4>,
    ...modules.map(({ module, status }, index) => (
      <div
        key={module.key}
        className={cn(styles.root, { [styles.striped]: index % 2 === 1 })}
      >
        <Selectable
          value={module.key}
          label={module.label}
          className={styles.selectable}
        />
        {' → '}
        {status.latest}
      </div>
    )),
  ]);

  return {
    type: 'warn',
    summary: 'Outdated modules',
    count: groups.reduce((total, [, modules]) => total + modules.length, 0),
    details,
  } as RenderedAnalysis;
}

export default function ModulesOutdated() {
  const data = useModuleAnalysis();

  return (
    <ReportItem data={data} reporter={modulesOutdated}>
      These modules are behind the <code>latest</code> version on npm. Newer
      versions may include bug and security fixes. If an update is held back by
      the version constraint of another module, consider asking{' '}
      <em>upstream</em> module owners to update.
    </ReportItem>
  );
}
