import simplur from 'simplur';
import { cn } from '../../../../lib/dom.ts';
import { Selectable } from '../../../Selectable.tsx';
import type { RenderedAnalysis } from '../Analyzer.tsx';
import type { ModuleAnalysisState } from '../analyzeModules.ts';
import * as styles from './modulesDeprecated.module.scss';

export function modulesDeprecated({ deprecated }: ModuleAnalysisState) {
  if (deprecated.length <= 0) return;

  const details = deprecated
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(module => {
      return (
        <div className={cn(styles.root, 'zebra-row')} key={module.key}>
          <Selectable value={module.key} />
          {': '}
          <span className={styles.body}>
            &rdquo;{module.package.deprecated}&ldquo;
          </span>
        </div>
      );
    });

  const summary = simplur`Deprecated modules (${deprecated.length})`;
  return { type: 'warn', summary, details } as RenderedAnalysis;
}
