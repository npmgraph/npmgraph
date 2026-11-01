import {
  type MaintainerAnalysisState,
  analyzeMaintainers,
} from '../analyzers/analyzeMaintainers.ts';
import { maintainersAll } from './MaintainersAll.tsx';
import type { GraphState } from '../../../lib/graph-util.ts';
import { ReportItem, type RenderedAnalysis } from '../ReportItem.tsx';
import { ExternalLink } from '../../ui/ExternalLink.tsx';

function maintainersSolo({
  soloModulesByMaintainer,
  soloModulesCount,
  emailByMaintainer,
}: MaintainerAnalysisState) {
  // Use renderAll logic, but with only the subset of data for solo maintainers
  const results = maintainersAll({
    modulesByMaintainer: soloModulesByMaintainer,
    soloModulesByMaintainer,
    soloModulesCount,
    emailByMaintainer,
  });

  if (!results) {
    return;
  }

  return {
    type: 'warn',
    summary: 'Modules with only one maintainer',
    count: soloModulesCount,
    details: results.details,
  } as RenderedAnalysis;
}

export function MaintainersSoloReport({ graph }: { graph: GraphState }) {
  return (
    <ReportItem data={analyzeMaintainers(graph)} reporter={maintainersSolo}>
      Modules with a single maintainer are at risk of "unplanned abandonment".
      See{' '}
      <ExternalLink href="https://en.wikipedia.org/wiki/Bus_factor">
        Bus factor
      </ExternalLink>
      .
    </ReportItem>
  );
}
