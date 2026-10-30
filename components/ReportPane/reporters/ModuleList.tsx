import { useState } from 'react';
import useReportOnly from '../../../hooks/useReportOnly.ts';
import { cn } from '../../../lib/dom.ts';
import type Module from '../../../lib/Module.ts';
import { Selectable } from '../../ui/Selectable.tsx';
import * as reportItemStyles from '../ReportItem.module.scss';
import * as styles from './ModuleList.module.scss';

const MIN_MODULES_FOR_FILTER = 10;

export function ModuleList({
  modules,
  entryModules,
}: {
  modules: Module[];
  entryModules: Set<Module>;
}) {
  const [filter, setFilter] = useState('');
  const [isReportOnly] = useReportOnly();
  // The report-only view lists everything
  const canFilter = !isReportOnly && modules.length >= MIN_MODULES_FOR_FILTER;

  const query = canFilter ? filter.trim().toLowerCase() : '';
  const filteredModules = query
    ? modules.filter(module => module.key.toLowerCase().includes(query))
    : modules;

  return (
    <>
      {canFilter && (
        <div className={styles.filter}>
          <input
            type="search"
            className={styles.input}
            placeholder="Filter modules…"
            aria-label="Filter modules"
            value={filter}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            onChange={event => {
              setFilter(event.target.value);
            }}
          />
        </div>
      )}

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
          />
        </div>
      ))}
    </>
  );
}
