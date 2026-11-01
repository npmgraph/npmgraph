import useReportOnly from '../../hooks/useReportOnly.ts';
import { cn } from '../../lib/dom.ts';
import type { GraphState } from '../../lib/graph-util.ts';
import { Button } from '../Button.tsx';
import { Pane } from '../ui/Pane.tsx';
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
  graph,
  className,
  ...props
}: { graph: GraphState | undefined } & React.HTMLAttributes<HTMLDivElement>) {
  const [isReportOnly, setReportOnly] = useReportOnly();

  if (!graph?.moduleInfos) {
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
      <ModulesAllReport graph={graph} />
      <PeerDependenciesAllReport graph={graph} />
      <MaintainersAllReport graph={graph} />
      <LicensesAllReport graph={graph} />
      <LicensesObsoleteReport graph={graph} />

      <ModuleVulnerabilitiesReport graph={graph} />
      <ModulesRepeatedReport graph={graph} />
      <ModulesDeprecatedReport graph={graph} />
      <ModulesOutdatedReport graph={graph} />

      <MaintainersSoloReport graph={graph} />
      <LicensesMissingReport graph={graph} />
      <LicensesDiscouragedReport graph={graph} />
      <ModuleReplacementsNativeReport graph={graph} />
      <PeerDependenciesMissingReport graph={graph} />
    </Pane>
  );
}
