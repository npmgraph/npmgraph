import { type MaintainerAnalysisState } from '../analyzers/analyzeMaintainers.ts';
import { maintainersDetails } from './maintainersDetails.tsx';
import { useMaintainerAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem, type RenderedAnalysis } from '../ReportItem.tsx';
import { ExternalLink } from '../../ui/ExternalLink.tsx';

function maintainersSolo({
  soloModulesByMaintainer,
  soloModulesCount,
  emailByMaintainer,
}: MaintainerAnalysisState) {
  // Same as all maintainers, but only the subset of data for solo maintainers
  const details = maintainersDetails({
    modulesByMaintainer: soloModulesByMaintainer,
    emailByMaintainer,
  });

  if (details.length === 0) {
    return;
  }

  return {
    type: 'warn',
    summary: 'Modules with only one maintainer',
    count: soloModulesCount,
    details,
  } as RenderedAnalysis;
}

export default function MaintainersSolo() {
  const data = useMaintainerAnalysis();

  return (
    <ReportItem data={data} reporter={maintainersSolo}>
      Modules with a single maintainer are at risk of "unplanned abandonment".
      See{' '}
      <ExternalLink href="https://en.wikipedia.org/wiki/Bus_factor">
        Bus factor
      </ExternalLink>
      .
    </ReportItem>
  );
}
