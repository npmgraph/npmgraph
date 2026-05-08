import simplur from 'simplur';
import { cn } from '../../../../lib/dom.ts';
import { Selectable } from '../../../Selectable.tsx';
import type { RenderedAnalysis } from '../Analyzer.tsx';
import type { ModuleAnalysisState } from '../analyzeModules.ts';
import * as reportItemStyles from '../ReportItem.module.scss';
import * as styles from './modulesAll.module.scss';

export function modulesAll({ moduleInfos, entryModules }: ModuleAnalysisState) {
  if (moduleInfos.size === 0) {
    return;
  }

  const details = Array.from(moduleInfos.values())
    .sort((a, b) => a.module.key.localeCompare(b.module.key))
    .map(({ module }) => {
      return (
        <div
          className={cn(styles.row, reportItemStyles.zebraRow)}
          key={module.key}
        >
          <Selectable
            className={cn(styles.name, {
              [styles.entry]: entryModules.has(module),
            })}
            value={module.key}
          />
        </div>
      );
    });

  const summary = simplur`All modules (${entryModules.size} top level,  ${
    moduleInfos.size - entryModules.size
  } dependenc[y|ies])`;

  return { type: 'info', summary, details } as RenderedAnalysis;
}
