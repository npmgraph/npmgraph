import md5 from 'md5';
import type { ReactElement } from 'react';
import simplur from 'simplur';
import { QueryType } from '../../../../lib/ModuleCache.ts';
import { cn } from '../../../../lib/dom.ts';
import { Selectable } from '../../../Selectable.tsx';
import type { RenderedAnalysis } from '../Analyzer.tsx';
import type { MaintainerAnalysisState } from '../analyzeMaintainers.tsx';
import * as styles from './maintainersAll.module.scss';

export function maintainersAll({
  modulesByMaintainer,
  emailByMaintainer,
}: MaintainerAnalysisState) {
  const details = Array.from(modulesByMaintainer.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, modules]) => {
      const email = emailByMaintainer.get(name);
      let img: ReactElement | null = null;
      if (email) {
        img = (
          <img
            loading="lazy"
            src={`https://www.gravatar.com/avatar/${md5(email)}?s=32`}
          />
        );
      }

      return (
        <div className={cn(styles.root, 'zebra-row')} key={name}>
          <div className={styles.maintainer}>
            {img}
            <Selectable type={QueryType.Maintainer} value={name} />
          </div>

          <div className={styles.modules}>
            {[...modules.values()].map(m => (
              <Selectable value={m.key} key={m.key} />
            ))}
          </div>
        </div>
      );
    });

  if (details.length <= 0) return;

  const summary = simplur`All maintainers (${details.length})`;
  return { type: 'info', summary, details } as RenderedAnalysis;
}
