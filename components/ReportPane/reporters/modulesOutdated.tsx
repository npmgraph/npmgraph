import { cn } from '../../../lib/dom.ts';
import { Selectable } from '../../ui/Selectable.tsx';
import type { RenderedAnalysis } from '../analyzers/Analyzer.tsx';
import type { ModuleAnalysisState } from '../analyzers/analyzeModules.ts';
import * as reportItemStyles from '../ReportItem.module.scss';
import * as styles from './modulesOutdated.module.scss';

// Most outdated first
const levelOrder = ['major', 'minor', 'patch', 'prerelease'];

export function modulesOutdated({ outdated }: ModuleAnalysisState) {
  if (outdated.length === 0) {
    return;
  }

  const details = outdated
    .toSorted(
      (a, b) =>
        levelOrder.indexOf(a.status.level) -
          levelOrder.indexOf(b.status.level) ||
        a.module.name.localeCompare(b.module.name),
    )
    .map(({ module, status }) => (
      <div
        key={module.key}
        className={cn(styles.root, reportItemStyles.zebraRow)}
      >
        <Selectable value={module.key} className={styles.selectable} />
        {': '}
        <code>latest</code> is {status.latest}
      </div>
    ));

  return {
    type: 'warn',
    summary: 'Outdated modules',
    count: outdated.length,
    details,
  } as RenderedAnalysis;
}
