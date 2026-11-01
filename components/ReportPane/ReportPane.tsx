import useGraph from '../../hooks/useGraph.ts';
import useReportOnly from '../../hooks/useReportOnly.ts';
import { cn } from '../../lib/dom.ts';
import { Button } from '../Button.tsx';
import { Pane } from '../ui/Pane.tsx';
import AnalysisProvider from './analyzers/AnalysisProvider.tsx';
import CollapsedModules from './CollapsedModules.tsx';
import * as styles from './ReportPane.module.scss';
import LicensesAll from './reports/LicensesAll.tsx';
import LicensesDiscouraged from './reports/LicensesDiscouraged.tsx';
import LicensesMissing from './reports/LicensesMissing.tsx';
import LicensesObsolete from './reports/LicensesObsolete.tsx';
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

  return (
    <Pane
      className={cn(className, { [styles.document]: isReportOnly })}
      {...props}
    >
      {!isReportOnly && (
        <>
          <Button
            className={styles.expand}
            onClick={() => {
              setReportOnly(true);
            }}
          >
            Report only
          </Button>
          <CollapsedModules />
        </>
      )}
      <AnalysisProvider>
        <ModulesAll />
        <PeerDependenciesAll />
        <MaintainersAll />
        <LicensesAll />
        <LicensesObsolete />

        <ModuleVulnerabilities />
        <ModulesRepeated />
        <ModulesDeprecated />
        <ModulesOutdated />

        <MaintainersSolo />
        <LicensesMissing />
        <LicensesDiscouraged />
        <ModuleReplacementsNative />
        <PeerDependenciesMissing />
      </AnalysisProvider>
    </Pane>
  );
}
