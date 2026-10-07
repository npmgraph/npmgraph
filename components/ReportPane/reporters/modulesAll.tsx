import simplur from 'simplur';
import { cn } from '../../../lib/dom.ts';
import { Selectable } from '../../ui/Selectable.tsx';
import type { RenderedAnalysis } from '../analyzers/Analyzer.tsx';
import type { ModuleAnalysisState } from '../analyzers/analyzeModules.ts';
import * as reportItemStyles from '../ReportItem.module.scss';
import * as styles from './modulesAll.module.scss';

export function modulesAll({ moduleInfos, entryModules }: ModuleAnalysisState) {
  if (moduleInfos.size === 0) {
    return;
  }

  const details = [...moduleInfos.values()]
    .toSorted((a, b) => a.module.key.localeCompare(b.module.key))
    .map(({ module }) => (
      <div
        key={module.key}
        className={cn(styles.row, reportItemStyles.zebraRow)}
      >
        <Selectable
          className={cn(styles.name, {
            [styles.entry]: entryModules.has(module),
          })}
          value={module.key}
        />
      </div>
    ));

  const count = simplur`${entryModules.size} top level, ${
    moduleInfos.size - entryModules.size
  } dependenc[y|ies]`;

  return {
    type: 'info',
    summary: 'Modules',
    count,
    details,
  } as RenderedAnalysis;
}
