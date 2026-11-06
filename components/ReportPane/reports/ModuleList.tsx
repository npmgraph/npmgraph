import { use } from 'react';
import useReportOnly from '../../../hooks/useReportOnly.ts';
import type Module from '../../../lib/Module.ts';
import { ModuleFilterContext } from '../ModuleFilterContext.ts';
import { ModuleRows } from '../../ui/Row.tsx';
import * as styles from './ModuleList.module.css';

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

      <ModuleRows modules={filteredModules} bold={entryModules} />
    </>
  );
}
