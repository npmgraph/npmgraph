import simplur from 'simplur';
import { cn } from '../../../../lib/dom.js';
import { Selectable } from '../../../Selectable.js';
import type { RenderedAnalysis } from '../Analyzer.js';
import type { ModuleAnalysisState } from '../analyzeModules.js';
import * as styles from './modulesDeprecated.module.scss';

export function modulesDeprecated({
  deprecated,
}: ModuleAnalysisState): RenderedAnalysis {
  if (deprecated.length <= 0) return;

  const details = deprecated
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(module => {
      return (
        <div className={cn(styles.root, 'zebra-row')} key={module.key}>
          <Selectable type="exact" value={module.key} />
          {': '}
          <span className={styles.body}>
            &rdquo;{module.package.deprecated}&ldquo;
          </span>
        </div>
      );
    });

  const summary = simplur`Deprecated modules (${deprecated.length})`;
  return { type: 'warn', summary, details };
}
