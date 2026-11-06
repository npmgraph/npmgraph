import { useState } from 'react';
import useReportOnly from '../../../hooks/useReportOnly.ts';
import type Module from '../../../lib/Module.ts';
import { ModuleRows } from '../../ui/Row.tsx';
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
    ? modules.filter(module => module.label.toLowerCase().includes(query))
    : modules;

  return (
    <>
      {canFilter && (
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
      )}

      {filteredModules.length === 0 && (
        <div className={styles.empty}>No modules match</div>
      )}

      <ModuleRows modules={filteredModules} bold={entryModules} />
    </>
  );
}
