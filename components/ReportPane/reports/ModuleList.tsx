import { use } from 'react';
import useReportOnly from '../../../hooks/useReportOnly.ts';
import { cn } from '../../../lib/dom.ts';
import type Module from '../../../lib/Module.ts';
import { Selectable } from '../../ui/Selectable.tsx';
import { ModuleFilterContext } from '../ModuleFilterContext.ts';
import * as reportItemStyles from '../ReportItem.module.scss';
import * as styles from './ModuleList.module.scss';

export function ModuleList({
  modules,
  entryModules,
}: {
  modules: Module[];
  entryModules: Set<Module>;
}) {
  const filter = use(ModuleFilterContext);
  const [isReportOnly] = useReportOnly();
  // The report-only view lists everything
  const query = isReportOnly ? '' : filter.trim().toLowerCase();
  const filteredModules = query
    ? modules.filter(module => module.label.toLowerCase().includes(query))
    : modules;

  return (
    <>
      {filteredModules.length === 0 && (
        <div className={styles.empty}>No modules match</div>
      )}

      {filteredModules.map(module => (
        <div
          key={module.key}
          className={cn(styles.row, reportItemStyles.zebraRow)}
        >
          <Selectable
            className={cn(styles.name, {
              [styles.entry]: entryModules.has(module),
            })}
            value={module.key}
            label={module.label}
          />
        </div>
      ))}
    </>
  );
}
