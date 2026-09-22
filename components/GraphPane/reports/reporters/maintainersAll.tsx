import md5 from 'md5';
import type { ReactElement } from 'react';
import simplur from 'simplur';
import { QueryType } from '../../../../lib/ModuleCache.ts';
import { cn } from '../../../../lib/dom.ts';
import { Selectable } from '../../../Selectable.tsx';
import type { RenderedAnalysis } from '../Analyzer.tsx';
import type { MaintainerAnalysisState } from '../analyzeMaintainers.tsx';
import * as reportItemStyles from '../ReportItem.module.scss';
import * as styles from './maintainersAll.module.scss';

export function maintainersAll({
  modulesByMaintainer,
  emailByMaintainer,
}: MaintainerAnalysisState) {
  const details = [...modulesByMaintainer]
    .toSorted(([a], [b]) => a.localeCompare(b))
    .map(([name, modules]) => {
      const email = emailByMaintainer.get(name);
      let img: ReactElement | undefined;
      if (email) {
        img = (
          <img
            loading="lazy"
            alt={`${name}'s avatar`}
            src={`https://www.gravatar.com/avatar/${md5(email)}?s=32`}
          />
        );
      }

      return (
        <div key={name} className={cn(styles.root, reportItemStyles.zebraRow)}>
          <div className={styles.maintainer}>
            {img}
            <Selectable type={QueryType.Maintainer} value={name} />
          </div>

          <div className={styles.modules}>
            {[...modules].map(m => (
              <Selectable
                key={m.key}
                value={m.key}
                className={styles.selectable}
              />
            ))}
          </div>
        </div>
      );
    });

  if (details.length === 0) {
    return;
  }

  const summary = simplur`All maintainers (${details.length})`;
  return { type: 'info', summary, details } as RenderedAnalysis;
}
