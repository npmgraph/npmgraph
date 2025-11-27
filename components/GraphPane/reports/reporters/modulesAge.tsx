import simplur from 'simplur';
import { cn } from '../../../../lib/dom.js';
import { Selectable } from '../../../Selectable.js';
import type { RenderedAnalysis } from '../Analyzer.js';
import type { ModuleAgeAnalysisState } from '../analyzeModules.js';
import * as styles from './modulesAge.module.scss';

function formatAge(publishDate: number): string {
  const now = Date.now();
  const ageMs = now - publishDate;

  const days = Math.floor(ageMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return simplur`${years} year[|s] ago`;
  } else if (months > 0) {
    return simplur`${months} month[|s] ago`;
  } else if (days > 0) {
    return simplur`${days} day[|s] ago`;
  } else {
    return 'Today';
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toISOString().split('T')[0];
}

export function modulesAge({ modulesWithAge }: ModuleAgeAnalysisState) {
  if (modulesWithAge.length === 0) return;

  // Sort by age (newest first)
  const sortedModules = [...modulesWithAge].sort((a, b) => {
    if (a.publishDate && b.publishDate) {
      return b.publishDate - a.publishDate;
    }
    if (a.publishDate) return -1;
    if (b.publishDate) return 1;
    return 0;
  });

  const details = sortedModules.map(({ module, publishDate }) => {
    return (
      <div className={cn(styles.root, 'zebra-row')} key={module.key}>
        <Selectable className={styles.name} type="exact" value={module.key} />
        <span className={styles.age}>
          {publishDate ? (
            <>
              <span className={styles.relativeAge}>
                {formatAge(publishDate)}
              </span>
              <span className={styles.absoluteDate}>
                ({formatDate(publishDate)})
              </span>
            </>
          ) : (
            <span className={styles.unknown}>Age unknown</span>
          )}
        </span>
      </div>
    );
  });

  const summary = simplur`Module ages (${modulesWithAge.length} module[|s])`;
  return { type: 'info', summary, details } as RenderedAnalysis;
}
