import simplur from 'simplur';
import { cn } from '../../../../lib/dom.js';
import { Selectable } from '../../../Selectable.js';
import { RenderedAnalysis } from '../Analyzer.js';
import { ModuleAnalysisState } from '../analyzeModules.js';
import styles from './modulesRenderAll.module.scss';

export function renderAllModules({
  moduleInfos,
  entryModules,
}: ModuleAnalysisState): RenderedAnalysis {
  const details = Array.from(moduleInfos.values())
    .sort((a, b) => a.module.key.localeCompare(b.module.key))
    .map(({ module }) => {
      return (
        <div className={cn(styles.row, 'zebra-row')} key={module.key}>
          <Selectable
            className={cn(styles.name, {
              [styles.entry]: entryModules.has(module),
            })}
            type="exact"
            value={module.key}
          />
        </div>
      );
    });

  const summary = simplur`All modules (${entryModules.size} top level,  ${
    moduleInfos.size - entryModules.size
  } dependenc[y|ies])`;

  return { type: 'info', summary, details };
}
