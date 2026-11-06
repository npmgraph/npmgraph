import { useState } from 'react';
import useGraph from '../../hooks/useGraph.ts';
import useGraphSelection from '../../hooks/useGraphSelection.ts';
import useReportOnly from '../../hooks/useReportOnly.ts';
import { cn } from '../../lib/dom.ts';
import { QueryType } from '../../lib/ModuleCache.ts';
import { Button } from '../Button.tsx';
import { Pane } from '../ui/Pane.tsx';
import AnalysisProvider from './analyzers/AnalysisProvider.tsx';
import CollapsedModules from './CollapsedModules.tsx';
import { ModuleFilterContext } from './ModuleFilterContext.ts';
import * as styles from './ReportPane.module.scss';
import LicensesAll from './reports/LicensesAll.tsx';
import LicensesMissing from './reports/LicensesMissing.tsx';
import LicensesKeyword from './reports/LicensesKeyword.tsx';
import MaintainersAll from './reports/MaintainersAll.tsx';
import MaintainersSolo from './reports/MaintainersSolo.tsx';
import ModuleReplacementsNative from './reports/ModuleReplacementsNative.tsx';
import ModuleVulnerabilities from './reports/ModuleVulnerabilities.tsx';
import ModulesAll from './reports/ModulesAll.tsx';
import ModulesDeprecated from './reports/ModulesDeprecated.tsx';
import ModulesOutdated from './reports/ModulesOutdated.tsx';
import ModulesRepeated from './reports/ModulesRepeated.tsx';
import PeerDependenciesAll from './reports/PeerDependenciesAll.tsx';
import PeerDependenciesMissing from './reports/PeerDependenciesMissing.tsx';

export default function ReportPane({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const graph = useGraph();
  const [isReportOnly, setReportOnly] = useReportOnly();
  const [selectType, selectValue, setGraphSelection] = useGraphSelection();
  const [filter, setFilter] = useState(
    selectType === QueryType.Search ? selectValue : '',
  );

  if (!graph.moduleInfos) {
    return <div>Loading</div>;
  }

  if (graph.moduleInfos.size === 0) {
    return (
      <Pane centered className={className} {...props}>
        <p>No modules to report on.</p>
      </Pane>
    );
  }

  return (
    <Pane
      className={cn(className, { [styles.document]: isReportOnly })}
      {...props}
    >
      {!isReportOnly && (
        <>
          <div className={styles.toolbar}>
            <Button
              onClick={() => {
                setReportOnly(true);
              }}
            >
              Report only
            </Button>
          </div>
          <CollapsedModules />
          <input
            type="search"
            className={styles.filter}
            placeholder="Filter modules…"
            aria-label="Filter modules"
            value={filter}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            onChange={event => {
              const { value } = event.target;
              setFilter(value);
              // Highlight the matches in the graph too
              setGraphSelection(
                value.trim() ? QueryType.Search : QueryType.Default,
                value.trim(),
              );
            }}
          />
        </>
      )}
      <ModuleFilterContext value={filter}>
        <AnalysisProvider>
          <ModulesAll />
          <PeerDependenciesAll />
          <MaintainersAll />
          <LicensesAll />

          <ModuleVulnerabilities />
          <ModulesDeprecated />
          <ModulesOutdated />
          <ModulesRepeated />
          <PeerDependenciesMissing />
          <MaintainersSolo />
          <LicensesMissing />
          <LicensesKeyword keyword="obsolete" />
          <LicensesKeyword keyword="discouraged" />
          <ModuleReplacementsNative />
        </AnalysisProvider>
      </ModuleFilterContext>
    </Pane>
  );
}
