import useGraph from '../../hooks/useGraph.ts';
import useReportOnly from '../../hooks/useReportOnly.ts';
import { cn } from '../../lib/dom.ts';
import { Button } from '../Button.tsx';
import { Pane } from '../ui/Pane.tsx';
import { AnalysisProvider } from './analyzers/AnalysisProvider.tsx';
import CollapsedModules from './CollapsedModules.tsx';
import * as styles from './ReportPane.module.scss';
import { LicensesAllReport } from './reports/LicensesAll.tsx';
import { LicensesDiscouragedReport } from './reports/LicensesDiscouraged.tsx';
import { LicensesMissingReport } from './reports/LicensesMissing.tsx';
import { LicensesObsoleteReport } from './reports/LicensesObsolete.tsx';
import { MaintainersAllReport } from './reports/MaintainersAll.tsx';
import { MaintainersSoloReport } from './reports/MaintainersSolo.tsx';
import { ModuleReplacementsNativeReport } from './reports/ModuleReplacementsNative.tsx';
import { ModuleVulnerabilitiesReport } from './reports/ModuleVulnerabilities.tsx';
import { ModulesAllReport } from './reports/ModulesAll.tsx';
import { ModulesDeprecatedReport } from './reports/ModulesDeprecated.tsx';
import { ModulesOutdatedReport } from './reports/ModulesOutdated.tsx';
import { ModulesRepeatedReport } from './reports/ModulesRepeated.tsx';
import { PeerDependenciesAllReport } from './reports/PeerDependenciesAll.tsx';
import { PeerDependenciesMissingReport } from './reports/PeerDependenciesMissing.tsx';

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
        <ModulesAllReport />
        <PeerDependenciesAllReport />
        <MaintainersAllReport />
        <LicensesAllReport />
        <LicensesObsoleteReport />

        <ModuleVulnerabilitiesReport />
        <ModulesRepeatedReport />
        <ModulesDeprecatedReport />
        <ModulesOutdatedReport />

        <MaintainersSoloReport />
        <LicensesMissingReport />
        <LicensesDiscouragedReport />
        <ModuleReplacementsNativeReport />
        <PeerDependenciesMissingReport />
      </AnalysisProvider>
    </Pane>
  );
}
