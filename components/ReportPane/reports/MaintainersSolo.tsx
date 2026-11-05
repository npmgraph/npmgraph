import { useMaintainerAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem } from '../ReportItem.tsx';
import { ExternalLink } from '../../ui/ExternalLink.tsx';
import { MaintainerRows } from './MaintainerRows.tsx';

export default function MaintainersSolo() {
  const { soloModulesByMaintainer, soloModulesCount, emailByMaintainer } =
    useMaintainerAnalysis();

  if (soloModulesByMaintainer.size === 0) {
    return null;
  }

  return (
    <ReportItem
      type="warn"
      title="Modules with only one maintainer"
      count={soloModulesCount}
      description={
        <>
          Modules with a single maintainer are at risk of "unplanned
          abandonment". See{' '}
          <ExternalLink href="https://en.wikipedia.org/wiki/Bus_factor">
            Bus factor
          </ExternalLink>
          .
        </>
      }
    >
      <MaintainerRows
        modulesByMaintainer={soloModulesByMaintainer}
        emailByMaintainer={emailByMaintainer}
      />
    </ReportItem>
  );
}
