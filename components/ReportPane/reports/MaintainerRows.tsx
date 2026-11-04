import { QueryType } from '../../../lib/ModuleCache.ts';
import { cn } from '../../../lib/dom.ts';
import { Gravatar } from '../../ui/Gravatar.tsx';
import { Selectable } from '../../ui/Selectable.tsx';
import type { MaintainerAnalysisState } from '../analyzers/analyzeMaintainers.ts';
import * as reportItemStyles from '../ReportItem.module.scss';
import * as styles from './MaintainersAll.module.scss';

export function MaintainerRows({
  modulesByMaintainer,
  emailByMaintainer,
}: Pick<MaintainerAnalysisState, 'modulesByMaintainer' | 'emailByMaintainer'>) {
  return [...modulesByMaintainer]
    .toSorted(([a], [b]) => a.localeCompare(b))
    .map(([name, modules]) => {
      const email = emailByMaintainer.get(name);

      return (
        <div key={name} className={cn(styles.root, reportItemStyles.zebraRow)}>
          <div className={styles.maintainer}>
            {email && <Gravatar email={email} username={name} />}
            <Selectable type={QueryType.Maintainer} value={name} />
          </div>

          <div className={styles.modules}>
            {[...modules].map(m => (
              <Selectable
                key={m.key}
                value={m.key}
                label={m.label}
                className={styles.selectable}
              />
            ))}
          </div>
        </div>
      );
    });
}
