import { QueryType } from '../../../lib/ModuleCache.ts';
import { cn } from '../../../lib/dom.ts';
import { Gravatar } from '../../ui/Gravatar.tsx';
import { Selectable } from '../../ui/Selectable.tsx';
import { type MaintainerAnalysisState } from '../analyzers/analyzeMaintainers.ts';
import * as reportItemStyles from '../ReportItem.module.scss';
import * as styles from './MaintainersAll.module.scss';
import { useMaintainerAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem, type RenderedAnalysis } from '../ReportItem.tsx';

export function maintainersAll({
  modulesByMaintainer,
  emailByMaintainer,
}: MaintainerAnalysisState) {
  const details = [...modulesByMaintainer]
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

  if (details.length === 0) {
    return;
  }

  return {
    type: 'info',
    summary: 'Maintainers',
    count: details.length,
    details,
  } as RenderedAnalysis;
}

export default function MaintainersAll() {
  const data = useMaintainerAnalysis();

  return <ReportItem data={data} reporter={maintainersAll} />;
}
