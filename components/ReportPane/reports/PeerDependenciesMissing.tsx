import { usePeerDependencyAnalysis } from '../analyzers/useAnalysis.ts';
import { ReportItem, type RenderedAnalysis } from '../ReportItem.tsx';
import type { PeerDependenciesState } from '../analyzers/analyzePeerDependencies.ts';
import { peerDependenciesDetails } from './peerDependenciesDetails.tsx';

function peerDependenciesMissing({
  peerDependencyInfos,
}: PeerDependenciesState) {
  const missingInfos = peerDependencyInfos.filter(
    pdi => !pdi.destination && !pdi.optional,
  );
  if (missingInfos.length === 0) {
    return;
  }

  return {
    type: 'warn',
    summary: 'Missing peer dependencies',
    count: missingInfos.length,
    details: peerDependenciesDetails(missingInfos),
  } as RenderedAnalysis;
}

export default function PeerDependenciesMissing() {
  const data = usePeerDependencyAnalysis();

  return <ReportItem data={data} reporter={peerDependenciesMissing} />;
}
