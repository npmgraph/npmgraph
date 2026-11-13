import useGraph from '../../hooks/useGraph.ts';
import useReportOnly from '../../hooks/useReportOnly.ts';
import { cn } from '../../lib/dom.ts';
import { Button } from '../Button.tsx';
import { Pane } from '../ui/Pane.tsx';
import AnalysisProvider from './analyzers/AnalysisProvider.tsx';
import CollapsedModules from './CollapsedModules.tsx';
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
            <div className={styles.description}>
              You can view a shareable report without the graph
            </div>
            <Button
              onClick={() => {
                setReportOnly(true);
              }}
            >
              Report only
            </Button>
          </div>
          <CollapsedModules />
        </>
      )}
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
    </Pane>
  );
}
