import { cn } from '../../../lib/dom.ts';
import { Selectable } from '../../ui/Selectable.tsx';
import type { RenderedAnalysis } from '../analyzers/Analyzer.tsx';
import {
  groupOutdatedByLevel,
  type ModuleAnalysisState,
} from '../analyzers/analyzeModules.ts';
import * as styles from './modulesOutdated.module.scss';

const levelTitles = {
  major: 'Major',
  minor: 'Minor',
  patch: 'Patch',
};

export function modulesOutdated({ outdated }: ModuleAnalysisState) {
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
